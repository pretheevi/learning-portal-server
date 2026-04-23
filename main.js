import http from 'http'
import express from 'express'
import cors from 'cors'
import InitializeTables from './Database/initializeDb.js'
import authRoute from './Routers/Authentication/auth.js'
import assignmentRoute from './Routers/Dashboard/assignment.js'
import questionRoute from './Routers/Dashboard/question.js'
const app = express()
async function initializeServerAndDatabase() {
  try {
    const dbInitializer = new InitializeTables()
    await dbInitializer.init()
    const server = http.createServer(app)
    server.listen(8080, '0.0.0.0', () => {
      console.log('Server listening at http://localhost:8080')
    })
  } catch (err) {
    console.log('Error initializing server', err)
    process.exit(1)
  }
}

initializeServerAndDatabase()

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))


app.use((req, res, next) => {
  const method = req.method
  const reqUrl = req.originalUrl
  console.log(`${method}: ${reqUrl}`)
  next()
})

app.use(express.json())

app.get('/health', (req, res) => {
  res.status(200).json({message: "Health check. Hello from Node.js"})
})

app.use('/api/auth', authRoute)
app.use('/api/dashboard', assignmentRoute)
app.use('/api/dashboard', questionRoute)

