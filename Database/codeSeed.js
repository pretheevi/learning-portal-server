// jsCodeSeed.js
import db from './connectDb.js'
import { randomUUID } from 'crypto'

async function jsCodeSeed() {
  try {
    await db.exec('PRAGMA foreign_keys = ON')

    const assignment_id = randomUUID()
    const skill_type = 'javascript'
    const type = 'coding'

    // Same order_num pattern as the quiz seed: next order within this skill_type
    const maxOrder = await db.get(
      `SELECT COALESCE(MAX(order_num), 0) as max_order FROM assignments WHERE skill_type = ?`,
      [skill_type]
    )
    const order_num = maxOrder.max_order + 1

    // Same "is this the first assignment of this type+skill?" check as the quiz seed
    const existing = await db.get(
      `SELECT COUNT(*) as count FROM assignments WHERE skill_type = ? AND type = ?`,
      [skill_type, type]
    )
    const isFirst = existing.count === 0

    const stmts = []

    // NOTE: assignments table has no `description` column — using
    // `title` + `skill_type` (both contain "javascript") for filtering.
    stmts.push({
      sql: `
        INSERT INTO assignments (
          assignment_id, title, date, type, skill_type, order_num
        )
        VALUES (?, ?, DATE('now'), ?, ?, ?)
      `,
      args: [assignment_id, 'JavaScript Coding Practice - Basics', type, skill_type, order_num],
    })

    const problems = [
      {
        title: 'Sum of Two Numbers',
        function_name: 'solve',
        description: 'Write a JavaScript function solve(a, b) that returns the sum of two given numbers.',
        difficulty: 'easy',
        examples: [
          {
            input: JSON.stringify({ args: [2, 3] }),
            output: '5',
            explanation: '2 + 3 = 5',
            order: 1,
          },
          {
            input: JSON.stringify({ args: [10, 15] }),
            output: '25',
            explanation: '',
            order: 2,
          },
        ],
        testcases: [
          [JSON.stringify({ args: [2, 3] }), '5'],
          [JSON.stringify({ args: [10, 15] }), '25'],
          [JSON.stringify({ args: [7, 8] }), '15'],
          [JSON.stringify({ args: [100, 200] }), '300'],
          [JSON.stringify({ args: [0, 0] }), '0'],
          [JSON.stringify({ args: [-5, 5] }), '0'],
          [JSON.stringify({ args: [-10, -20] }), '-30'],
          [JSON.stringify({ args: [999, 1] }), '1000'],
        ],
      },
      {
        title: 'Reverse a String',
        function_name: 'solve',
        description: 'Write a JavaScript function solve(str) that returns the input string reversed.',
        difficulty: 'easy',
        examples: [
          {
            input: JSON.stringify({ args: ['hello'] }),
            output: 'olleh',
            explanation: '',
            order: 1,
          },
          {
            input: JSON.stringify({ args: ['JavaScript'] }),
            output: 'tpircSavaJ',
            explanation: '',
            order: 2,
          },
        ],
        testcases: [
          [JSON.stringify({ args: ['hello'] }), 'olleh'],
          [JSON.stringify({ args: ['JavaScript'] }), 'tpircSavaJ'],
          [JSON.stringify({ args: ['abc'] }), 'cba'],
          [JSON.stringify({ args: ['a'] }), 'a'],
          [JSON.stringify({ args: ['racecar'] }), 'racecar'],
          [JSON.stringify({ args: ['12345'] }), '54321'],
          [JSON.stringify({ args: ['Node'] }), 'edoN'],
          [JSON.stringify({ args: ['x'] }), 'x'],
        ],
      },
      {
        title: 'Find Maximum in Array',
        function_name: 'solve',
        description: 'Write a JavaScript function solve(arr) that returns the largest number in the given array.',
        difficulty: 'medium',
        examples: [
          {
            input: JSON.stringify({ args: [[3, 7, 2, 9, 4]] }),
            output: '9',
            explanation: '9 is the largest',
            order: 1,
          },
          {
            input: JSON.stringify({ args: [[-5, -1, -8]] }),
            output: '-1',
            explanation: '',
            order: 2,
          },
        ],
        testcases: [
          [JSON.stringify({ args: [[3, 7, 2, 9, 4]] }), '9'],
          [JSON.stringify({ args: [[-5, -1, -8]] }), '-1'],
          [JSON.stringify({ args: [[1, 1, 1]] }), '1'],
          [JSON.stringify({ args: [[100, 200, 50, 300]] }), '300'],
          [JSON.stringify({ args: [[0]] }), '0'],
          [JSON.stringify({ args: [[-1, -2, -3, -4]] }), '-1'],
          [JSON.stringify({ args: [[5, 5, 5, 5]] }), '5'],
          [JSON.stringify({ args: [[42, 7, 19, 88, 3, 56]] }), '88'],
        ],
      },
    ]

    for (const problem of problems) {
      const problem_id = randomUUID()

      stmts.push({
        sql: `
            INSERT INTO coding_problems (
              problem_id,
              assignment_id,
              title,
              description,
              function_name,
              language,
              difficulty
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            problem_id,
            assignment_id,
            problem.title,
            problem.description,
            problem.function_name,
            'javascript',
            problem.difficulty,
          ],
      })

      for (const item of problem.examples) {
        stmts.push({
          sql: `
            INSERT INTO coding_problem_examples (
              example_id, problem_id, example_input, example_output, explanation, order_num
            )
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          args: [randomUUID(), problem_id, item.input, item.output, item.explanation, item.order],
        })
      }

      for (const item of problem.testcases) {
        stmts.push({
          sql: `
            INSERT INTO coding_problem_testcases (
              testcase_id, problem_id, testcase_input, testcase_expected_output, point, is_hidden
            )
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          args: [randomUUID(), problem_id, item[0], item[1], 1, 1],
        })
      }
    }

    // --- Access unlock logic (this is what was missing) ---
    const students = await db.all(`SELECT student_id FROM students`)
    for (const s of students) {
      stmts.push({
        sql: `
          INSERT OR IGNORE INTO student_assignment_access
            (access_id, student_id, assignment_id, is_unlocked, unlocked_at)
          VALUES (?, ?, ?, ?, ?)
        `,
        args: [
          randomUUID(),
          s.student_id,
          assignment_id,
          isFirst ? 1 : 0,
          isFirst ? new Date().toISOString() : null,
        ],
      })
    }

    // db.batch() runs everything atomically over HTTP — replaces
    // manual BEGIN/COMMIT/ROLLBACK, which isn't reliable with Turso's
    // Hrana/HTTP transport (each exec() call is a separate request).
    await db.batch(stmts)

    console.log(`✅ Assignment inserted: JavaScript Coding Practice - Basics (order_num: ${order_num})`)
    console.log(`📌 Is first coding assignment for javascript? ${isFirst}`)
    console.log(`✅ Access seeded for ${students.length} students (is_unlocked: ${isFirst ? 1 : 0})`)
    console.log('\n🎉 JavaScript coding seed inserted successfully')
  } catch (err) {
    console.error('❌ Seeding failed:', err.message)
    throw err
  }
}

jsCodeSeed()
