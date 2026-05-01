// seed-aptitude-profit-si-ci-quiz.js
import db from './connectDb.js'
import { randomUUID } from 'crypto'
const assignmentId = randomUUID()
const assignment = {
  assignment_id: assignmentId,
  title: 'Profit, Loss, SI & CI Practice',
  date: new Date().toISOString().split('T')[0],
  type: 'quiz',
  skill_type: 'aptitude'
}

const questions = [
  // ── PROFIT & LOSS ──────────────────────────────────────────────────────────
  {
    question_text: 'A shopkeeper buys an item for ₹450 and sells it for ₹540. What is the profit percentage?',
    option_a: '15%',
    option_b: '20%',
    option_c: '25%',
    option_d: '18%',
    correct_option: 'b',
    explanation: 'Profit = SP − CP = 540 − 450 = ₹90. Profit% = (90 ÷ 450) × 100 = 20%. Always calculate profit% on the Cost Price.',
    points: 10,
    order_num: 1
  },
  {
    question_text: 'An article is sold at 20% loss. If the CP is ₹650, what is the SP?',
    option_a: '₹500',
    option_b: '₹530',
    option_c: '₹520',
    option_d: '₹540',
    correct_option: 'c',
    explanation: 'SP = CP × (1 − loss%/100) = 650 × 0.80 = ₹520. A 20% loss means you recover only 80% of the CP.',
    points: 10,
    order_num: 2
  },
  {
    question_text: 'A man sells two items each at ₹990. On one he gains 10% and on the other he loses 10%. What is his overall result?',
    option_a: 'No gain, no loss',
    option_b: '1% gain',
    option_c: '1% loss',
    option_d: '2% loss',
    correct_option: 'c',
    explanation: 'CP₁ = 990÷1.1 = ₹900; CP₂ = 990÷0.9 = ₹1100. Total CP = ₹2000, Total SP = ₹1980. Loss = ₹20. Loss% = (20÷2000)×100 = 1%. Rule: whenever same SP with equal % gain/loss, result is always a LOSS. Loss% = (common%)² ÷ 100.',
    points: 10,
    order_num: 3
  },
  {
    question_text: 'By selling an article for ₹720, a trader loses 10%. At what price must he sell it to gain 15%?',
    option_a: '₹880',
    option_b: '₹900',
    option_c: '₹920',
    option_d: '₹950',
    correct_option: 'c',
    explanation: 'CP = 720 ÷ 0.90 = ₹800. For 15% gain: SP = 800 × 1.15 = ₹920.',
    points: 10,
    order_num: 4
  },
  {
    question_text: 'A shopkeeper marks his goods 30% above CP and gives a 10% discount. What is his profit percentage?',
    option_a: '17%',
    option_b: '20%',
    option_c: '21%',
    option_d: '15%',
    correct_option: 'a',
    explanation: 'Let CP = ₹100. MP = ₹130. After 10% discount: SP = 130 × 0.90 = ₹117. Profit% = 17%. Formula shortcut: Profit% = (1 + M/100)(1 − D/100) − 1 → (1.3)(0.9) − 1 = 1.17 − 1 = 17%.',
    points: 10,
    order_num: 5
  },
  {
    question_text: 'After a 25% discount, a watch is sold for ₹1800. What is the marked price?',
    option_a: '₹2000',
    option_b: '₹2100',
    option_c: '₹2250',
    option_d: '₹2400',
    correct_option: 'd',
    explanation: 'SP = MP × (1 − 25/100) → 1800 = MP × 0.75 → MP = 1800 ÷ 0.75 = ₹2400.',
    points: 10,
    order_num: 6
  },
  {
    question_text: 'A dishonest dealer claims to sell at cost price but uses a 900g weight instead of 1kg. What is his actual profit percentage?',
    option_a: '10%',
    option_b: '11.11%',
    option_c: '12.5%',
    option_d: '9.09%',
    correct_option: 'b',
    explanation: 'He gives 900g but charges for 1000g. Profit% = (Error ÷ True Weight − Error) × 100 = (100 ÷ 900) × 100 = 11.11%. He gains on every 900g sold.',
    points: 10,
    order_num: 7
  },

  // ── SIMPLE INTEREST ────────────────────────────────────────────────────────
  {
    question_text: 'Find the Simple Interest on ₹5000 at 8% per annum for 3 years.',
    option_a: '₹1000',
    option_b: '₹1100',
    option_c: '₹1200',
    option_d: '₹1500',
    correct_option: 'c',
    explanation: 'SI = (P × R × T) ÷ 100 = (5000 × 8 × 3) ÷ 100 = ₹1200.',
    points: 10,
    order_num: 8
  },
  {
    question_text: 'A sum becomes ₹9000 in 4 years at 12.5% SI per annum. Find the principal.',
    option_a: '₹4000',
    option_b: '₹5000',
    option_c: '₹6000',
    option_d: '₹7000',
    correct_option: 'c',
    explanation: 'A = P(1 + RT/100) = P(1 + 12.5×4/100) = P × 1.5. So 1.5P = 9000 → P = ₹6000.',
    points: 10,
    order_num: 9
  },
  {
    question_text: 'In how many years will ₹3000 double itself at 10% SI per annum?',
    option_a: '8 years',
    option_b: '10 years',
    option_c: '12 years',
    option_d: '15 years',
    correct_option: 'b',
    explanation: 'To double: SI = P. So P = (P × 10 × T) ÷ 100 → T = 100 ÷ 10 = 10 years. Shortcut: Years to double at SI = 100 ÷ R.',
    points: 10,
    order_num: 10
  },
  {
    question_text: '₹2400 is split into two parts — one at 5% SI and the other at 8% SI. The total interest after 1 year is ₹162. Find the two parts.',
    option_a: '₹1000 and ₹1400',
    option_b: '₹1200 and ₹1200',
    option_c: '₹800 and ₹1600',
    option_d: '₹1100 and ₹1300',
    correct_option: 'a',
    explanation: 'Let part at 5% = x. Then: 5x/100 + 8(2400−x)/100 = 162 → 5x + 19200 − 8x = 16200 → −3x = −3000 → x = ₹1000. Other part = ₹1400.',
    points: 10,
    order_num: 11
  },
  {
    question_text: 'The SI on a sum for 3 years at 8% exceeds the SI on the same sum for 2 years at 6% by ₹360. Find the sum.',
    option_a: '₹2000',
    option_b: '₹2500',
    option_c: '₹3000',
    option_d: '₹4000',
    correct_option: 'c',
    explanation: 'P×8×3/100 − P×6×2/100 = 360 → 0.24P − 0.12P = 360 → 0.12P = 360 → P = ₹3000.',
    points: 10,
    order_num: 12
  },

  // ── COMPOUND INTEREST ──────────────────────────────────────────────────────
  {
    question_text: 'Find the Compound Interest on ₹8000 at 10% per annum for 2 years (compounded annually).',
    option_a: '₹1600',
    option_b: '₹1680',
    option_c: '₹1700',
    option_d: '₹1760',
    correct_option: 'b',
    explanation: 'A = 8000 × (1.1)² = 8000 × 1.21 = ₹9680. CI = 9680 − 8000 = ₹1680. Note: SI would be ₹1600; the extra ₹80 is interest on the 1st year\'s interest.',
    points: 10,
    order_num: 13
  },
  {
    question_text: 'What is the difference between SI and CI on ₹10,000 at 10% per annum for 2 years?',
    option_a: '₹50',
    option_b: '₹100',
    option_c: '₹150',
    option_d: '₹200',
    correct_option: 'b',
    explanation: 'SI = 10000×10×2/100 = ₹2000. CI: A = 10000×1.21 = 12100 → CI = ₹2100. Difference = ₹100. Shortcut: Difference = P × (R/100)² = 10000 × 0.01 = ₹100.',
    points: 10,
    order_num: 14
  },
  {
    question_text: 'A sum amounts to ₹13,230 in 2 years at 5% CI (compounded annually). Find the principal.',
    option_a: '₹10,000',
    option_b: '₹11,000',
    option_c: '₹12,000',
    option_d: '₹13,000',
    correct_option: 'c',
    explanation: 'A = P × (1.05)² = P × 1.1025 = 13230 → P = 13230 ÷ 1.1025 = ₹12,000.',
    points: 10,
    order_num: 15
  },
  {
    question_text: 'Find the CI on ₹5000 at 8% per annum for 1.5 years, compounded half-yearly.',
    option_a: '₹600',
    option_b: '₹612',
    option_c: '₹624.32',
    option_d: '₹640',
    correct_option: 'c',
    explanation: 'For half-yearly: Rate = 8÷2 = 4%, Periods = 1.5×2 = 3. A = 5000 × (1.04)³ = 5000 × 1.124864 = ₹5624.32. CI = ₹624.32.',
    points: 10,
    order_num: 16
  },
  {
    question_text: 'A sum of money doubles itself in 6 years at CI. In how many years will it become 8 times?',
    option_a: '12 years',
    option_b: '15 years',
    option_c: '18 years',
    option_d: '24 years',
    correct_option: 'c',
    explanation: 'If money doubles in 6 years: 2¹ → 6 yrs, 2² (4×) → 12 yrs, 2³ (8×) → 18 years. Rule: 8 = 2³, so it takes 3 doubling periods = 3 × 6 = 18 years.',
    points: 10,
    order_num: 17
  },

  // ── MIXED / TRICKY ─────────────────────────────────────────────────────────
  {
    question_text: 'The ratio of SI to CI on a certain sum for 2 years at 10% per annum is 20:21. What is the sum?',
    option_a: '₹5,000',
    option_b: '₹10,000',
    option_c: '₹20,000',
    option_d: 'Cannot be determined',
    correct_option: 'd',
    explanation: 'This is a TRAP question! For ANY principal P: SI = 0.20P and CI = 0.21P at 10% for 2 yrs → ratio is always 20:21 regardless of P. The sum cannot be uniquely determined. If you see equal %, same time period — this ratio is fixed for all values of P.',
    points: 10,
    order_num: 18
  },
  {
    question_text: 'A person buys a mobile for ₹12,000 and sells it at 15% loss. With that money he buys another and sells it at 20% gain. What is his net result?',
    option_a: '₹240 gain',
    option_b: '₹240 loss',
    option_c: 'No gain or loss',
    option_d: '₹480 gain',
    correct_option: 'a',
    explanation: 'First sale SP = 12000 × 0.85 = ₹10,200. Second sale SP = 10200 × 1.20 = ₹12,240. Net gain = 12240 − 12000 = ₹240.',
    points: 10,
    order_num: 19
  },
  {
    question_text: 'At what rate of CI will ₹1000 amount to ₹1331 in 3 years (compounded annually)?',
    option_a: '8%',
    option_b: '9%',
    option_c: '10%',
    option_d: '11%',
    correct_option: 'c',
    explanation: '1000 × (1 + R/100)³ = 1331 → (1 + R/100)³ = 1.331 = (1.1)³ → R = 10%. Tip: recognise 1331 = 11³ and 1000 = 10³, so ratio is (11/10)³.',
    points: 10,
    order_num: 20
  }
]

async function seed() {
  try {
    await db.exec('PRAGMA foreign_keys = ON')

    // Get the next order_num for this skill_type
    const maxOrder = await db.get(
      `SELECT COALESCE(MAX(order_num), 0) as max_order FROM assignments WHERE skill_type = ?`,
      [assignment.skill_type]
    )
    assignment.order_num = maxOrder.max_order + 1

    await db.run(
      `INSERT INTO assignments (assignment_id, title, date, type, skill_type, order_num) VALUES (?, ?, ?, ?, ?, ?)`,
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
      console.log(`  ✅ Q${q.order_num}: ${q.question_text.slice(0, 55)}...`)
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

    console.log('\n🎉 Seeding complete! 20 Profit/Loss SI CI questions inserted.')
  } catch (err) {
    console.error('❌ Seeding failed:', err.message)
    throw err
  }
}

seed()
