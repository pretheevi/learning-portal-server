import { spawn } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import * as acorn from 'acorn'
import * as walk from 'acorn-walk'

const BLOCKED_IDENTIFIERS = new Set([
  'require', 'process', 'global', 'globalThis',
  'module', 'exports', '__dirname', '__filename',
  'Function', 'eval',
])

function containsBlockedCode(code) {
  let ast
  try {
    ast = acorn.parse(code, { ecmaVersion: 2022, sourceType: 'script' })
  } catch (e) {
    return { blocked: true, reason: `Syntax error: ${e.message}` }
  }

  let blocked = null

  walk.simple(ast, {
    Identifier(node) {
      if (BLOCKED_IDENTIFIERS.has(node.name)) {
        blocked = `Use of restricted identifier: ${node.name}`
      }
    },
    ImportExpression() { blocked = 'Dynamic import is not allowed' },
    ImportDeclaration() { blocked = 'Import statements are not allowed' },
    MemberExpression(node) {
      if (node.property?.name === 'constructor') {
        blocked = 'Access to restricted property: constructor'
      }
    },
  })

  return blocked ? { blocked: true, reason: blocked } : { blocked: false }
}

function buildHarness(studentCode, functionName, testCaseParsed) {
  return `
'use strict';
${studentCode}

const __testCases = ${JSON.stringify(testCaseParsed)};
const __results = {};

for (const [id, input] of Object.entries(__testCases)) {
  try {
    const args = Array.isArray(input?.args) ? input.args : (Array.isArray(input) ? input : [input]);
    __results[id] = ${functionName}(...args);
  } catch (e) {
    __results[id] = { error: e.message };
  }
}

process.stdout.write(JSON.stringify(__results));
`
}

export function runJavaScript(studentCode, functionName, testCaseParsed, opts = {}) {
  const { timeoutMs = 5000, memoryMb = 128 } = opts

  return new Promise((resolve) => {
    const check = containsBlockedCode(studentCode)
    if (check.blocked) {
      resolve({ stdout: '', stderr: check.reason, code: 1 })
      return
    }

    const harness = buildHarness(studentCode, functionName, testCaseParsed)
    const tmpFile = path.join(os.tmpdir(), `run_${Date.now()}_${Math.random().toString(36).slice(2)}.js`)
    fs.writeFileSync(tmpFile, harness)

    const child = spawn('node', [`--max-old-space-size=${memoryMb}`, tmpFile], {
      timeout: timeoutMs,
      killSignal: 'SIGKILL',
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (d) => (stdout += d))
    child.stderr.on('data', (d) => (stderr += d))

    child.on('close', (exitCode, signal) => {
      fs.unlink(tmpFile, () => {})
      if (signal === 'SIGKILL') {
        resolve({ stdout: '', stderr: 'Time limit exceeded', code: 1 })
      } else {
        resolve({ stdout, stderr, code: exitCode })
      }
    })

    child.on('error', (err) => {
      fs.unlink(tmpFile, () => {})
      resolve({ stdout: '', stderr: err.message, code: 1 })
    })
  })
}

