import React, { useEffect } from 'react'
import { getDerivedState } from './getDerivedState'
import { NumericInput } from './NumericInput'
import { actions } from './programReducer'
import dayjs from 'dayjs'

export function ProgramEditor({ program, dispatch }) {

  const zones = [0, 1, 2, 3, 4, 5, 6, 7]
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const times = ["12:00 am", "12:30 am", "1:00 am", "1:30 am", "2:00 am", "2:30 am", "3:00 am", "3:30 am", "4:00 am", "4:30 am", "5:00 am", "5:30 am", "6:00 am", "6:30 am", "7:00 am", "7:30 am", "8:00 am", "8:30 am", "9:00 am", "9:30 am", "10:00 am", "10:30 am", "11:00 am", "11:30 am", "12:00 pm", "12:30 pm", "1:00 pm", "1:30 pm", "2:00 pm", "2:30 pm", "3:00 pm", "3:30 pm", "4:00 pm", "4:30 pm", "5:00 pm", "5:30 pm", "6:00 pm", "6:30 pm", "7:00 pm", "7:30 pm", "8:00 pm", "8:30 pm", "9:00 pm", "9:30 pm", "10:00 pm", "10:30 pm", "11:00 pm", "11:30 pm"]
  const testDurations = [1, 2, 5, 10, 20]

  const zoneAreas = [
    360,
    1582.5,
    1544,
    541,
    1700,
    1900,
    0,
    0
  ]

  const gpm = [
    8.99,
    10.02,
    10.75,
    6.15,
    8.16,
    8.55,
    0,
    0
  ]

  const [testZone, setTestZone] = React.useState(0)
  const [testDuration, setTestDuration] = React.useState(1)

  const [state, setState] = React.useState({})

  function handleDurationChange(zone, duration) {
    if (duration >= 0) {
      dispatch({
        type: actions.SET_ZONE_DURATION,
        zone,
        duration
      })
    }
  }

  function handleZoneEnable(zone, enabled) {
    dispatch({
      type: actions.SET_ZONE_ENABLED,
      zone,
      enabled
    })
  }

  function handleEnableScheduleChange(enabled) {
    dispatch({
      type: actions.SET_SCHEDULE_ENABLED,
      enabled
    })
  }

  function handleSetDay(day, enabled) {
    dispatch({
      type: actions.SET_SCHEDULE_DAY_ENABLED,
      day,
      enabled
    })
  }

  function handleSetTimeOfDay(timeOfDay) {
    dispatch({
      type: actions.SET_SCHEDULE_TIME_OF_DAY,
      timeOfDay
    })
  }

  function getWeeklyPrecip(i) {

    if (program?.enableSchedule) {

      let q = gpm[i] * 231   // in^3/min
      let a = zoneAreas[i] * 144  // in^2

      let n = Object.values(program.schedule.daysOfWeek).filter(x => x).length

      let e = program.schedule.zoneEnabled[i] ? 1 : 0

      var d = program.schedule.zoneDuration[i]

      var precip = q / a * n * e * d
      if (isNaN(precip) || precip === 0)
        return ""

      return precip.toFixed(2) + "\""
    }
    else {
      return ""
    }
  }

  function getMonthlyCost() {

    let n = Object.values(program.schedule.daysOfWeek).filter(x => x).length

    var wkPerMonth = 4.34

    let totalGallons = getGallonsPerProgram() * n * wkPerMonth
    let costPerGal = totalGallons > 25000 ? 0.00097 : 0.00082 // $/1000gal
    return "$" + (totalGallons * costPerGal).toFixed(2)

  }

  function getGallonsPerProgram() {
    if (!program.enableSchedule) {
      return 0
    }
    var galTot = 0
    for (var i = 0; i < 8; i++) {
      var e = program.schedule.zoneEnabled[i] ? 1 : 0
      var d = program.schedule.zoneDuration[i] * 1
      galTot += gpm[i] * e * d
    }

    return galTot
  }

  function handleRunProgram() {
    dispatch({
      type: actions.RUN_PROGRAM,
      time: Date.now()
    })
  }

  function handlePauseProgram() {
    dispatch({
      type: actions.PAUSE_PROGRAM,
      time: Date.now()
    })
  }

  function handleResumeProgram() {
    dispatch({
      type: actions.RESUME_PROGRAM,
      time: Date.now()
    })
  }

  function handleStopProgram() {
    dispatch({
      type: actions.STOP_PROGRAM,
    })
  }

  function handleRunTest(zone, duration) {
    dispatch({
      type: actions.RUN_TEST,
      zone,
      duration,
      time: Date.now()
    })
  }

  function handleStopTest() {
    dispatch({
      type: actions.STOP_TEST,
    })
  }


  useEffect(() => {
    let intervalHandle
    if (program) {
      const time = Date.now()
      setState(getDerivedState(program, time))

      intervalHandle = setInterval(() => {
        const time = Date.now()
        setState(getDerivedState(program, time))
      }, 1000)
    }
    return () => {
      clearInterval(intervalHandle)
    }
  }, [program])

  if (!program) {
    return 'Loading...'
  }


  console.log(program)
  console.log(state)
  return (
    <div className="program-editor">
      <span className='control2'>
        <div id="program-list">
          <div class="progItemHeaderRow">
            <span class="headerItem">Zone</span>
            <span class="headerItem">Duration</span>
            <span class="headerItem"></span>
            <span class="headerItem">Weekly precip.</span>
          </div>
          {zones.map(i => (

            <div className="progItem">

              <span>{i + 1}</span>
              <span><NumericInput value={program.schedule.zoneDuration[i]} size={4} nonNegative onChange={(e, value) => handleDurationChange(i, value)} /></span>
              <span>
                <span class='toggle'>
                  <input id={`enable-zone-${i + 1}`} type='checkbox' checked={program.schedule.zoneEnabled[i]} onChange={(e) => handleZoneEnable(i, e.target.checked)} />
                  <label for={`enable-zone-${i + 1}`} >{program.schedule.zoneEnabled[i] ? 'Enabled' : 'Disabled'}</label>
                </span>
              </span>
              <span>{getWeeklyPrecip(i)}</span>
              {state.currentZone === i &&
                <span >{formatMillisecondsAsTime(state.currentZoneTimeRemaining)}</span>
              }

            </div>
          ))}

        </div>

        {!state.running && <button id="run-program" onClick={handleRunProgram}>Run program now</button>}
        {state.running && <>
          <span>{state.programType} program running</span>
          {state.programType === 'Test' && <button id="stop-program" onClick={handleStopProgram}>Stop test</button>}
          {state.programType === 'Manual' && <button id="stop-program" onClick={handleStopProgram}>Stop program</button>}
          {state.paused ?
            <button id="resume-program" onClick={handleResumeProgram}>Resume</button>
            :
            !state.testRunning && <button id="pause-program" onClick={handlePauseProgram}>Pause</button>
          }
          <span >&nbsp;{formatMillisecondsAsTime(state.totalTimeRemaining)}</span>
        </>
        }

        <hr />
        <span class='toggle'>
          <input id='enableSchedule' type='checkbox' checked={program.enableSchedule} onChange={(e) => handleEnableScheduleChange(e.target.checked)} />
          <label for='enableSchedule'>{program.enableSchedule ? 'On' : 'Off'}</label>
        </span>
        Repeat on a schedule

        {program.enableSchedule && <>
          <div>
            <p>
              {days.map(day => (
                <span class='flatToggle' >
                  <input id={`sched-day-${day}`} type='checkbox' checked={program.schedule.daysOfWeek[day.toLowerCase()]} onChange={(e) => handleSetDay(day.toLowerCase(), e.target.checked)} />
                  <label for={`sched-day-${day}`}>{day}</label>
                </span>
              ))}
            </p>
            <p>
              <select value={program.schedule.timeOfDay} onChange={(e) => handleSetTimeOfDay(parseInt(e.target.value))}>
                {times.map((time, i) => (
                  <option value={(i % 2) * 30 + Math.floor(i / 2) * 100}>{time}</option>
                ))}
              </select>
              {state.nextRunTime && <span>&nbsp;Next run: {dayjs(state.nextRunTime.toString()).format('dddd, MMM D, h:mm A')} </span>}
            </p>
          </div>
        </>}

        <div ng-show="!programRunning">
          <hr />
          <b>Test</b>
          <br />
          <select value={testZone} onChange={e => setTestZone(parseInt(e.target.value))}>
            {zones.map(i => (
              <option value={i}>Zone {i + 1}</option>
            ))}
          </select>

          <select value={testDuration} onChange={e => setTestDuration(parseInt(e.target.value))}>
            {testDurations.map(duration => (
              <option value={duration}>{duration} minutes</option>
            ))}
          </select>
          {state.testRunning ? <>
            <button id="stop-test" onClick={handleStopTest}>Stop test</button>
            <span >Running</span>
          </>
            :
            <button id="run-test" onClick={() => handleRunTest(testZone, testDuration)}>Test now</button>
          }
        </div>

        <div>
          Estimated monthly cost: {getMonthlyCost()} (plus base charge of $11.34)
        </div>

      </span>

      <div class="img-wrapper">
        <img id='zone0' src="no-zone.png" />
        {state.currentZone === 0 && <img id='zone1' src="zone1.png" className={`${state.paused ? 'paused' : ''}`} />}
        {state.currentZone === 1 && <img id='zone2' src="zone2.png" className={`${state.paused ? 'paused' : ''}`} />}
        {state.currentZone === 2 && <img id='zone3' src="zone3.png" className={`${state.paused ? 'paused' : ''}`} />}
        {state.currentZone === 3 && <img id='zone4' src="zone4.png" className={`${state.paused ? 'paused' : ''}`} />}
        {state.currentZone === 4 && <img id='zone5' src="zone5.png" className={`${state.paused ? 'paused' : ''}`} />}
        {state.currentZone === 5 && <img id='zone6' src="zone6.png" className={`${state.paused ? 'paused' : ''}`} />}
        {state.currentZone === 6 && <img id='zone7' src="zone7.png" className={`${state.paused ? 'paused' : ''}`} />}
        {state.currentZone === 7 && <img id='zone8' src="zone8.png" className={`${state.paused ? 'paused' : ''}`} />}
      </div>
      <pre>{JSON.stringify(program, null, 2)}</pre>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>

  )
}
function formatMillisecondsAsTime(ms) {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)

  const secondsStr = seconds < 10 ? `0${seconds}` : seconds
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes
  const hoursStr = hours < 10 ? `0${hours}` : hours

  return `${hoursStr}:${minutesStr}:${secondsStr}`
}