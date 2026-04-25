import connectDb from './connectDb.js'
import crypto from 'crypto'

async function codeSeed() {
  let db
  let transaction = false

  try {
    db = await connectDb()

    await db.exec('BEGIN')
    transaction = true

    const assignment_id = crypto.randomUUID()
    const problem_id = crypto.randomUUID()

    await db.run(
      `
      INSERT INTO assignments (
        assignment_id,
        title,
        date,
        type
      )
      VALUES (?, ?, DATE('now'), ?)
      `,
      [
        assignment_id,
        'JavaScript Coding Practice',
        'coding',
      ]
    )

    await db.run(
      `
      INSERT INTO coding_problems (
        problem_id,
        assignment_id,
        title,
        description,
        language,
        difficulty
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        problem_id,
        assignment_id,
        'Sum of Two Numbers',
        'Write a function solve(a, b) that returns the sum of two given numbers.',
        'javascript',
        'easy',
      ]
    )

    const examples = [
      {
        input: '2 3',
        output: '5',
        explanation: '2 + 3 = 5',
        order: 1,
      },
      {
        input: '10 15',
        output: '25',
        explanation: '',
        order: 2,
      },
    ]

    for (const item of examples) {
      await db.run(
        `
        INSERT INTO coding_problem_examples (
          example_id,
          problem_id,
          example_input,
          example_output,
          explanation,
          order_num
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          crypto.randomUUID(),
          problem_id,
          item.input,
          item.output,
          item.explanation,
          item.order,
        ]
      )
    }

    const testcases = [
      ['2 3', '5'],
      ['10 15', '25'],
      ['7 8', '15'],
      ['100 200', '300'],
    ]

    for (const item of testcases) {
      await db.run(
        `
        INSERT INTO coding_problem_testcases (
          testcase_id,
          problem_id,
          testcase_input,
          testcase_expected_output,
          point,
          is_hidden
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          crypto.randomUUID(),
          problem_id,
          item[0],
          item[1],
          1,
          1,
        ]
      )
    }

    await db.exec('COMMIT')
    transaction = false

    console.log('Coding seed inserted successfully')
  } catch (err) {
    if (db && transaction) {
      await db.exec('ROLLBACK')
    }

    console.log(err)
  }
}

codeSeed()
