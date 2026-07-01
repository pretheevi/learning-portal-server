// deleteJsCodeSeed.js
// Deletes the JavaScript coding assignment(s) and all dependent rows:
// coding_problems -> examples/testcases/submissions -> student_assignment_access -> assignments

import db from './connectDb.js'

async function deleteJsCodeSeed() {
  try {
    await db.exec('PRAGMA foreign_keys = ON')

    const skill_type = 'javascript'
    const type = 'coding'

    // Preview what will be deleted first
    const assignments = await db.all(
      `SELECT assignment_id, title, order_num FROM assignments WHERE skill_type = ? AND type = ?`,
      [skill_type, type]
    )

    if (assignments.length === 0) {
      console.log('No JavaScript coding assignments found. Nothing to delete.')
      return
    }

    console.log(`Found ${assignments.length} JavaScript coding assignment(s) to delete:`)
    for (const a of assignments) {
      console.log(`  - ${a.title} (${a.assignment_id}, order_num: ${a.order_num})`)
    }

    const problems = await db.all(
      `SELECT problem_id, title FROM coding_problems 
       WHERE assignment_id IN (SELECT assignment_id FROM assignments WHERE skill_type = ? AND type = ?)`,
      [skill_type, type]
    )
    console.log(`  Includes ${problems.length} coding problem(s):`)
    for (const p of problems) {
      console.log(`    - ${p.title} (${p.problem_id})`)
    }

    const stmts = [
      {
        sql: `
          DELETE FROM code_submissions
          WHERE problem_id IN (
            SELECT problem_id FROM coding_problems
            WHERE assignment_id IN (SELECT assignment_id FROM assignments WHERE skill_type = ? AND type = ?)
          )
        `,
        args: [skill_type, type],
      },
      {
        sql: `
          DELETE FROM coding_problem_testcases
          WHERE problem_id IN (
            SELECT problem_id FROM coding_problems
            WHERE assignment_id IN (SELECT assignment_id FROM assignments WHERE skill_type = ? AND type = ?)
          )
        `,
        args: [skill_type, type],
      },
      {
        sql: `
          DELETE FROM coding_problem_examples
          WHERE problem_id IN (
            SELECT problem_id FROM coding_problems
            WHERE assignment_id IN (SELECT assignment_id FROM assignments WHERE skill_type = ? AND type = ?)
          )
        `,
        args: [skill_type, type],
      },
      {
        sql: `
          DELETE FROM coding_problems
          WHERE assignment_id IN (SELECT assignment_id FROM assignments WHERE skill_type = ? AND type = ?)
        `,
        args: [skill_type, type],
      },
      {
        sql: `
          DELETE FROM student_assignment_access
          WHERE assignment_id IN (SELECT assignment_id FROM assignments WHERE skill_type = ? AND type = ?)
        `,
        args: [skill_type, type],
      },
      {
        sql: `DELETE FROM assignments WHERE skill_type = ? AND type = ?`,
        args: [skill_type, type],
      },
    ]

    await db.batch(stmts)

    console.log(`\n✅ Deleted ${assignments.length} assignment(s), ${problems.length} problem(s), and all related rows.`)
  } catch (err) {
    console.error('❌ Delete failed:', err.message)
    throw err
  }
}

deleteJsCodeSeed()
