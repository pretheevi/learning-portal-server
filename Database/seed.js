// seed-javascript-basics.js

import db from './connectDb.js'
import { randomUUID } from 'crypto'

const assignmentId = randomUUID()

const assignment = {
  assignment_id: assignmentId,
  title: 'JavaScript Basics',
  date: new Date().toISOString().split('T')[0],
  type: 'quiz',
  skill_type: 'javascript'
}

const questions = [
  {
    question_text: 'Which keyword is used to declare a variable that cannot be reassigned in JavaScript?',
    option_a: 'var',
    option_b: 'let',
    option_c: 'const',
    option_d: 'static',
    correct_option: 'c',
    explanation: 'Example:\nconst name = "Alice"\nconst values cannot be reassigned after declaration.',
    points: 10,
    order_num: 1
  },
  {
    question_text: 'What is the output?\nlet x = 10\nconsole.log(typeof x)',
    option_a: 'string',
    option_b: 'number',
    option_c: 'int',
    option_d: 'float',
    correct_option: 'b',
    explanation: 'JavaScript does not distinguish int/float; both are type "number".',
    points: 10,
    order_num: 2
  },
  {
    question_text: 'What is the output?\nconsole.log(typeof "Hello")',
    option_a: 'string',
    option_b: 'str',
    option_c: 'text',
    option_d: 'char',
    correct_option: 'a',
    explanation: 'Text values in JavaScript are of type "string".',
    points: 10,
    order_num: 3
  },
  {
    question_text: 'Which operator is used for strict equality in JavaScript?',
    option_a: '==',
    option_b: '=',
    option_c: '===',
    option_d: '!=',
    correct_option: 'c',
    explanation: '=== checks both value and type, unlike == which only checks value.',
    points: 10,
    order_num: 4
  },
  {
    question_text: 'What is the output?\nconsole.log(5 == "5")',
    option_a: 'true',
    option_b: 'false',
    option_c: 'undefined',
    option_d: 'Error',
    correct_option: 'a',
    explanation: '== performs type coercion, so 5 and "5" are considered equal.',
    points: 10,
    order_num: 5
  },
  {
    question_text: 'What is the output?\nconsole.log(5 === "5")',
    option_a: 'true',
    option_b: 'false',
    option_c: 'undefined',
    option_d: 'Error',
    correct_option: 'b',
    explanation: '=== does not coerce types, so a number and string are never equal.',
    points: 10,
    order_num: 6
  },
  {
    question_text: 'Which operator is used to find the remainder of a division?',
    option_a: '/',
    option_b: '*',
    option_c: '%',
    option_d: '//',
    correct_option: 'c',
    explanation: 'Example:\nconsole.log(10 % 3)\nOutput: 1',
    points: 10,
    order_num: 7
  },
  {
    question_text: 'What is the output?\nlet a = 7\nlet b = 2\nconsole.log(a % b)',
    option_a: '3',
    option_b: '3.5',
    option_c: '1',
    option_d: '0',
    correct_option: 'c',
    explanation: '7 divided by 2 leaves a remainder of 1.',
    points: 10,
    order_num: 8
  },
  {
    question_text: 'Which symbol is used for logical AND in JavaScript?',
    option_a: '&',
    option_b: '&&',
    option_c: 'and',
    option_d: '||',
    correct_option: 'b',
    explanation: '&& returns true only when both conditions are true.',
    points: 10,
    order_num: 9
  },
  {
    question_text: 'What is the output?\nlet age = 20\nif (age >= 18) {\n  console.log("Adult")\n} else {\n  console.log("Minor")\n}',
    option_a: 'Minor',
    option_b: 'Adult',
    option_c: 'undefined',
    option_d: 'Error',
    correct_option: 'b',
    explanation: 'Since age is 20, the condition age >= 18 is true, so "Adult" is printed.',
    points: 10,
    order_num: 10
  },
  {
    question_text: 'What is the output?\nlet num = -5\nif (num > 0) {\n  console.log("Positive")\n} else if (num < 0) {\n  console.log("Negative")\n} else {\n  console.log("Zero")\n}',
    option_a: 'Positive',
    option_b: 'Negative',
    option_c: 'Zero',
    option_d: 'Error',
    correct_option: 'b',
    explanation: 'num is -5, which is less than 0, so the else if block runs.',
    points: 10,
    order_num: 11
  },
  {
    question_text: 'Which method is used to print output to the console in JavaScript?',
    option_a: 'print()',
    option_b: 'echo()',
    option_c: 'console.log()',
    option_d: 'display()',
    correct_option: 'c',
    explanation: 'Example:\nconsole.log("Hello World")',
    points: 10,
    order_num: 12
  },
  {
    question_text: 'What is the output?\nconsole.log(typeof undefined)',
    option_a: 'null',
    option_b: 'undefined',
    option_c: 'object',
    option_d: 'NaN',
    correct_option: 'b',
    explanation: 'A variable that has been declared but not assigned a value has type "undefined".',
    points: 10,
    order_num: 13
  },
  {
    question_text: 'What is the output?\nconsole.log(typeof null)',
    option_a: 'null',
    option_b: 'undefined',
    option_c: 'object',
    option_d: 'boolean',
    correct_option: 'c',
    explanation: 'This is a well-known quirk in JavaScript: typeof null returns "object".',
    points: 10,
    order_num: 14
  },
  {
    question_text: 'Which keyword is used to define a function in JavaScript?',
    option_a: 'def',
    option_b: 'func',
    option_c: 'function',
    option_d: 'method',
    correct_option: 'c',
    explanation: 'Example:\nfunction greet() {\n  console.log("Hello")\n}',
    points: 10,
    order_num: 15
  },
  {
    question_text: 'What is the output?\nfunction add(a, b) {\n  return a + b\n}\nconsole.log(add(4, 5))',
    option_a: '45',
    option_b: '9',
    option_c: 'undefined',
    option_d: 'Error',
    correct_option: 'b',
    explanation: 'The function returns the sum of the two numbers, 4 + 5 = 9.',
    points: 10,
    order_num: 16
  },
  {
    question_text: 'What is the output?\nfunction greet(name = "Guest") {\n  return `Hello ${name}`\n}\nconsole.log(greet())',
    option_a: 'Hello',
    option_b: 'Hello Guest',
    option_c: 'Guest',
    option_d: 'Error',
    correct_option: 'b',
    explanation: 'Since no argument is passed, the default parameter value "Guest" is used.',
    points: 10,
    order_num: 17
  },
  {
    question_text: 'Which of the following is an arrow function in JavaScript?',
    option_a: 'function() {}',
    option_b: '() => {}',
    option_c: 'def() {}',
    option_d: '->() {}',
    correct_option: 'b',
    explanation: 'Arrow functions use the => syntax. Example:\nconst greet = () => console.log("Hi")',
    points: 10,
    order_num: 18
  },
  {
    question_text: 'What is the data type of the value true in JavaScript?',
    option_a: 'string',
    option_b: 'number',
    option_c: 'boolean',
    option_d: 'object',
    correct_option: 'c',
    explanation: 'true and false are values of the boolean data type.',
    points: 10,
    order_num: 19
  },
  {
    question_text: 'What is the output?\nlet x = 10\nx += 5\nconsole.log(x)',
    option_a: '10',
    option_b: '5',
    option_c: '15',
    option_d: '105',
    correct_option: 'c',
    explanation: 'x += 5 is shorthand for x = x + 5, so x becomes 15.',
    points: 10,
    order_num: 20
  }
]



async function seed() {
  try {
    await db.exec('PRAGMA foreign_keys = ON')

    const maxOrder = await db.get(
      `SELECT COALESCE(MAX(order_num), 0) as max_order FROM assignments WHERE skill_type = ?`,
      [assignment.skill_type]
    )
    assignment.order_num = maxOrder.max_order + 1

    await db.run(
      `INSERT INTO assignments (assignment_id, title, date, type, skill_type, order_num)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [assignment.assignment_id, assignment.title, assignment.date, assignment.type, assignment.skill_type, assignment.order_num]
    )
    console.log(`✅ Assignment inserted: ${assignment.title} (order_num: ${assignment.order_num})`)

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
      console.log(`  ✅ Q${q.order_num}: ${q.question_text}`)
    }

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

    console.log('\n🎉 Seeding complete! 20 JavaScript Basics questions inserted.')
  } catch (err) {
    console.error('❌ Seeding failed:', err.message)
    throw err
  }
}

seed()
