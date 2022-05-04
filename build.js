const fs = require("fs").promises;

const spaces = " ".repeat(10);

(async () => {
  try {
    const code = await fs.readFile("index.js", "utf-8");
    const cfn = await fs.readFile("base.yaml", "utf-8");
    const lambdaCode = code.replace(/\n/g, `\n${spaces}`);
    const res = cfn.replace("#LambdaCode", lambdaCode);
    await fs.writeFile("out/template.yaml", res);
  } catch (error) {
    console.error(error);
    throw error;
  }
})();
