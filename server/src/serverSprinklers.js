const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, {
  cors:
  {
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
  }
})

const fs = require('fs')
const { programReducer, actions } = require('./programReducer')

let program
try {
  program = JSON.parse(fs.readFileSync('program.json', 'utf8'))
} catch (ex) {
  program = require('./initialProgram').default
}


const bodyParser = require('body-parser')
const { getDerivedState } = require('../getDerivedState')
const { env } = require('process')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/api/program', (req, res) => {
  res.json(program)
})

app.post('/api/updateProgram', (req, res) => {
  dispatch(req.body.action)
  res.json(program)
  io.emit('programUpdate', program)
})

app.use(express.static('public'))

server.listen(3000, () => {
  console.log('Server is listening on port 3000')
})

io.on('connection', socket => {
  console.log('socket connected')
})

function dispatch(action) {
  try {
    program = programReducer(program, action)
  } catch (ex) {
    console.log(ex)
    res.json({ error: ex.message })
    return
  }
  fs.writeFileSync('program.json', JSON.stringify(program), 'utf8')
}

setInterval(() => {
  // Compute derived state
  let state = getDerivedState(program, Date.now())

  // Stop program if it is not running
  if (!state.running && program.totalTimePaused > 0) {
    dispatch({ type: actions.STOP_PROGRAM })
    io.emit('programUpdate', program)
  }

}, 5000)