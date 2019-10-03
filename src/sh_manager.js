"use strict";
const proc = require("child_process");
const path = require("path");

async function openFolder(filePath) {
    let cmd = "open file:"
        + path.sep
        + path.sep
        + filePath

    try {
        await _sh(cmd)
        return true
    } catch (e) {
        return false
    }
}

function _sh(cmd) {
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

module.exports = {
    openFolder
};
