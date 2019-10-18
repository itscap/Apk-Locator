'use strict';
const vscode = require('vscode');
const Utils = require('./src/utils');
const FileManager = require('./src/android_file_manager');
const ShManager = require('./src/sh_manager');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let disposable = vscode.commands.registerCommand('extension.locate_apk', async function () {
		const rootDir = Utils.getProjectRootPath();
		_findAndroidManifests(rootDir)
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

async function _findAndroidManifests(projRootDir) {

	let manifestsInProj = await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: 'Scanning project files... 🔍🤔'
		},
		async () => {
			return await FileManager.findManifests([], projRootDir, true)
		}
	);

	if (!Utils.isEmptyArray(manifestsInProj)) {
		_getProjectOutputDirPath(manifestsInProj)
	} else {
		_showError(
			'Cannot find any AndroidManifest file in project 😮🤷‍.'
			+ '\nAre you sure this is an Android project? 👀'
		);
	}
}

async function _getProjectOutputDirPath(manifestsInProj) {
	let outputDir = await FileManager.getProjectOutputDirPath(manifestsInProj)
	if (outputDir) {
		_getApkDirPath(outputDir)
	} else {
		_showError('Cannot find project output directory 😮🤷‍');
	}
}

async function _getApkDirPath(outputDir) {
	let apkDir = await FileManager.getApkDirPath(outputDir)
	if (apkDir) {
		_retrieveBuildDir(apkDir)
	} else {
		vscode.window.showErrorMessage(
			'Cannot find Apk directory 🤷‍.'
			+ '\nThis directory is generated only after you make a build 👀'
		);
	}
}

/**
 * Android projects could have flavors (eg. develop,staging,production).
 * If so each flavor contains its buildTypes (eg. debug, release),
 * otherwise buildTypes are placed directly inside
 * apk folder.
 * 
 * @param {*} currentDir 
 */
async function _retrieveBuildDir(currentDir) {
	let subDirs = await FileManager.getSubDirPaths(currentDir, true)
	if (!Utils.isEmptyArray(subDirs)) {
		let selectedFolder = await _selectBuildTypeDir(subDirs)
		let containsApk = await FileManager.dirContainsApk(selectedFolder)
		if (containsApk) {
			_onBuildDirRetrieved(selectedFolder)
		} else {
			_retrieveBuildDir(selectedFolder)
		}
	} else {
		_showError('Cannot find apk in the selected directory 😮🤷‍')
	}
}

/**
 * Show picker dialog only if there's more than one @param {Array} subDirs 
 */
async function _selectBuildTypeDir(subDirs) {
	let selectedFolder = null
	if (subDirs.length === 1) {
		selectedFolder = subDirs[0]
	} else {
		selectedFolder = await Utils.showPickerDialog("Pick one:", subDirs)
	}
	return selectedFolder
}

async function _onBuildDirRetrieved(buildFolder) {

	let success = await ShManager.openFolder(buildFolder)
	if (success) {
		_showMessage('Done! 🚀🎉\nYour build folder has been opened!')
	} else {
		_showError('Cannot open build folder 😵☹️')
	}
}

function _showMessage(message) {
	vscode.window.showInformationMessage(message);
}

function _showError(message) {
	vscode.window.showErrorMessage(message)
}

module.exports = {
	activate,
	deactivate
}