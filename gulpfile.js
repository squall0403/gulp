const { series } = require("gulp");
const gulp = require("gulp");
const zip = require("@vscode/gulp-vinyl-zip");
const prompt = require("gulp-prompt");
const clean = require("gulp-clean");
const gulpGit = require("gulp-git");
const fs = require("fs");

var sfCase = "";
var pkCode = "";
var instCode = "";
var visa = "";
var cacheObj;
var gitSrc = "";
var cacheObj = {};
function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + "/" + file).isDirectory();
  });
}
async function readConfigData() {
  fs.readFile("config.json", "utf8", function (err, data) {
    if (err) throw err;
    cacheObj = JSON.parse(data);
    sfCase = cacheObj.sfCase;
    pkCode = cacheObj.pkCode;
    instCode = cacheObj.instCode;
    visa = cacheObj.visa;
    gitSrc = cacheObj.gitSrc;
    console.log(cacheObj);
  });
}
async function cpFilesToGit() {
  return gulp.src("../tn*/**/*").pipe(gulp.dest(gitSrc));
}
async function zipLottery() {
  const lotName = getDirectories("../tnls/themes");
  lotName.forEach((lot) => {
    console.log(`Creating zip file for ${lot} lottery...`);

    return gulp
      .src(`../tnls/themes/${lot}.zip`, { read: false, allowEmpty: true, buffer: false })
      .pipe(clean({ force: true }))
      .pipe(gulp.src(`../tnls/themes/${lot}/**/*`, { buffer: false }))
      .pipe(zip.dest(`../tnls/themes/${lot}.zip`));
  });
}
function zipFile(cb) {
  var date = new Date();
  var dateH = date.getHours();
  var dateM = date.getMinutes();
  date = date.toISOString().split("T")[0].split("-").join("_");
  date = `${date}_${dateH}_${dateM}`;
  console.log("Starting zip file for ELCA Admin...");

  console.log(`Default params: ${JSON.stringify(cacheObj)}`);

  return gulp.src("../tn*/**/*").pipe(
    prompt.prompt(
      {
        type: "list",
        name: "choice",
        message: "Use above params as default?",
        choices: ["Yes", "No"],
        default: 0,
      },
      (res) => {
        console.log("Using default params...");
        if (res.choice === "Yes") {
          console.log("Creating zip file....");
          gulp.src("../tn*/**/*").pipe(zip.dest(`.././${instCode}zip_${pkCode}_${visa}_${sfCase}_${date}.zip`));
        } else {
          gulp.src("../tn*/**/*").pipe(
            prompt.prompt(
              [
                {
                  type: "input",
                  name: "instCode",
                  message: "Enter INST CODE",
                  default: instCode,
                },
                {
                  type: "input",
                  name: "caseNum",
                  message: "Enter case number",
                  default: sfCase,
                },
                {
                  type: "input",
                  name: "pkCode",
                  message: "Competition code",
                  default: pkCode,
                },
                {
                  type: "input",
                  name: "visa",
                  message: "VISA",
                  default: visa,
                },
              ],
              (res) => {
                sfCase = res.caseNum;
                pkCode = res.pkCode;
                instCode = res.instCode;
                visa = res.visa;
                const newcacheObj = {
                  sfCase: sfCase,
                  pkCode: pkCode,
                  instCode: instCode,
                  visa: visa,
                  gitSrc: gitSrc,
                };
                fs.writeFile("config.json", JSON.stringify(newcacheObj), (err) => {
                  if (err) throw err;
                  console.log("Update params to cache complete");
                  console.log("Creating zip file....");
                  gulp.src("../tn*/**/*").pipe(zip.dest(`.././${instCode}zip_${pkCode}_${visa}_${sfCase}_${date}.zip`));
                });
              }
            )
          );
        }
      }
    )
  );

  cb();
}
exports.zipLottery = zipLottery;
exports.zipAdminFile = series(readConfigData, zipFile);
exports.cpFilesToGit = cpFilesToGit;
exports.readConfigData = readConfigData;
exports.zipAdminFileWithLottery = series(readConfigData, zipLottery, zipFile);
