// seed-css-grid-quiz.js
import connectDb from './connectDb.js'
import { randomUUID } from 'crypto'

const assignmentId = randomUUID()

const assignment = {
  assignment_id: assignmentId,
  title: 'CSS Grid Layout',
  date: new Date().toISOString().split('T')[0],
  type: 'quiz',
  skill_type: 'css'
}

const questions = [
  // GRID CONTAINER
  {
    question_text: 'Which CSS property is used to make an element a grid container?',
    option_a: 'display: flex',
    option_b: 'display: grid',
    option_c: 'position: grid',
    option_d: 'layout: grid',
    correct_option: 'b',
    explanation: 'display: grid turns an element into a grid container. All direct children automatically become grid items.',
    points: 10,
    order_num: 1
  },
  {
    question_text: 'What does "grid-template-columns: repeat(3, 1fr)" create?',
    option_a: 'Three rows of equal height',
    option_b: 'Three columns each taking 1px',
    option_c: 'Three equal-width columns that share available space',
    option_d: 'One column repeated 3 times with fixed width',
    correct_option: 'c',
    explanation: 'repeat(3, 1fr) creates 3 columns each with 1 fraction unit — they share the available space equally, so each column is 1/3 of the container width.',
    points: 10,
    order_num: 2
  },
  {
    question_text: 'Which property defines the gap between grid rows AND columns at once?',
    option_a: 'grid-gap (now called gap)',
    option_b: 'grid-spacing',
    option_c: 'margin: auto',
    option_d: 'padding: gap',
    correct_option: 'a',
    explanation: 'The gap property (previously grid-gap) sets spacing between rows and columns. You can also use row-gap and column-gap separately.',
    points: 10,
    order_num: 3
  },
  {
    question_text: 'What does "grid-template-columns: 200px auto 1fr" create?',
    option_a: 'Three equal columns',
    option_b: 'First column 200px, second fits content, third takes remaining space',
    option_c: 'All three columns share space equally',
    option_d: 'First column auto, second 200px, third 1fr',
    correct_option: 'b',
    explanation: 'Each value defines one column: 200px is fixed, auto sizes to content, and 1fr takes all remaining space after the first two columns are sized.',
    points: 10,
    order_num: 4
  },
  {
    question_text: 'Which property on a grid container controls how items are aligned horizontally within their cells?',
    option_a: 'align-items',
    option_b: 'justify-content',
    option_c: 'justify-items',
    option_d: 'place-items',
    correct_option: 'c',
    explanation: 'justify-items aligns grid items along the row axis (horizontal) inside their grid area. align-items does the same on the column axis (vertical).',
    points: 10,
    order_num: 5
  },
  // GRID ITEMS
  {
    question_text: 'What does "grid-column: 1 / 3" mean on a grid item?',
    option_a: 'The item spans columns 1 and 3 only',
    option_b: 'The item starts at column line 1 and ends at column line 3, spanning 2 columns',
    option_c: 'The item is placed in the 3rd column',
    option_d: 'The item spans 1/3 of the grid width',
    correct_option: 'b',
    explanation: 'grid-column: 1 / 3 means start at grid line 1 and end at grid line 3 — this spans across 2 column tracks.',
    points: 10,
    order_num: 6
  },
  {
    question_text: 'How do you make a grid item span 2 rows?',
    option_a: 'grid-row: 2',
    option_b: 'row-span: 2',
    option_c: 'grid-row: span 2',
    option_d: 'grid-rows: 1 / 2',
    correct_option: 'c',
    explanation: 'grid-row: span 2 tells the item to span across 2 row tracks from wherever it is placed. You can also use grid-row: 1 / 3 for explicit placement.',
    points: 10,
    order_num: 7
  },
  {
    question_text: 'Which shorthand property sets both grid-row and grid-column at once?',
    option_a: 'grid-span',
    option_b: 'grid-placement',
    option_c: 'grid-area',
    option_d: 'grid-position',
    correct_option: 'c',
    explanation: 'grid-area is the shorthand: grid-area: row-start / column-start / row-end / column-end. It can also reference a named area from grid-template-areas.',
    points: 10,
    order_num: 8
  },
  // GRID vs FLEXBOX
  {
    question_text: 'What is the key difference between CSS Grid and Flexbox?',
    option_a: 'Grid is for styling text, Flexbox is for images',
    option_b: 'Grid is two-dimensional (rows + columns), Flexbox is one-dimensional (row OR column)',
    option_c: 'Flexbox handles both rows and columns, Grid only handles rows',
    option_d: 'Grid only works on block elements, Flexbox works on any element',
    correct_option: 'b',
    explanation: 'Flexbox is designed for one-dimensional layouts — either a row or a column. CSS Grid is designed for two-dimensional layouts — rows and columns together.',
    points: 10,
    order_num: 9
  },
  // GRID TEMPLATE AREAS
  {
    question_text: 'What does grid-template-areas allow you to do?',
    option_a: 'Define column widths using named templates',
    option_b: 'Name regions of the grid and assign items to them by name',
    option_c: 'Set how many areas are hidden in a grid',
    option_d: 'Limit the grid to a specific area on screen',
    correct_option: 'b',
    explanation: 'grid-template-areas lets you visually define the layout using names. Then assign grid items to areas using grid-area: header or grid-area: sidebar etc.',
    points: 10,
    order_num: 10
  },
  {
    question_text: 'In grid-template-areas, what does a "." (dot) represent?',
    option_a: 'An error in syntax',
    option_b: 'A gap between columns',
    option_c: 'An empty cell with no named area',
    option_d: 'A full-width spanning area',
    correct_option: 'c',
    explanation: 'A dot in grid-template-areas represents an unnamed/empty cell. It is a placeholder that occupies space without being assigned to any grid item.',
    points: 10,
    order_num: 11
  },
  // AUTO-FILL vs AUTO-FIT
  {
    question_text: 'What is the difference between auto-fill and auto-fit in repeat()?',
    option_a: 'auto-fill creates empty columns if items run out, auto-fit collapses them',
    option_b: 'auto-fit fills columns with content, auto-fill is for rows',
    option_c: 'They are identical and interchangeable',
    option_d: 'auto-fill is for fixed widths, auto-fit is for fractional widths',
    correct_option: 'a',
    explanation: 'With auto-fill, empty tracks are preserved as space. With auto-fit, empty tracks collapse to 0 width, letting filled tracks stretch to fill the container.',
    points: 10,
    order_num: 12
  }
]

