import express from 'express'
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { programReducer, actions } from './programReducer.js'
import { getDerivedState } from './getDerivedState.js'
import initialProgram from './initialProgram.js'
import { loadConfig } from './config.js'
import { createAuth } from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const config = loadConfig()
const PROGRAM_PATH = process.env.PROGRAM_PATH || path.resolve(__dirname, '../program.json')
const CLIENT_DIST = process.env.CLIENT_DIST || path.resolve(__dirname, '../../client/dist')
const PORT = Number(process.env.PORT || 8084)

let program
try {
  program = JSON.parse(fs.readFileSync(PROGRAM_PATH, 'utf8'))
} catch {
  program = initialProgram
}

const app = express()
app.set('trust proxy', 'loopback')

const server = createServer(app)
const io = new SocketServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'OPTIONS'] },
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const auth = createAuth(config)
app.use(auth.cookieParser)
app.post('/api/login', auth.loginHandler)
app.post('/api/logout', auth.logoutHandler)

app.use((req, res, next) => {
  if (req.path === '/login.html' || req.path.startsWith('/assets/') || req.path === '/favicon.ico') {
    return next()
  }
  return auth.requireAuth(req, res, next)
})

app.get('/api/program', (req, res) => {
  res.json(program)
})

app.get('/api/state', (req, res) => {
  res.json(state)
})

app.post('/api/updateProgram', (req, res) => {
  try {
    dispatch(req.body.action)
  } catch (ex) {
    console.error(ex)
    return res.status(400).json({ error: ex.message })
  }
  res.json(program)
  io.emit('programUpdate', program)
})

app.use(express.static(CLIENT_DIST))

app.get(/^\/(?!api\/|socket\.io\/).*/, (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'))
})

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})

io.on('connect', socket => {
  console.log(`socket ${socket.id} connected`)
  socket.emit('state', state)
})

io.on('disconnect', socket => {
  console.log(`socket ${socket.id} disconnected`)
})

function dispatch(action) {
  program = programReducer(program, action)
  fs.writeFileSync(PROGRAM_PATH, JSON.stringify(program), 'utf8')
}

let seq = 0
let state = {}

setInterval(() => {
  // Compute derived state
  const newState = getDerivedState(program, Date.now())
  
  // Send state to all sockets (including the raspi) if the currentZone changes, or every 10 seconds
  if (state.currentZone !== newState.currentZone
    || state.running !== newState.running
    || state.paused !== newState.paused
    || seq % 10 === 0) {
    io.emit('state', newState)
  }

  seq++
  state = newState

  // Stop program if it is not running
  if (!state.running && program.totalTimePaused > 0) {
    dispatch({ type: actions.STOP_PROGRAM })
    io.emit('programUpdate', program)
  }
}, 1000)