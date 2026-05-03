import React, { useEffect } from 'react'
import './App.css'
import { fetchGet, fetchPost } from './fetchJson'
import { ProgramEditor } from './ProgramEditor'
import { actions, programReducer } from './programReducer'
import ioClient from 'socket.io-client'
import config from './config'

const socket = ioClient(config.webRoot)

function App() {
  const [program, dispatch] = React.useReducer(programReducer, null)

  useEffect(() => {
    (async () => {
      const programResult = await fetchGet('/api/program')
      dispatch({ type: actions.SET_PROGRAM, program: programResult })
    })()

    const handleProgramUpdate = program => {
      dispatch({ type: actions.SET_PROGRAM, program })
    }
    socket.on('programUpdate', handleProgramUpdate)
    return () => {
      socket.off('programUpdate', handleProgramUpdate)
    }
  }, [])

  const dispatchWrapper = async (action) => {
    dispatch(action)
    const result = await fetchPost('/api/updateProgram', { action })
    if (result.error) {
      console.log('Error:', result.error)
      return
    }
    dispatch({ type: actions.SET_PROGRAM, program: result })
  }

  return (
    <div className="App">
      <ProgramEditor program={program} dispatch={dispatchWrapper} />
    </div>
  )
}

export default App
