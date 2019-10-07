"use strict";
const path = require("path");
const fs = require("fs");

/**
 * Recursively search for AndroidManifest file from the given path 
 */
var findManifests = async (manifestsArr, dirToSearch, validateFile) => {
	const MANIFEST_FILE_NAME = "AndroidManifest.xml";
	let fileList = fs.readdirSync(dirToSearch);
	await fileList.forEach(async file => {
		file = dirToSearch + path.sep + file;
		let stat = fs.statSync(file);
		if (!_isFileInADirToExclude(file)) {
			if (stat && stat.isDirectory()) {
				//Is directory: recurse into a subdirectory
				manifestsArr = manifestsArr.concat(
					await findManifests(manifestsArr, file, validateFile)
				);
			} else {
				//Is file 
				if (path.basename(file) === MANIFEST_FILE_NAME) {
					//console.log("Manifest file found! ==> ", file);
					let shouldBePushedIntoArr = !validateFile || _isValidManifestFile(file)
					if (shouldBePushedIntoArr) {
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
	try {
		if (outputDirPath) {
			let apkDirExists = fs.readdirSync(outputDirPath).find(dir => dir == APK_DIR)
			if (apkDirExists) {
				apkDir = path.join(outputDirPath, APK_DIR)
			}
		}
	} catch (e) {
		console.log("Cannot find Apk directory: ", e)
	}
	return apkDir
}

/**
 * Returns an array with the subdirs and files contained in the given path
 * Use @filterFiles flag to return just subdirs
 */
var getSubDirPaths = async (dirPath, filterFiles) => {
	let subDirPaths = []
	if (dirPath) {
		await fs
			.readdirSync(dirPath)
			.forEach(subDir => {
				let file = path.join(dirPath, subDir)
				let stat = fs.statSync(file)
				if (!filterFiles || (stat && stat.isDirectory())) {
					subDirPaths.push(file)
				}
			})
	}
	return subDirPaths
}

var dirContainsApk = async (dir) => {
	const APK_EXTENSION = "apk"
	let containsApk = false

	let dirContents = await getSubDirPaths(dir, false)
	if (dirContents && dirContents.length > 0) {

		containsApk = dirContents.find(file => {
			let ext = file.split('.').pop()
			return (ext === APK_EXTENSION)
		})
	}

	return containsApk
}

//Dirs to skip for sure when searching for AndroidManifest file
function _isFileInADirToExclude(file) {
	const DIR_TO_EXCLUDE = [
		"node_modules",
		".git",
		".gradle",
		".idea",
		path.sep + "ios",
		path.sep + "bin",
		path.sep + "res",
		path.sep + "assets"
	];

	return DIR_TO_EXCLUDE.find(dir => {
		return file.includes(dir);
	});
}

/* 
* Return wether or not the passed file is valid
*/
function _isValidManifestFile(manifestFile) {
	const MANIFEST_EXTENSION = "xml"
	const VALIDATION_TAG = "<application"
	let isValid = false
	//Checks if ext is .xml and file contains "application" tag
	let ext = manifestFile.split('.').pop();
	if (ext === MANIFEST_EXTENSION) {
		let fileContents = fs.readFileSync(manifestFile).toString()
		if (fileContents.includes(VALIDATION_TAG)) {
			isValid = true
		}
	}
	return isValid
}

module.exports = {
	findManifests,
	getProjectOutputDirPath,
	getApkDirPath,
	getSubDirPaths,
	dirContainsApk
};
