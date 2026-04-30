import http from 'http'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { WebSocketServer } from 'ws'
import InitializeTables from './Database/initializeDb.js'
import authRoute from './Routers/Authentication/auth.js'
import adminAuthRoute from './Routers/Authentication/adminAuth.js'
import assignmentRoute from './Routers/Dashboard/assignment.js'
import questionRoute from './Routers/Dashboard/question.js'
import profileRoute from './Routers/Dashboard/profile.js'
import CodeRoute from './Routers/Dashboard/code.js'
import Jsonwebtoken from './Middleware/Jsonwebtoken.js'
import AnnouncementModel from './Model/AnnouncementModel.js'
import adminProfileRoute from './Routers/Admin/profile.js'
import websocketHandler from './Routers/ws/websocket.js'

const app = express()
async function initializeServerAndDatabase() {
  try {
    const dbInitializer = new InitializeTables()
    await dbInitializer.init()
    const server = http.createServer(app)
    const wss = new WebSocketServer({ server })
    // wss.on('connection', websocketHandler)
    server.listen(8080, '0.0.0.0', () => console.log('Server listening on port 8080'))
  } catch (err) { process.exit(1) }
}
initializeServerAndDatabase()

app.use(helmet())
app.use(cors({
  origin: ['http://localhost:5173', ' http://192.168.1.34:5173'],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}))
// Request body size limits - Prevent DoS attacks
app.use(express.json({ limit: '10mb' }))
app.use((req, res, next) => { console.log(`${req.method}: ${req.originalUrl}`); next() })
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.get('/health', (req, res) => res.send("Health check. Hello from Node.js"))
app.use('/api/auth', authRoute)
app.use('/api/admin', adminAuthRoute)
app.use('/api/admin', adminProfileRoute)
app.use('/api/dashboard', assignmentRoute)
app.use('/api/dashboard', questionRoute)
app.use('/api/dashboard', profileRoute)
app.use('/api/dashboard', CodeRoute)
    