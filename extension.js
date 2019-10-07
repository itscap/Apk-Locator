'use strict';
const vscode = require('vscode');
const Utils = require('./src/utils');
const FileManager = require('./src/android_file_manager');
const ShManager = require('./src/sh_manager');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let disposable = vscode.commands.registerCommand('extension.open_apk_release_folder', async function () {
		const rootDir = Utils.getProjectRootPath();
		_findAndroidManifests(rootDir)
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

async function _findAndroidManifests(projRootDir) {

	let manifestsInProj = await FileManager.findManifests([], projRootDir, true)
	if (manifestsInProj && manifestsInProj.length > 0) {
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
		//TODO: Open outputDir fallback?
		vscode.window.showErrorMessage(
			  'Cannot find Apk directory 🤷‍.'
			+ '\nThis directory is generated only after you make a build 👀'
			);
	}
}

/**
 * Android projects could have flavours (eg. develop,staging,production).
 * If so each flavour contains its buildTypes (eg. debug, release),
 * otherwise buildTypes are placed directly inside
 * apk folder.
 */
async function _retrieveBuildDir(currentDir) {
	let subDirs = await FileManager.getSubDirPaths(currentDir, true)
	if(subDirs && subDirs.length>0) {
		//TODO: put lastPathSegments into showPickerDialog fun
		let lastPathSegments = Utils.getLastPathSegments(subDirs)
		let selectedIndex = await Utils.showPickerDialog("Pick one:",lastPathSegments)
		let selectedFolder = subDirs[selectedIndex]
		
		let containsApk = await FileManager.dirContainsApk(selectedFolder)
		if (!containsApk) {
			_retrieveBuildDir(selectedFolder)
		} else {
			_onBuildDirRetrieved(selectedFolder)
		}
	}else{
		_showError('Cannot find apk in the selected directory 😮🤷‍.')
	}
}

async function _onBuildDirRetrieved(buildFolder) {

	let success = await ShManager.openFolder(buildFolder)
	if(success){
	_showMessage(
		'Done! 😄🚀'		
		+'\nYour build folder has been opened! 🎁🎉'
		)
	}else{
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