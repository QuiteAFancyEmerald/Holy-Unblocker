module.exports = {
  apps: [
    {
      name: 'HolyUBPROD',
      script: './backend.js',
      env: {
        PORT: 8051,
        NODE_ENV: 'development',
      },
      env_production: {
        PORT: 8051,
        NODE_ENV: 'production',
      },
      instances: '1',
      exec_interpreter: 'babel-node',
      exec_mode: 'fork',
      autorestart: true,
      exp_backoff_restart_delay: 100,
      cron_restart: '*/10 * * * *',
      kill_timeout: 3000,
      watch: false,
    },
    {
      name: 'HolyUBPROD-src-refresh',
      script: './run-command.mjs',
      args: 'build',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      instances: '1',
      exec_interpreter: 'babel-node',
      exec_mode: 'fork',
      autorestart: true,
      restart_delay: 1000 * 60 * 10,
      kill_timeout: 3000,
      watch: false,
    },
    {
      name: 'HolyUBPROD-cache-clean',
      script: './run-command.mjs',
      args: 'clean',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      instances: '1',
      exec_interpreter: 'babel-node',
      exec_mode: 'fork',
      autorestart: true,
      restart_delay: 1000 * 60 * 60 * 24 * 7,
      kill_timeout: 3000,
      watch: false,
    },
  ],
};
