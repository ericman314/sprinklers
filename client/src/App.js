import React, { useEffect } from 'react'
import logo from './logo.svg'
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
      let programResult = await fetchGet('/api/program')
      dispatch({ type: actions.SET_PROGRAM, program: programResult })
    })()
  }, [])

  socket.on('programUpdate', program => {
    dispatch({ type: actions.SET_PROGRAM, program })
  })

  const dispatchWrapper = async (action) => {
    dispatch(action)

    // Also send the action to the server
    // TODO: authentication
    let result = await fetchPost('/api/updateProgram', { action })
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
