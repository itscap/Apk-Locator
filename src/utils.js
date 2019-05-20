'use strict';

const path = require("path");
const proc = require('child_process');


function sh(cmd) {

    return new Promise(function (resolve, reject) {
        proc.exec(cmd, (err, stdout, stderr) => {
          if (err) {
            reject(err);
          } else {
            resolve({ stdout, stderr });
          }
        });
    });
}


module.exports = { sh };