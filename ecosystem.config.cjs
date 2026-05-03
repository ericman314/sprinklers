module.exports = {
  apps: [{
    name: 'sprinklers',
    script: 'server/src/serverSprinklers.js',
    cwd: '/home/eric/sprinklers/current',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    env: {
      NODE_ENV: 'production',
      PORT: '8084',
      PROGRAM_PATH: '/home/eric/sprinklers/state/program.json',
      CONFIG_PATH: '/home/eric/sprinklers/config/config.json',
      CLIENT_DIST: '/home/eric/sprinklers/current/client/dist',
    },
  }],
  deploy: {
    production: {
      user: 'eric',
      host: '45.56.94.188',
      ref: 'origin/master',
      repo: 'https://github.com/ericman314/sprinklers.git',
      path: '/home/eric/sprinklers',
      'post-deploy': [
        'npm ci',
        'npm run build',
        'pm2 startOrReload ecosystem.config.cjs --only sprinklers',
      ].join(' && '),
    },
  },
}
