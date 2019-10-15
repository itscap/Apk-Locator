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
		_showError('Cannot find project output directory 😮🤷‍.');
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

async function _retrieveBuildDir(apkDir) {
	let containsApk = await FileManager.dirContainsApk(apkDir)
	if (containsApk) {
		_onBuildDirRetrieved(containsApk)
	} else {
		_letUserSelectBuildTypes(apkDir)
	}
}

/**
 * Android projects could have flavours (eg. develop,staging,production).
 * If so each flavour contains its buildTypes (eg. debug, release),
 * otherwise buildTypes are placed directly inside
 * apk folder.
 */
async function _letUserSelectBuildTypes(currentDir) {
	let subDirs = await FileManager.getSubDirPaths(currentDir, true)
	if (!Utils.isEmptyArray(subDirs)) {
		let selectedFolder = await Utils.showPickerDialog("Pick one:", subDirs)
		let containsApk = await FileManager.dirContainsApk(selectedFolder)
		if (containsApk) {
			_onBuildDirRetrieved(selectedFolder)
		} else {
			_letUserSelectBuildTypes(selectedFolder)
		}
	} else {
		_showError('Cannot find apk in the selected directory 😮🤷‍.')
	}
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