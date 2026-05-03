// export const initialProgram = {
//   schedule: {
//     daysOfWeek: {
//       sunday: false,
//       monday: false,
//       tuesday: false,
//       wednesday: false,
//       thursday: false,
//       friday: false,
//       saturday: false,
//     },
//     zoneEnabled: {
//       0: false,
//       1: false,
//       2: false,
//       3: false,
//       4: false,
//       5: false,
//       6: false,
//       7: false
//     },
//     zoneDuration: {
//       0: 0,
//       1: 0,
//       2: 0,
//       3: 0,
//       4: 0,
//       5: 0,
//       6: 0,
//       7: 0
//     },package
//     timeOfDay: 1600
//   },
//   enableSchedule: false,
//   startedAt: 0,
//   pausedAt: 0,
//   stoppedAt: 0,
//   totalTimePaused: 0,
//   testStartedAt: 0,
//   testZone: 0,
//   testDuration: 1,

// }

import parser from 'cron-parser'


export function getDerivedState(program, time) {

  let state = {
    running: false
  }

  // Given a program and a time, return the state of the sprinklers at that time.
  const dow = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

  // Determine total program length
  state.totalProgramLength = 0
  for (let i = 0; i < 8; i++) {
    if (program.schedule.zoneEnabled[i]) {
      state.totalProgramLength += program.schedule.zoneDuration[i] * 60000
    }
  }

  // Get the previous scheduled start time
  if (program.enableSchedule && Object.entries(program.schedule.daysOfWeek).some(day => day[1])) {
    let minutes = program.schedule.timeOfDay % 100
    let hours = Math.floor(program.schedule.timeOfDay / 100)
    let daysOfWeak = Object.entries(program.schedule.daysOfWeek)
      .filter(day => day[1])
      .map(day => dow.indexOf(day[0]))
      .join(',')
    let crown = `0 ${minutes} ${hours} * * ${daysOfWeak}`

    let interval = parser.parseExpression(crown, { currentDate: time })
    state.nextRunTime = interval.next()

    interval = parser.parseExpression(crown, { currentDate: time })
    state.prevRunTime = interval.prev()
  }

  // Is a manual program currently running?
  let programStartTime = 0
  if (program.startedAt + program.totalTimePaused + state.totalProgramLength > time) {

    // Manual program is currently running
    state.programType = 'Manual'
    state.running = true
    programStartTime = program.startedAt

  } else if (state.prevRunTime && state.prevRunTime.getTime() + program.totalTimePaused + state.totalProgramLength > time) {

    // Scheduled program is currently running
    state.programType = 'Automatic'
    state.running = true
    programStartTime = state.prevRunTime.getTime()
  } else if (program.testStartedAt + program.testDuration * 60000 > time) {

    // Test program is currently running
    state.programType = 'Test'
    state.running = true
    state.currentZone = program.testZone
    state.currentZoneTimeRemaining = program.testStartedAt + program.testDuration * 60000 - time
    state.totalTimeRemaining = state.currentZoneTimeRemaining
    state.testRunning = true
  } else {
    state.programType = 'None'
  }

  if (programStartTime > 0 && state.programType !== 'Test') {
    // A program is running

    // Based on the program start time, and the total time paused, determine which zone is running, if any
    let queryTime = program.pausedAt > 0 ? program.pausedAt - program.totalTimePaused : time - program.totalTimePaused
    let zoneStartTime = programStartTime
    for (let i = 0; i < 8; i++) {
      if (program.schedule.zoneEnabled[i]) {
        if (queryTime < zoneStartTime + program.schedule.zoneDuration[i] * 60000) {
          state.currentZone = i
          state.currentZoneTimeRemaining = (zoneStartTime + program.schedule.zoneDuration[i] * 60000 - queryTime)
          state.totalTimeRemaining = state.currentZoneTimeRemaining
          break
        }
        zoneStartTime += program.schedule.zoneDuration[i] * 60000
      }
    }

    // Determine how much time is remaining
    for (let i = state.currentZone + 1; i < 8; i++) {
      if (program.schedule.zoneEnabled[i]) {
        state.totalTimeRemaining += program.schedule.zoneDuration[i] * 60000
      }
    }
  }


  if (program.pausedAt > 0) {
    state.paused = true
  }

  return state

}