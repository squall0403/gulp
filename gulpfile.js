const { series } = require('gulp');
const gulp = require('gulp');
const zip = require('@vscode/gulp-vinyl-zip')
const prompt = require('gulp-prompt');
const clean = require('gulp-clean');
const fs = require('fs');

var sfCase = ''

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
  var cacheObj;
  fs.readFile('config.json', 'utf8', function (err, data) {
    if (err) throw err;
    cacheObj = JSON.parse(data);
    sfCase = cacheObj.sfCase

    return gulp.src('../tn*/**/*')
      .pipe(prompt.prompt({
        type: 'input',
        name: 'data',
        message: 'Enter case number',
        default: sfCase
      }, function (res) {
        sfCase = res.data
        const newcacheObj = {
          "sfCase": sfCase
        }
        fs.writeFile('config.json', JSON.stringify(newcacheObj), function (err) {
          if (err) throw err;
          console.log('Update sfCase to cache complete');
          gulp.src('../tn*/**/*')
            .pipe(zip.dest(`.././uefazip_euro2024_DXA_${sfCase}_${date}.zip`))
        }
        );
      }
      ));
  });
  cb();
}

exports.zipLottery = series(zipGP, zipNA0);
exports.zipAdminFile = zipFile;
exports.zipAdminFileWithLottery = series(series(zipGP, zipNA0), zipFile);