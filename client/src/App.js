import React, { useEffect } from 'react'
import logo from './logo.svg'
import './App.css'
import { fetchGet } from './fetchJson'
import { ProgramEditor } from './ProgramEditor'

function App() {

  const [program, setProgram] = React.useState(null)

  useEffect(() => {
    (async () => {
      let programResult = await fetchGet('/api/program')
      setProgram(programResult)
    })()
  }, [])

  return (
    <div className="App">
      <ProgramEditor program={program} />
      <pre>{JSON.stringify(program, null, 2)}</pre>
    </div>
  )
}

export default App
