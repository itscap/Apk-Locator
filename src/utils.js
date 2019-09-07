"use strict";
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const proc = require("child_process");

function getRoot() {
	/*
		  let folderName = vscode.workspace.name; // get the open folder name
		  */
	const rootPath = vscode.workspace.rootPath;
	console.log("rootPath: ", rootPath);
	return rootPath;
}

var pickADirDialog = async (buildDirs) => {

	const selection = await vscode.window.showQuickPick(["1", "2"], {
		label: "Pick a flavour:",
		canPickMany: false
	});
	console.log(selection);//TODO: HERE
}

var findManifests = async (manifestsArr, dirToSearch, validateFile) => {
	const MANIFEST_FILE_NAME = "AndroidManifest.xml";
	let fileList = fs.readdirSync(dirToSearch);
	await fileList.forEach(async file => {
		file = dirToSearch + "/" + file;//TODO: will this work on windows?
		let stat = fs.statSync(file);
		if (!_isFileInADirToExclude(file)) {
			if (stat && stat.isDirectory()) {
				/* Recurse into a subdirectory */
				manifestsArr = manifestsArr.concat(
					await findManifests(manifestsArr, file, validateFile)
				);
			} else {
				/* Is file */
				if (path.basename(file) === MANIFEST_FILE_NAME) {
					//console.log("Manifest file found! ==> ", file);
					if (validateFile && _isValidManifestFile(file)) {//TODO: Fix if !validate file
						manifestsArr.push(file);
					} else {
						manifestsArr.push(file);
					}
				}
			}
		}
	});
	return manifestsArr;
};

/** 
 * Every android project has the following structure: [ .../app/build⁩/outputs⁩/apk ]
 * Output dir should always be found,
 * but Apk's folders are generated after user makes a build.
 */
var getProjectOutputDirPath = async (manifestsFiles) => {

	const APP_DIR = "app"
	const BUILD_DIR = "build"
	const OUTPUTS_DIR = "outputs"
	
	let projectOutputDirPath = null

	let i = 0
	while (!projectOutputDirPath && i < manifestsFiles.length) {
		//Only the right one contains /app
		let pathSplit = path.dirname(manifestsFiles[i]).split(APP_DIR)
		if (pathSplit && pathSplit.length > 1) {
			let projectAppBaseFolderPath = pathSplit[0]
			projectOutputDirPath = path.join(projectAppBaseFolderPath, APP_DIR, BUILD_DIR, OUTPUTS_DIR)
		}
		++i
	}
	return projectOutputDirPath
}

var getApkDirPath = async (outputDirPath) => {
	const APK_DIR = "apk"
	let apkDir = null
	if (outputDirPath) {
		let apkDirExists = fs.readdirSync(outputDirPath).find(dir => dir == APK_DIR)
		if(apkDirExists){
			apkDir = path.join(outputDirPath, APK_DIR)
		}
	}
	return apkDir
}

var getSubDirPaths = async (dirPath) => {

	let subDirPaths = []
	if (dirPath) {
		await fs.readdirSync(dirPath).forEach(subDir =>{
			subDirPaths.push(path.join(dirPath, subDir))
		})
	}
	return subDirPaths
}



//Dir to skip for sure
function _isFileInADirToExclude(file) {
	const DIR_TO_EXCLUDE = [
		"node_modules",
		".git",
		".gradle",
		".idea",
		"/ios",
		"/bin",
		"/res",
		"/assets"
	];

	return DIR_TO_EXCLUDE.find(dir => {
		return file.includes(dir);
	});
}

//Return wether or not the passed file is valid
function _isValidManifestFile(manifestFile) {
	return true; //TODO: Check if ext is .xml and contains "application" tag
}

function getSubDirs(dir) {
	let dirs = [];
	getDirFiles(dir).forEach(file => {
		console.log("getSubDirs file => ", file);

		if (fs.lstatSync(file).isDirectory()) {
			dirs.push(file);
		}
	});

	return dirs;
}

function getDirFiles(dir) {
	let files = [];
	const parentDir = dir;
	fs.readdirSync(dir).forEach(file => {
		const pathToFile = path.join("/", parentDir, file);
		console.log("getDirFiles file => ", pathToFile);
		if (fs.existsSync(file)) {
			files.push(file);
		}
	});
	return files;
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

module.exports = { getRoot, sh, findManifests, getProjectOutputDirPath, getApkDirPath, getSubDirPaths, pickADirDialog };
