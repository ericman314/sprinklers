import React from 'react'

export function ProgramEditor({ program }) {



  const zones = [0, 1, 2, 3, 4, 5, 6, 7]
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const times = ["12:00 AM", "12:30 AM", "1:00 AM", "1:30 AM", "2:00 AM", "2:30 AM", "3:00 AM", "3:30 AM", "4:00 AM", "4:30 AM", "5:00 AM", "5:30 AM", "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"]
  const testDurations = [1, 2, 5, 10]

  function handleDurationChange() {

  }

  function handleEnableScheduleChange() {

  }

  function getWeeklyPrecip() {

  }

  function getMonthlyCost() {

  }

  if (!program) {
    return 'Loading...'
  }

  console.log(program)
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
              <span><input value={program.schedule.zoneDuration[i]} size={4} onChange={handleDurationChange} /></span>
              <span>
                <span class='toggle'>
                  <input ng-attr-id="{{ 'enable-zone-' + (i+1) }}" type='checkbox' ng-model="programs.enabled[i]" ng-change="programChanged()" />
                  <label ng-attr-for="{{'enable-zone-' + (i+1) }}" >{program.schedule.zoneEnabled[i] ? 'Enabled' : 'Disabled'}</label>
                </span>
              </span>
              <span>{getWeeklyPrecip(i)}</span>
              <span ng-show="currentZone === i+1">TODO: Show zone time remaining</span>

            </div>
          ))}

        </div>

        <button id="run-program" ng-show="!programRunning" ng-click="runProgramNow()">Run program now</button>
        <span ng-show="programRunning">Running</span>
        <button id="stop-program" ng-show="programRunning" ng-click="stopProgramNow()">Stop program</button>
        <button id="pause-program" ng-show="programRunning && !programPaused" ng-click="pauseProgramNow()">Pause</button>
        <button id="resume-program" ng-show="programRunning && programPaused" ng-click="resumeProgramNow()">Resume</button>
        <span ng-show="programRunning">TODO: Show program time remaining</span>

        <hr />
        <span class='toggle'>
          <input id='enableSchedule' type='checkbox' value={program.enableSchedule} onChange={handleEnableScheduleChange} />
          <label for='enableSchedule'>{program.enableSchedule ? 'On' : 'Off'}</label>
        </span>
        Repeat on a schedule

        <div ng-show="programs.enableSchedule">
          <p>
            {days.map(day => (
              <span class='flatToggle' ng-repeat='day in days'>
                <input ng-attr-id="{{ 'sched-day-' + day }}" type='checkbox' ng-model="programs.flexSched.days[day]" ng-change="programChanged()" />
                <label ng-attr-for="{{'sched-day-' + day }}">{day}</label>
              </span>
            ))}
          </p>
          <p>
            <select ng-model="programs.flexSched.time" ng-change="programChanged()">
              {times.map(time => (
                <option value={time}>{time}</option>
              ))}
            </select>
            <span ng-show="programs.enableSchedule">Next run: TODO: Show next run</span>
          </p>
        </div>

        <div ng-show="!programRunning">
          <hr />
          <b>Test</b>
          <br />
          <select ng-model="testZone">
            {zones.map(i => (
              <option ng-repeat="zone in zoneNums" value={i}>Zone {i + 1}</option>
            ))}
          </select>

          <select ng-model="testDuration">
            {testDurations.map(duration => (
              <option value={duration}>{duration} minutes</option>
            ))}
          </select>
          <button id="run-test" ng-show="!testRunning" ng-click="runTestNow()">Test now</button>
          <button id="stop-test" ng-show="testRunning" ng-click="stopTestNow()">Stop test</button>
          <span ng-show="testRunning">Running</span>
        </div>

        <div>
          Wind speed: <span ng-class="{tooWindy:tooWindy}">TODO: Show wind speed mph</span>
        </div>

        <div>
          Estimated monthly cost: {getMonthlyCost()} (plus base charge of $13.25)
        </div>

      </span>

      <div class="img-wrapper">
        <img id='zone0' src="no-zone.png" />
        <img id='zone1' src="zone1.png" ng-show="currentZone === 1" ng-class="{paused: programPaused}" />
        <img id='zone2' src="zone2.png" ng-show="currentZone === 2" ng-class="{paused: programPaused}" />
        <img id='zone3' src="zone3.png" ng-show="currentZone === 3" ng-class="{paused: programPaused}" />
        <img id='zone4' src="zone4.png" ng-show="currentZone === 4" ng-class="{paused: programPaused}" />
        <img id='zone5' src="zone5.png" ng-show="currentZone === 5" ng-class="{paused: programPaused}" />
        <img id='zone6' src="zone6.png" ng-show="currentZone === 6" ng-class="{paused: programPaused}" />
        <img id='zone7' src="zone7.png" ng-show="currentZone === 7" ng-class="{paused: programPaused}" />
        <img id='zone8' src="zone8.png" ng-show="currentZone === 8" ng-class="{paused: programPaused}" />
      </div>

    </div>

  )
}