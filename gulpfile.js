const { series } = require('gulp');
const gulp = require('gulp');
const zip = require('@vscode/gulp-vinyl-zip')
const prompt = require('gulp-prompt');
const clean = require('gulp-clean');
const fs = require('fs');

var sfCase = ''
var pkCode = ''
var instCode = ''
var visa = ''
var cacheObj

function zipGP() {
  console.log(`Creating zip file for GP lottery theme`);

  return gulp.src('../tnls/themes/EU24GPL.zip', { read: false, allowEmpty: true, buffer: false })
    .pipe(clean({ force: true }))
    .pipe(gulp.src('../tnls/themes/EU24GPL/**/*', { buffer: false }))
    .pipe(zip.dest('../tnls/themes/EU24GPL.zip'));
}

function zipNA0() {
  console.log(`Creating zip file for NA0 lottery theme`);

  return gulp.src('../tnls/themes/EU24NA0.zip', { read: false, allowEmpty: true, buffer: false })
    .pipe(clean({ force: true }))
    .pipe(gulp.src('../tnls/themes/EU24NA0/**/*', { buffer: false }))
    .pipe(zip.dest('../tnls/themes/EU24NA0.zip'));
}


function zipFile(cb) {
  var date = new Date
  var dateH = date.getHours()
  var dateM = date.getMinutes()
  date = date.toISOString().split('T')[0].split('-').join('_')
  date = `${date}_${dateH}_${dateM}`
  fs.readFile('config.json', 'utf8', function (err, data) {
    if (err) throw err;
    cacheObj = JSON.parse(data);
    sfCase = cacheObj.sfCase
    pkCode = cacheObj.pkCode
    instCode = cacheObj.instCode
    visa = cacheObj.visa
    console.log(`Default params: ${JSON.stringify(cacheObj)}`)

    return gulp.src('../tn*/**/*')
      .pipe(prompt.prompt({
        type: 'list',
        name: 'choice',
        message: 'Use above params?',
        choices: ['Yes', 'No'],
        default: 0
      }, (res) => {
        console.log('Using default params...');
        if (res.choice === 'Yes') {
          console.log('Creating zip file....');
          gulp.src('../tn*/**/*')
            .pipe(zip.dest(`.././${instCode}zip_${pkCode}_${visa}_${sfCase}_${date}.zip`))
        } else {
          gulp.src('../tn*/**/*')
            .pipe(prompt.prompt([{
              type: 'input',
              name: 'instCode',
              message: 'Enter INST CODE',
              default: instCode
            }, {
              type: 'input',
              name: 'caseNum',
              message: 'Enter case number',
              default: sfCase
            },
            {
              type: 'input',
              name: 'pkCode',
              message: 'Competition code',
              default: pkCode
            },
            {
              type: 'input',
              name: 'visa',
              message: 'VISA',
              default: visa
            }
            ], function (res) {
              sfCase = res.caseNum
              pkCode = res.pkCode
              instCode = res.instCode
              visa = res.visa
              const newcacheObj = {
                "sfCase": sfCase,
                "pkCode": pkCode,
                "instCode": instCode,
                "visa": visa
              }
              fs.writeFile('config.json', JSON.stringify(newcacheObj), function (err) {
                if (err) throw err;
                console.log('Update params to cache complete');
                console.log('Creating zip file....');
                gulp.src('../tn*/**/*')
                  .pipe(zip.dest(`.././${instCode}zip_${pkCode}_${visa}_${sfCase}_${date}.zip`))
              }
              );
            }
            ));
        }
      }))
  });
  cb();
}

exports.zipLottery = series(zipGP, zipNA0);
exports.zipAdminFile = zipFile;
exports.zipAdminFileWithLottery = series(series(zipGP, zipNA0), zipFile);