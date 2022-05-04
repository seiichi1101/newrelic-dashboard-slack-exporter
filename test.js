const lambda = require("./index");

(async () => {
  try {
    await lambda.handler("");
  } catch (error) {
    console.error(error);
    throw error;
  }
})();
