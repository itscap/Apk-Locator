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

function findAndroidRoot(){
  //Find manifest
  const PATH_TO_MANIFEST = "/app/src/main/AndroidManifest.xml";
  const rootDir = getRoot();

  if(!fs.existsSync(rootDir)) 
    return

  getSubDirs(rootDir).forEach(subDir => {
    console.log("subDir=>",subDir);
  });

}

function getSubDirs(dir){
  let dirs = [];
  getDirFiles(dir).forEach(file => {
    let isDirectory = fs.existsSync(file) && fs.lstatSync(file).isDirectory();
    if(isDirectory){
      dirs.push(file)
    }
    /*
    let filePath = path.join('/', rootDir, file)
    console.log("filePath: ",filePath);
    let isDirectory = fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory();
    if(isDirectory){
     console.log("Is dir!");
     paths.push(filePath);
    }
    */
  });

  return dirs
}


function getDirFiles(dir){
  let files = []
  const parentDir = dir;
  fs.readdirSync(dir).forEach(file => {
    const pathToFile =  path.join('/', parentDir, file);
    if(fs.existsSync(pathToFile)){
     files.push(file);
    }
  });
  return files;
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


module.exports = { getRoot,hasAndroidProject,sh,findAndroidRoot };