async function seed() {
  let db
  let transaction = false
  try {
    db = await connectDb()
    await db.exec('PRAGMA foreign_keys = ON')
    await db.exec('BEGIN')
    transaction = true

    await db.run(
      `INSERT INTO assignments (assignment_id, title, date, type, skill_type) VALUES (?, ?, ?, ?, ?)`,
      [assignment.assignment_id, assignment.title, assignment.date, assignment.type, assignment.skill_type]
    )
    console.log(`✅ Assignment inserted: ${assignment.title}`)

    for (const q of questions) {
      await db.run(
        `INSERT INTO quiz_questions 
          (question_id, assignment_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, points, order_num)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          randomUUID(), assignmentId,
          q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
          q.correct_option, q.explanation, q.points, q.order_num
        ]
      )
      console.log(`  ✅ Q${q.order_num}: ${q.question_text.slice(0, 50)}...`)
    }

    // seed student_assignment_access
    const existing = await db.get(
      `SELECT COUNT(*) as count FROM assignments 
       WHERE skill_type = ? AND type = ? AND assignment_id != ?`,
      [assignment.skill_type, assignment.type, assignment.assignment_id]
    )
    const isFirst = existing.count === 0
    console.log(`\n📌 Is first ${assignment.type} for ${assignment.skill_type}? ${isFirst}`)

    const students = await db.all(`SELECT student_id FROM students`)
    for (const s of students) {
      await db.run(
        `INSERT OR IGNORE INTO student_assignment_access 
          (access_id, student_id, assignment_id, is_unlocked, unlocked_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          randomUUID(), s.student_id, assignment.assignment_id,
          isFirst ? 1 : 0,
          isFirst ? new Date().toISOString() : null
        ]
      )
    }
    console.log(`✅ Access seeded for ${students.length} students (is_unlocked: ${isFirst ? 1 : 0})`)

    await db.exec('COMMIT')
    transaction = false
    console.log('\n🎉 Seeding complete! 12 CSS Grid questions inserted.')
  } catch (err) {
    if (db && transaction) await db.exec('ROLLBACK')
    console.error('❌ Seeding failed:', err.message)
    throw err
  } finally {
    if (db) await db.close()
  }
}

seed()
