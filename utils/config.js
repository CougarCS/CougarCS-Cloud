const PORT = 3000;

const IN_LAMBDA = !!process.env.LAMBDA_TASK_ROOT;

const PROD = true;

module.exports = { PORT, IN_LAMBDA }