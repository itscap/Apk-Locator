"use strict";
const vscode = require("vscode");
const path = require("path");

/**
 * Returns the root path of the currently open project
 */
function getProjectRootPath() {
	return vscode.workspace.rootPath;
}

var getLastPathSegments = (dirs) => {
	return dirs.map(dir => dir.split(path.sep).pop())
}

var isEmptyArray = (obj) => {
	return Array.isArray(obj) && obj.length === 0
}

var showPickerDialog = async (title, subDirs) => {
	let selectedIndex = 0
	let selectedElement = null
	if (!isEmptyArray(subDirs)) {
		let lastPathSegments = getLastPathSegments(subDirs)
		const selection = await vscode.window.showQuickPick(lastPathSegments, {
			label: title,
			canPickMany: false
		});
		selectedIndex = lastPathSegments.findIndex(f => f == selection)
		selectedElement = subDirs[selectedIndex]
	}
	return selectedElement
}

module.exports = {
	getProjectRootPath,
	getLastPathSegments,
	isEmptyArray,
	showPickerDialog
};
