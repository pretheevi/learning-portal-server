// seed.js
import connectDb from './connectDb.js'
import { randomUUID } from 'crypto'

const assignmentId = randomUUID()

const assignment = {
  assignment_id: assignmentId,
  title: 'Aptitude - Percentage, P/L, D, Simple Interest',
  date: new Date().toISOString().split('T')[0],
  type: 'quiz'
}

const questions = [
  // PERCENTAGE
  {
    question_text: 'What is 25% of 200?',
    option_a: '40',
    option_b: '25',
    option_c: '50',
    option_d: '75',
    correct_option: 'c',
    explanation: '25% of 200 = (25/100) × 200 = 50.',
    points: 10,
    order_num: 1
  },
  {
    question_text: 'A student scored 450 marks out of 600. What is the percentage scored?',
    option_a: '70%',
    option_b: '80%',
    option_c: '65%',
    option_d: '75%',
    correct_option: 'd',
    explanation: 'Percentage = (Scored / Total) × 100 = (450 / 600) × 100 = 75%.',
    points: 10,
    order_num: 2
  },
  {
    question_text: 'If a number is increased by 20% and then decreased by 20%, what is the net change?',
    option_a: 'No change',
    option_b: '4% decrease',
    option_c: '4% increase',
    option_d: '2% decrease',
    correct_option: 'b',
    explanation: 'Let number = 100. After 20% increase = 120. After 20% decrease = 120 × 0.8 = 96. Net change = 4% decrease.',
    points: 10,
    order_num: 3
  },
  {
    question_text: 'What percentage is 75 of 300?',
    option_a: '20%',
    option_b: '30%',
    option_c: '25%',
    option_d: '15%',
    correct_option: 'c',
    explanation: 'Percentage = (75 / 300) × 100 = 25%.',
    points: 10,
    order_num: 4
  },
  {
    question_text: 'A salary of ₹20,000 is increased by 15%. What is the new salary?',
    option_a: '₹22,000',
    option_b: '₹23,500',
    option_c: '₹21,500',
    option_d: '₹23,000',
    correct_option: 'd',
    explanation: 'Increase = 15% of 20000 = 3000. New salary = 20000 + 3000 = ₹23,000.',
    points: 10,
    order_num: 5
  },
  // PROFIT AND LOSS
  {
    question_text: 'A shopkeeper buys a book for ₹80 and sells it for ₹100. What is the profit percentage?',
    option_a: '20%',
    option_b: '15%',
    option_c: '25%',
    option_d: '10%',
    correct_option: 'c',
    explanation: 'Profit = 100 - 80 = ₹20. Profit% = (Profit / Cost Price) × 100 = (20 / 80) × 100 = 25%.',
    points: 10,
    order_num: 6
  },
  {
    question_text: 'A cycle bought for ₹1500 is sold for ₹1200. What is the loss percentage?',
    option_a: '25%',
    option_b: '15%',
    option_c: '20%',
    option_d: '10%',
    correct_option: 'c',
    explanation: 'Loss = 1500 - 1200 = ₹300. Loss% = (300 / 1500) × 100 = 20%.',
    points: 10,
    order_num: 7
  },
  {
    question_text: 'If cost price = ₹500 and profit% = 20%, what is the selling price?',
    option_a: '₹580',
    option_b: '₹620',
    option_c: '₹600',
    option_d: '₹550',
    correct_option: 'c',
    explanation: 'Selling Price = Cost Price × (1 + Profit%/100) = 500 × 1.2 = ₹600.',
    points: 10,
    order_num: 8
  },
  {
    question_text: 'A shirt is sold for ₹630 at a loss of 10%. What is the cost price?',
    option_a: '₹700',
    option_b: '₹750',
    option_c: '₹680',
    option_d: '₹720',
    correct_option: 'a',
    explanation: 'SP = CP × (1 - Loss%/100). So 630 = CP × 0.9. CP = 630 / 0.9 = ₹700.',
    points: 10,
    order_num: 9
  },
  {
    question_text: 'A trader marks an item at ₹1000 and sells it at ₹900. What is the loss percentage?',
    option_a: '5%',
    option_b: '10%',
    option_c: '15%',
    option_d: '8%',
    correct_option: 'b',
    explanation: 'Loss = 1000 - 900 = ₹100. Loss% = (100 / 1000) × 100 = 10%.',
    points: 10,
    order_num: 10
  },
  // DISCOUNT
  {
    question_text: 'A TV has a marked price of ₹10,000. A 15% discount is given. What is the selling price?',
    option_a: '₹8,000',
    option_b: '₹9,000',
    option_c: '₹8,500',
    option_d: '₹7,500',
    correct_option: 'c',
    explanation: 'Discount = 15% of 10000 = ₹1500. Selling Price = 10000 - 1500 = ₹8,500.',
    points: 10,
    order_num: 11
  },
  {
    question_text: 'What is the discount percentage if marked price is ₹500 and selling price is ₹425?',
    option_a: '10%',
    option_b: '20%',
    option_c: '12%',
    option_d: '15%',
    correct_option: 'd',
    explanation: 'Discount = 500 - 425 = ₹75. Discount% = (75 / 500) × 100 = 15%.',
    points: 10,
    order_num: 12
  },
  {
    question_text: 'A product with marked price ₹800 is sold after two successive discounts of 10% and 5%. What is the final price?',
    option_a: '₹684',
    option_b: '₹700',
    option_c: '₹660',
    option_d: '₹720',
    correct_option: 'a',
    explanation: 'After 10% discount: 800 × 0.9 = ₹720. After 5% discount: 720 × 0.95 = ₹684.',
    points: 10,
    order_num: 13
  },
  {
    question_text: 'A shopkeeper offers a 20% discount and still makes a 25% profit. If cost price is ₹400, what is the marked price?',
    option_a: '₹600',
    option_b: '₹650',
    option_c: '₹500',
    option_d: '₹625',
    correct_option: 'd',
    explanation: 'SP = 400 × 1.25 = ₹500. SP = MP × (1 - 0.20). So MP = 500 / 0.8 = ₹625.',
    points: 10,
    order_num: 14
  },
  {
    question_text: 'A bill of ₹2000 is paid after a 5% discount. How much is paid?',
    option_a: '₹1,900',
    option_b: '₹1,800',
    option_c: '₹1,850',
    option_d: '₹1,950',
    correct_option: 'a',
    explanation: 'Discount = 5% of 2000 = ₹100. Amount paid = 2000 - 100 = ₹1,900.',
    points: 10,
    order_num: 15
  },
  // SIMPLE INTEREST
  {
    question_text: 'What is the formula for Simple Interest?',
    option_a: 'SI = P × R × T',
    option_b: 'SI = (P × R × T) / 100',
    option_c: 'SI = P + R + T',
    option_d: 'SI = P × (1 + R/100)^T',
    correct_option: 'b',
    explanation: 'Simple Interest = (Principal × Rate × Time) / 100. The last option is compound interest formula.',
    points: 10,
    order_num: 16
  },
  {
    question_text: 'Find the simple interest on ₹5000 at 10% per annum for 2 years.',
    option_a: '₹500',
    option_b: '₹1,500',
    option_c: '₹1,000',
    option_d: '₹2,000',
    correct_option: 'c',
    explanation: 'SI = (5000 × 10 × 2) / 100 = 1,00,000 / 100 = ₹1,000.',
    points: 10,
    order_num: 17
  },
  {
    question_text: 'A sum of ₹8000 is invested at 5% per annum. In how many years will SI be ₹2000?',
    option_a: '6 years',
    option_b: '4 years',
    option_c: '5 years',
    option_d: '3 years',
    correct_option: 'c',
    explanation: 'T = (SI × 100) / (P × R) = (2000 × 100) / (8000 × 5) = 2,00,000 / 40,000 = 5 years.',
    points: 10,
    order_num: 18
  },
  {
    question_text: 'What is the rate of interest if ₹4000 earns ₹1200 as simple interest in 3 years?',
    option_a: '8%',
    option_b: '12%',
    option_c: '10%',
    option_d: '15%',
    correct_option: 'c',
    explanation: 'R = (SI × 100) / (P × T) = (1200 × 100) / (4000 × 3) = 1,20,000 / 12,000 = 10%.',
    points: 10,
    order_num: 19
  },
  {
    question_text: 'The simple interest on a sum is ₹900 at 6% per annum for 5 years. What is the principal?',
    option_a: '₹2,500',
    option_b: '₹3,500',
    option_c: '₹3,000',
    option_d: '₹2,000',
    correct_option: 'c',
    explanation: 'P = (SI × 100) / (R × T) = (900 × 100) / (6 × 5) = 90,000 / 30 = ₹3,000.',
    points: 10,
    order_num: 20
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
      `INSERT INTO assignments (assignment_id, title, date, type) VALUES (?, ?, ?, ?)`,
      [assignment.assignment_id, assignment.title, assignment.date, assignment.type]
    )
    console.log(`✅ Assignment inserted: ${assignment.title}`)

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
    console.log('\n🎉 Seeding complete! 20 CSS Flexbox questions inserted.')
  } catch (err) {
    if (db && transaction) await db.exec('ROLLBACK')
    console.error('❌ Seeding failed:', err.message)
    throw err
  } finally {
    if (db) await db.close()
  }
}

seed()
