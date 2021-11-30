module.exports = {
    apps: [{
        name: 'HolyUB',
        script: './backend.js',
        env: {
            PORT: 8080,
            NODE_ENV: "development",
        },
        env_production: {
            PORT: 8080,
            NODE_ENV: "production",
        },
        instances: "1",
        exec_mode: "cluster",
        autorestart: true,
        exp_backoff_restart_delay: 100,
        cron_restart: "*/10 * * * *",
        kill_timeout: 3000,
        watch: false
    }]
};