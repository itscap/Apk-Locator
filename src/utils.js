"use strict";
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

/**
 * Returns the root path of the currently open project
 */
function getProjectRootPath() {
	const rootPath = vscode.workspace.rootPath;
	//console.log("rootPath: ", rootPath);
	return rootPath;
}

//Eg. develop,staging,production
var showPickFlavourDialog = async (projFlavourSubDirs) => {	
	let projFlavours = projFlavourSubDirs.map(dir => dir.split(path.sep).pop())//lastPathSegments
	let selectedIndex = await showPickerDialog("Pick a project flavour:", projFlavours)
	return projFlavourSubDirs[selectedIndex]
}

//Eg. debug, release
var showPickBuildTypeDialog = async (buildTypeSubDirs) => {
	let buildTypes = buildTypeSubDirs.map(dir => dir.split(path.sep).pop())
	let selectedIndex = await showPickerDialog("Pick a build type:", buildTypes)
	return buildTypeSubDirs[selectedIndex]
}

var showPickerDialog = async (title,elements) => {
	let selectedIndex = 0
	if (elements) {
		const selection = await vscode.window.showQuickPick(elements, {
			label: title,
			canPickMany: false
		});
		selectedIndex = elements.findIndex(f => f == selection)
	}
	return selectedIndex
}

module.exports = {
	getProjectRootPath,
	showPickFlavourDialog,
	showPickBuildTypeDialog
};
