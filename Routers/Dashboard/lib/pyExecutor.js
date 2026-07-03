import { spawn } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

const BLOCKED_PATTERNS = [
  /\bimport\s+os\b/, /\bimport\s+sys\b/, /\bimport\s+subprocess\b/,
  /\bimport\s+shutil\b/, /\bimport\s+socket\b/, /\bimport\s+ctypes\b/,
  /\bfrom\s+os\b/, /\bfrom\s+sys\b/, /\bfrom\s+subprocess\b/,
  /\b__import__\s*\(/, /\beval\s*\(/, /\bexec\s*\(/, /\bcompile\s*\(/,
  /\bopen\s*\(/, /\bglobals\s*\(/, /\blocals\s*\(/,
  /\bimportlib\b/, /\binput\s*\(/,
]

function containsBlockedCode(code) {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      return { blocked: true, reason: `Restricted usage detected: ${pattern.source}` }
    }
  }
  return { blocked: false }
}

function buildHarness(studentCode, functionName, testCaseParsed) {
  return `
import json
import resource
import sys

# Resource limits - real safety net (CPU seconds, memory bytes)
resource.setrlimit(resource.RLIMIT_CPU, (2, 2))
resource.setrlimit(resource.RLIMIT_AS, (128 * 1024 * 1024, 128 * 1024 * 1024))

${studentCode}

__test_cases = ${JSON.stringify(testCaseParsed)}
__results = {}

for __id, __input in __test_cases.items():
    try:
        __args = __input.get("args", []) if isinstance(__input, dict) else (__input if isinstance(__input, list) else [__input])
        __results[__id] = ${functionName}(*__args)
    except Exception as e:
        __results[__id] = {"error": str(e)}

sys.stdout.write(json.dumps(__results))
`
}

export function runPython(studentCode, functionName, testCaseParsed, opts = {}) {
  const { timeoutMs = 5000 } = opts

  return new Promise((resolve) => {
    const check = containsBlockedCode(studentCode)
    if (check.blocked) {
      resolve({ stdout: '', stderr: check.reason, code: 1 })
      return
    }

    const harness = buildHarness(studentCode, functionName, testCaseParsed)
    const tmpFile = path.join(os.tmpdir(), `run_${Date.now()}_${Math.random().toString(36).slice(2)}.py`)
    fs.writeFileSync(tmpFile, harness)

    const child = spawn('python3', [tmpFile], {
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
