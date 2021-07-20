const PORT = 3000;

const IN_LAMBDA = !!process.env.LAMBDA_TASK_ROOT;

const PROD = true;

const CACHE_TIME = PROD ? 1000 * 60 * 60 * 4 : 30 * 1000; // 30secs or 4 hours

module.exports = { PORT, IN_LAMBDA, CACHE_TIME }