"use strict";
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

function getRoot() {
	/*
	* let folderName = vscode.workspace.name; // get the open folder name
	*/
	const rootPath = vscode.workspace.rootPath;
	console.log("rootPath: ", rootPath);
	return rootPath;
}

var pickAFlavourDialog = async (buildDirs) => {

	let selectedIndex = 0
	const PATH_SPLIT_CHAR = "/"//TODO if windows get "\"
	let projFlavours = buildDirs.map(dir => {
		let lastPathSegment = dir.split(PATH_SPLIT_CHAR).slice(-1)[0]
		return lastPathSegment
	})
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
	getRoot,
	pickAFlavourDialog
};
