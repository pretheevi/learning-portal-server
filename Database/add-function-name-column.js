// add-function-name-column.js

import db from './connectDb.js'

async function migrate() {
  try {
    await db.run(`
      ALTER TABLE coding_problems
      ADD COLUMN function_name TEXT NOT NULL DEFAULT 'solve'
    `)

    console.log('✅ function_name column added')
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('ℹ️ function_name column already exists')
    } else {
      throw err
    }
  }
}

migrate().catch(console.error)
