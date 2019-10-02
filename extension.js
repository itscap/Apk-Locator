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

async function _findAndroidManifests(projRootDir){
	
	let manifestsInProj = await FileManager.findManifests([], projRootDir, true)
	if (manifestsInProj && manifestsInProj.length > 0) {
		_getProjectOutputDirPath(manifestsInProj)
	} else {
		_showError('Cannot find manifests project, are you sure this is an android proj?');
	}
}

async function _getProjectOutputDirPath(manifestsInProj){
	let outputDir = await FileManager.getProjectOutputDirPath(manifestsInProj)
	if (outputDir) {
		_getApkDirPath(outputDir)
	}else {
		_showError('Cannot find prj output dir, KO');
	}
}

async function _getApkDirPath(outputDir){
	let apkDir = await FileManager.getApkDirPath(outputDir)
				if (apkDir) {
					_showPickFlavourDialog(apkDir)
				}else {
					//TODO: Open outputDir fallback?
					vscode.window.showErrorMessage('Cannot find APK dir, you must make a build first!');
				}
}

async function _showPickFlavourDialog(apkFolder){
	let projFlavours = await FileManager.getSubDirPaths(apkFolder,true)
	let selectedFlavourFolder = await Utils.showPickFlavourDialog(projFlavours)
	_showPickBuildTypeDialog(selectedFlavourFolder)
}

async function _showPickBuildTypeDialog(flavourFolder){
	let buildTypes = await FileManager.getSubDirPaths(flavourFolder,true)
	let selectedBuildTypeFolder = await Utils.showPickBuildTypeDialog(buildTypes)
	_onApkBuildFolderRetrieved(selectedBuildTypeFolder)
}

async function _onApkBuildFolderRetrieved(buildFolder){
	await ShManager.openFolder(buildFolder)
	_showMessage('Apk build folder opened!')
}

function _showMessage(message){
	vscode.window.showInformationMessage(message);
}

function _showError(message){
	vscode.window.showErrorMessage(message)
}

module.exports = {
	activate,
	deactivate
}