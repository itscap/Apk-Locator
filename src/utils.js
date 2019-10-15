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

var showPickerDialog = async (title, elements) => {
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
	getLastPathSegments,
	isEmptyArray,
	showPickerDialog
};
