module.exports = {
  apps: [
    {
      name: 'golfinity-api',
      script: 'npm',
      args: 'run dev:api',
      cwd: './',
      watch: false,
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'golfinity-dashboard',
      script: 'npm',
      args: 'run dev',
      cwd: './apps/admin-dashboard',
      watch: false,
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
