import Jsonwebtoken from '../../Middleware/Jsonwebtoken.js'
import AnnouncementModel from '../../Model/AnnouncementModel.js'
const clients = new Map() // ws -> { student_id, name }
async function websocketHandler(ws, req) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const token = url.searchParams.get('token')

  if(!token) {
    ws.close(4001, 'Authentication token missing')
    return
  }

  let decoded
  try{
    decoded = Jsonwebtoken.verifyToken(token)
  } catch(err) {
    ws.close(4002, 'Invalid token')
  }

  clients.set(ws, {student_id: decoded.student_id, name: decoded.name})
  try {
    const history = await AnnouncementModel.getAll(20, 0)
    ws.send(JSON.stringify({ type: 'history', data: history.reverse() }))
  } catch (err) {
    console.error('Error fetching announcement history', err)
  }

  ws.on('close', () => {
    clients.delete(ws)
    console.log(`WebSocket disconnected: ${decoded.name} (${decoded.student_id})`)
  })

  ws.on('error', (err) => {
    console.error('WebSocket error', err)
    clients.delete(ws)
  })  

  app.locals.broadCast = (message) => {
    const payload = JSON.stringify({ type: 'announcement', data: message })
    for (const client of clients.keys()) {
      if (client.readyState === 1) {
        client.send(payload)
      }
    }
    console.log(`Broadcasted message: ${message.message} to ${clients.size} clients`)
  }
}

export default websocketHandler
