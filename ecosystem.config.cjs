module.exports = {
  apps: [{
    name: 'tsk-growth-website',
    cwd: __dirname,
    script: './server/src/index.js',
    env_production: {
      NODE_ENV: 'production',
    },
  }],
}
