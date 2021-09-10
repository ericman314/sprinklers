# Sprinklers

## Directory structure:

  - `pi/`  Code running on the Raspberry Pi. Maintains open socket connection to the server, and turns on the sprinklers when instructed to do so.
  - `server/`  Web server -- acts as relay between client and the Raspberry Pi
    - `src/` ES6 code
      - `serverSprinklers.js`  Web server code. Handles client requests, and determines which sprinklers to turn on.
    - `lib/` Compiled code
  - `client/`  React app served up by the server
    - `src/`  React components
    - `public/`  Static files
    - `dist/`  Build files
    - `index.html`  React app entry point
    - `package.json` React app's package.json
  

## Deployment:

- Deploy the Raspberry Pi code and restart the code:

  `npm run deploy-pi`

- Deploy the server code and restart the server:

  `npm run deploy-server`

- Build the client and deploy the client code:

  `npm run deploy-client`

## Server Responsibilities

The server is responsible for maintaining the sprinkler program and scheduling the sprinklers. It maintains an open
connection to the Pi and tells the Pi when to turn on the sprinklers.

## Server/Client communication

The server and client maintain a common, shared model known as the "program". The program instructs the server when to turn on the sprinklers. It also contains transient state such as the "paused" status. Updates to the program are made through a reducer. The server and client use the same reducer, and actions are sent through API calls ("converge" style).

## Server/Pi communication

The Pi maintains an open socket connection with the server. Periodically, the server instructs the Pi to turn on a
specific zone for a specific duration. The duration is important so that in the event of an internet outage, the
sprinklers don't run forever. If communication is interrupted, the Pi will turn off the zone after the specified
duration.

Normally, communication is unidirectional, but the Pi may send error messages to the server as needed.