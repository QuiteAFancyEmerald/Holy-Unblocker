module.exports = {
    apps: [{
        name: 'HolyUB',
        script: './backend.js',
        env: {
            PORT: 8078,
            NODE_ENV: "development",
        },
        env_production: {
            PORT: 8078,
            NODE_ENV: "production",
        },
        instances: "1",
        exec_interpreter: "babel-node",
        exec_mode: "fork",
        autorestart: true,
        exp_backoff_restart_delay: 100,
        cron_restart: "*/10 * * * *",
        kill_timeout: 3000,
        watch: false
    }]
};