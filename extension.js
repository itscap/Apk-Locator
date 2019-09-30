'use strict';
const vscode = require('vscode');
const Utils = require('./src/utils');
const FileManager = require('./src/android_file_manager');
const ShManager = require('./src/sh_manager');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "apk-locator" is now active!');

	let disposable = vscode.commands.registerCommand('extension.open_apk_release_folder', async function () {

		const rootDir = Utils.getProjectRootPath();
		let manifestsInProj = await FileManager.findManifests([], rootDir, true)
		if (manifestsInProj && manifestsInProj.length > 0) {

			let outputDir = await FileManager.getProjectOutputDirPath(manifestsInProj)
			if (outputDir) {

				let apkDir = await FileManager.getApkDirPath(outputDir)
				if (apkDir) {
					let projFlavours = await FileManager.getSubDirPaths(apkDir,true)
					let selectedFlavourFolder = await Utils.showPickFlavourDialog(projFlavours)
					
					let buildTypes = await FileManager.getSubDirPaths(selectedFlavourFolder,true)
					let selectedBuildTypeFolder = await Utils.showPickBuildTypeDialog(buildTypes)

					await ShManager.openFolder(selectedBuildTypeFolder)
					vscode.window.showInformationMessage('Dir opened!');
				} else {
					//TODO: Open outputDir fallback?
					vscode.window.showErrorMessage('Cannot find APK dir, you must make a build first!');
				}

			} else {
				vscode.window.showErrorMessage('Cannot find prj output dir, KO');//TODO
			}

		} else {
			vscode.window.showErrorMessage('Cannot find manifests project, are you sure this is an android proj?');
		}

	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}