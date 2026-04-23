// seed.js
import connectDb from './connectDb.js'
import { randomUUID } from 'crypto'

const assignmentId = randomUUID()

const assignment = {
  assignment_id: assignmentId,
  title: 'HTML Fundamentals Quiz',
  date: new Date().toISOString().split('T')[0],
  type: 'quiz'
}

const questions = [
  {
    question_text: 'What does HTML stand for?',
    option_a: 'Hyper Text Markup Language',
    option_b: 'High Tech Modern Language',
    option_c: 'Hyper Transfer Markup Language',
    option_d: 'Home Tool Markup Language',
    correct_option: 'a',
    explanation: 'HTML stands for Hyper Text Markup Language, the standard language for creating web pages.',
    points: 10,
    order_num: 1
  },
  {
    question_text: 'Which tag is used to define the largest heading in HTML?',
    option_a: '<h6>',
    option_b: '<heading>',
    option_c: '<h1>',
    option_d: '<head>',
    correct_option: 'c',
    explanation: '<h1> defines the largest/most important heading. Headings go from h1 (largest) to h6 (smallest).',
    points: 10,
    order_num: 2
  },
  {
    question_text: 'Which attribute is used to provide an alternative text for an image?',
    option_a: 'title',
    option_b: 'src',
    option_c: 'href',
    option_d: 'alt',
    correct_option: 'd',
    explanation: 'The alt attribute specifies alternate text for an image if it cannot be displayed, and is important for accessibility.',
    points: 10,
    order_num: 3
  },
  {
    question_text: 'Which HTML tag is used to create a hyperlink?',
    option_a: '<link>',
    option_b: '<a>',
    option_c: '<href>',
    option_d: '<nav>',
    correct_option: 'b',
    explanation: 'The <a> (anchor) tag defines a hyperlink. The href attribute specifies the URL destination.',
    points: 10,
    order_num: 4
  },
  {
    question_text: 'What is the correct HTML tag for inserting a line break?',
    option_a: '<lb>',
    option_b: '<break>',
    option_c: '<br>',
    option_d: '<newline>',
    correct_option: 'c',
    explanation: '<br> is a void/self-closing element that inserts a single line break in the content.',
    points: 10,
    order_num: 5
  },
  {
    question_text: 'Which HTML element is used to define the structure of an HTML document\'s metadata?',
    option_a: '<meta>',
    option_b: '<header>',
    option_c: '<body>',
    option_d: '<head>',
    correct_option: 'd',
    explanation: 'The <head> element contains metadata like <title>, <meta>, <link>, and <script> tags that are not directly visible on the page.',
    points: 10,
    order_num: 6
  },
  {
    question_text: 'Which attribute makes a text input field accept only numbers in HTML5?',
    option_a: 'type="number"',
    option_b: 'type="digit"',
    option_c: 'type="integer"',
    option_d: 'type="numeric"',
    correct_option: 'a',
    explanation: 'type="number" on an <input> element restricts input to numeric values and shows a number spinner in most browsers.',
    points: 10,
    order_num: 7
  },
  {
    question_text: 'What is the purpose of the <DOCTYPE html> declaration?',
    option_a: 'It links an external stylesheet',
    option_b: 'It tells the browser which version of HTML the page is written in',
    option_c: 'It defines the document title',
    option_d: 'It creates the root HTML element',
    correct_option: 'b',
    explanation: '<!DOCTYPE html> informs the browser that this is an HTML5 document, ensuring it renders in standards mode.',
    points: 10,
    order_num: 8
  },
  {
    question_text: 'Which tag is used to create an ordered (numbered) list?',
    option_a: '<ul>',
    option_b: '<li>',
    option_c: '<list>',
    option_d: '<ol>',
    correct_option: 'd',
    explanation: '<ol> creates an ordered list with numbered items. <ul> creates an unordered (bulleted) list. <li> defines individual list items.',
    points: 10,
    order_num: 9
  },
  {
    question_text: 'Which HTML attribute is used to define inline styles?',
    option_a: 'class',
    option_b: 'styles',
    option_c: 'style',
    option_d: 'css',
    correct_option: 'c',
    explanation: 'The style attribute applies inline CSS directly to an element, e.g. <p style="color:red;">. It has the highest CSS specificity.',
    points: 10,
    order_num: 10
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

    // Insert assignment
    await db.run(
      `INSERT INTO assignments (assignment_id, title, date, type) VALUES (?, ?, ?, ?)`,
      [assignment.assignment_id, assignment.title, assignment.date, assignment.type]
    )
    console.log(`✅ Assignment inserted: ${assignment.title}`)

    // Insert questions
    for (const q of questions) {
      await db.run(
        `INSERT INTO quiz_questions 
          (question_id, assignment_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, points, order_num)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          randomUUID(),
          assignmentId,
          q.question_text,
          q.option_a,
          q.option_b,
          q.option_c,
          q.option_d,
          q.correct_option,
          q.explanation,
          q.points,
          q.order_num
        ]
      )
      console.log(`  ✅ Q${q.order_num}: ${q.question_text.slice(0, 50)}...`)
    }

    await db.exec('COMMIT')
    transaction = false
    console.log('\n🎉 Seeding complete! 10 HTML questions inserted.')
  } catch (err) {
    if (db && transaction) await db.exec('ROLLBACK')
    console.error('❌ Seeding failed:', err.message)
    throw err
  } finally {
    if (db) await db.close()
  }
}

seed()
