// Vercel function: forwards every request to the compiled NestJS app (built by `npm run build`).
module.exports = require('../dist/src/serverless.js').default;
