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

var pickAFlavourDialog = async (buildDirs) => {
	let selectedIndex = 0
	buildDirs = buildDirs.filter(dir => {
		return !dir
			.split(path.sep)
			.pop()//lastPathSegment
			.startsWith('.')
	})
	let projFlavours = buildDirs.map(dir => dir.split(path.sep).pop())

	if (projFlavours) {
		const selection = await vscode.window.showQuickPick(projFlavours, {
			label: "Pick a flavour:",
			canPickMany: false
		});
		selectedIndex = projFlavours.findIndex(f => f == selection)
	}
	return buildDirs[selectedIndex]
}

module.exports = {
	getProjectRootPath,
	pickAFlavourDialog
};
