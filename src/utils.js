'use strict';
const vscode = require('vscode');
const path = require("path");
const fs = require("fs"); 
const proc = require('child_process');


function getRoot(){
	/*
		let folderName = vscode.workspace.name; // get the open folder name
		*/
    const rootPath = vscode.workspace.rootPath;
    console.log("rootPath: ",rootPath);
    return rootPath;
}



function hasAndroidProject(rootAndroidDir){

  const manifestPath = rootAndroidDir+"/app/src/main/AndroidManifest.xml"
  if (fs.existsSync(manifestPath)) {
    console.log("hasAndroidProject: AndroidManifest exists!");
    //android/app/src/main
    return true;
  }

  return false;
}

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


module.exports = { getRoot,hasAndroidProject,sh };