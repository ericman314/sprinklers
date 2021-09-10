const express = require('express')
const app = express()

const { initialProgram: program } = require('./initialProgram')

app.get('/api/program', (req, res) => {
  res.json(program)
})

app.use(express.static('public'))

app.listen(3000, () => {
  console.log('Server is listening on port 3000')
})
