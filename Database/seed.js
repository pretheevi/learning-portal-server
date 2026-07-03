// seed-python-loops-functions.js

import db from './connectDb.js'
import { randomUUID } from 'crypto'

const assignmentId = randomUUID()

const assignment = {
  assignment_id: assignmentId,
  title: 'Python Loops & Functions',
  date: new Date().toISOString().split('T')[0],
  type: 'quiz',
  skill_type: 'python'
}

const questions = [
  {
    question_text: 'Which keyword is used to define a function in Python?',
    option_a: 'function',
    option_b: 'def',
    option_c: 'func',
    option_d: 'lambda',
    correct_option: 'b',
    explanation: 'Example:\ndef greet():\n    print("Hello")',
    points: 10,
    order_num: 1
  },
  {
    question_text: 'What is the output?\ndef add(a, b):\n    return a + b\nprint(add(2, 3))',
    option_a: '23',
    option_b: '5',
    option_c: 'None',
    option_d: 'Error',
    correct_option: 'b',
    explanation: 'The function returns the sum of the two numbers, 2 + 3 = 5.',
    points: 10,
    order_num: 2
  },
  {
    question_text: 'Which keyword is used to loop over items in a sequence like a list or string?',
    option_a: 'while',
    option_b: 'loop',
    option_c: 'for',
    option_d: 'each',
    correct_option: 'c',
    explanation: 'Example:\nfor item in [1, 2, 3]:\n    print(item)',
    points: 10,
    order_num: 3
  },
  {
    question_text: 'What is the output?\nfor i in range(3):\n    print(i)',
    option_a: '1 2 3',
    option_b: '0 1 2',
    option_c: '0 1 2 3',
    option_d: 'Error',
    correct_option: 'b',
    explanation: 'range(3) produces 0, 1, 2 — it stops before reaching 3.',
    points: 10,
    order_num: 4
  },
  {
    question_text: 'What values does range(2, 10, 2) produce?',
    option_a: '2, 4, 6, 8',
    option_b: '2, 4, 6, 8, 10',
    option_c: '2, 3, 4, ..., 9',
    option_d: '0, 2, 4, 6, 8',
    correct_option: 'a',
    explanation: 'range(start, stop, step) starts at 2, stops before 10, incrementing by 2 each time.',
    points: 10,
    order_num: 5
  },
  {
    question_text: 'Which loop keeps running as long as a condition remains True?',
    option_a: 'for',
    option_b: 'repeat',
    option_c: 'while',
    option_d: 'until',
    correct_option: 'c',
    explanation: 'A while loop checks its condition before every iteration and stops once it becomes False.',
    points: 10,
    order_num: 6
  },
  {
    question_text: 'What is the output?\ni = 0\nwhile i < 3:\n    print(i)\n    i += 1',
    option_a: '0 1 2',
    option_b: '1 2 3',
    option_c: '0 1 2 3',
    option_d: 'Infinite loop',
    correct_option: 'a',
    explanation: 'i starts at 0 and increments after each print, stopping once i reaches 3.',
    points: 10,
    order_num: 7
  },
  {
    question_text: 'Which keyword immediately exits a loop, skipping any remaining iterations?',
    option_a: 'stop',
    option_b: 'exit',
    option_c: 'break',
    option_d: 'continue',
    correct_option: 'c',
    explanation: 'break stops the loop entirely, even if the loop condition is still True.',
    points: 10,
    order_num: 8
  },
  {
    question_text: 'Which keyword skips the rest of the current iteration and moves to the next one?',
    option_a: 'continue',
    option_b: 'break',
    option_c: 'next',
    option_d: 'skip',
    correct_option: 'a',
    explanation: 'continue jumps back to the top of the loop without executing the remaining code in that iteration.',
    points: 10,
    order_num: 9
  },
  {
    question_text: 'What does a function return if it has no explicit return statement?',
    option_a: '0',
    option_b: 'An empty string',
    option_c: 'None',
    option_d: 'It raises an error',
    correct_option: 'c',
    explanation: 'Python functions implicitly return None when no return statement is reached.',
    points: 10,
    order_num: 10
  },
  {
    question_text: 'What is the output?\ndef greet(name="Guest"):\n    return f"Hello {name}"\nprint(greet())',
    option_a: 'Hello',
    option_b: 'Hello Guest',
    option_c: 'Guest',
    option_d: 'Error',
    correct_option: 'b',
    explanation: 'Since no argument is passed, the default parameter value "Guest" is used.',
    points: 10,
    order_num: 11
  },
  {
    question_text: 'Which keyword creates a small anonymous function in Python?',
    option_a: 'def',
    option_b: 'anon',
    option_c: 'lambda',
    option_d: 'func',
    correct_option: 'c',
    explanation: 'Example:\nsquare = lambda x: x * x',
    points: 10,
    order_num: 12
  },
  {
    question_text: 'What is the output?\ndef square(x):\n    return x * x\nprint(square(4))',
    option_a: '8',
    option_b: '16',
    option_c: '4',
    option_d: 'Error',
    correct_option: 'b',
    explanation: 'square(4) returns 4 * 4 = 16.',
    points: 10,
    order_num: 13
  },
  {
    question_text: 'What is the output?\ndef total(*nums):\n    return sum(nums)\nprint(total(1, 2, 3))',
    option_a: '123',
    option_b: '6',
    option_c: 'Error',
    option_d: '[1, 2, 3]',
    correct_option: 'b',
    explanation: '*nums collects all arguments into a tuple (1, 2, 3), and sum() adds them to get 6.',
    points: 10,
    order_num: 14
  },
  {
    question_text: 'What is the output?\ntotal = 0\nfor i in range(1, 5):\n    if i == 3:\n        continue\n    total += i\nprint(total)',
    option_a: '10',
    option_b: '7',
    option_c: '6',
    option_d: '9',
    correct_option: 'b',
    explanation: 'Loop adds 1 + 2 + 4 = 7, skipping 3 because of continue (i == 3).',
    points: 10,
    order_num: 15
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

    console.log('\n🎉 Seeding complete! 15 Python Loops & Functions questions inserted.')
  } catch (err) {
    console.error('❌ Seeding failed:', err.message)
    throw err
  }
}

seed()
