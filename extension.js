'use strict';
const vscode = require('vscode');
const Utils = require('./src/utils');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "apk-locator" is now active!');

	let disposable = vscode.commands.registerCommand('extension.open_apk_release_folder',async function () {
		
		/*
		let folderName = vscode.workspace.name; // get the open folder name
		let folderPath = vscode.workspace.rootPath;
		*/

		let folderPath = vscode.workspace.rootPath;
		let res = await Utils.sh('open file://'+folderPath)
		if(res){
			vscode.window.showInformationMessage('OK!');
		}else{
			vscode.window.showInformationMessage('NOT OK!');
		}
		
	
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}


async function sh(cmd) {
    return new Promise(function (resolve, reject) {
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }
