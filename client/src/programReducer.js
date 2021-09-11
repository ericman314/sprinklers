const update = require('immutability-helper')

export const actions = {

  SET_PROGRAM: 'SET_PROGRAM',

  RUN_PROGRAM: 'RUN_PROGRAM',
  PAUSE_PROGRAM: 'PAUSE_PROGRAM',
  RESUME_PROGRAM: 'RESUME_PROGRAM',
  STOP_PROGRAM: 'STOP_PROGRAM',

  RUN_TEST: 'RUN_TEST',
  STOP_TEST: 'STOP_TEST',

  SET_ZONE_DURATION: 'SET_ZONE_DURATION',
  SET_ZONE_ENABLED: 'SET_ZONE_ENABLED',
  SET_SCHEDULE_ENABLED: 'SET_SCHEDULE_ENABLED',
  SET_SCHEDULE_DAY_ENABLED: 'SET_SCHEDULE_DAY_ENABLED',
  SET_SCHEDULE_TIME_OF_DAY: 'SET_SCHEDULE_TIME_OF_DAY',
}

export function programReducer(program, action) {

  console.log(program)
  console.log(action)

  switch (action.type) {

    case actions.SET_PROGRAM:
      return action.program

    case actions.RUN_PROGRAM:
      if (!action.time) {
        throw new Error('`time` is required')
      }
      return update(program, {
        pausedAt: { $set: 0 },
        startedAt: { $set: action.time },
        stoppedAt: { $set: 0 },
        totalTimePaused: { $set: 0 },
      })

    case actions.PAUSE_PROGRAM:
      if (!action.time) {
        throw new Error('`time` is required')
      }
      return update(program, {
        pausedAt: { $set: action.time }
      })

    case actions.RESUME_PROGRAM:
      if (!action.time) {
        throw new Error('`time` is required')
      }
      return update(program, {
        pausedAt: { $set: 0 },
        totalTimePaused: { $set: program.totalTimePaused + action.time - program.pausedAt }
      })

    case actions.STOP_PROGRAM:
      return update(program, {
        startedAt: { $set: 0 },
        totalTimePaused: { $set: 0 },
        pausedAt: { $set: 0 },
        testStartedAt: { $set: 0 },
      })

    case actions.RUN_TEST:
      if (!action.time) {
        throw new Error('`time` is required')
      }
      if (action.zone == null) {
        throw new Error('`zone` is required')
      }
      if (action.duration == null) {
        throw new Error('`duration` is required')
      }

      return update(program, {
        testStartedAt: { $set: action.time },
        testZone: { $set: action.zone },
        testDuration: { $set: action.duration },
        pausedAt: { $set: 0 },
        totalTimePaused: { $set: 0 },
        startedAt: { $set: 0 },
      })

    case actions.STOP_TEST:
      return update(program, {
        testStartedAt: { $set: 0 },
      })

    case actions.SET_ZONE_DURATION:
      if (action.zone == null) {
        throw new Error('`zone` is required')
      }
      if (action.duration == null) {
        throw new Error('`duration` is required')
      }
      return update(program, {
        schedule: {
          zoneDuration: {
            [action.zone]: { $set: action.duration }
          }
        }
      })

    case actions.SET_ZONE_ENABLED:
      if (action.zone == null) {
        throw new Error('`zone` is required')
      }
      if (action.enabled == null) {
        throw new Error('`enabled` is required')
      }
      return update(program, {
        schedule: {
          zoneEnabled: {
            [action.zone]: { $set: action.enabled }
          }
        }
      })

    case actions.SET_SCHEDULE_ENABLED:
      if (action.enabled == null) {
        throw new Error('`enabled` is required')
      }
      return update(program, {
        enableSchedule: { $set: action.enabled }
      })

    case actions.SET_SCHEDULE_DAY_ENABLED:
      if (!action.day) {
        throw new Error('`day` is required')
      }
      if (action.enabled == null) {
        throw new Error('`enabled` is required')
      }
      return update(program, {
        schedule: {
          daysOfWeek: {
            [action.day]: { $set: action.enabled }
          }
        }
      })

    case actions.SET_SCHEDULE_TIME_OF_DAY:
      if (action.timeOfDay == null) {
        throw new Error('`timeOfDay` is required')
      }
      return update(program, {
        schedule: {
          timeOfDay: { $set: action.timeOfDay }
        }
      })

    default:
      throw new Error('Unknown action')

  }
}