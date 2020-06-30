const chalk = require("chalk");
const pkg = require("./package.json");
const { webext: contents, name } = pkg;
const version = require("./manifest.json").version;
const fs = require("fs");
const { exec } = require("child_process");

const BUILD_ROOT = "./web-ext-artifacts";
const BUILD_NAME = `${name}-${version}`;
const ZIP_FILE = `${BUILD_ROOT}/${BUILD_NAME}.zip`;

console.log(
  chalk.whiteBright(`Building version ${chalk.yellowBright(version)}`)
);

console.log("==============================================");
console.log(`${chalk.cyanBright("cleaning")} ${BUILD_ROOT}`);
fs.rmdirSync(BUILD_ROOT, { recursive: true });
fs.mkdirSync(BUILD_ROOT);

exec(
  `zip -v -dd -j ${ZIP_FILE} ${contents.join(" ")}`,
  (error, stdout, stderr) => {
    if (error) {
      console.error(error.message);
    }
    if (stderr) {
      console.error(stderr);
    }
    console.log(stdout);
    console.log(chalk.green(`Built to: ${ZIP_FILE}`));
    console.log("Can be uploaded to your Mozilla account at:");
    console.log("https://addons.mozilla.org/en-US/developers/addons");
  }
);
