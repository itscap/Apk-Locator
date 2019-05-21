'use strict';
const vscode = require('vscode');
const Utils = require('./src/utils');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "apk-locator" is now active!');

	let disposable = vscode.commands.registerCommand('extension.open_apk_release_folder',async function () {
		
	
		Utils.findAndroidRoot();
		const rootDir = Utils.getRoot();
		const androidPrjDir = rootDir+"/android";
		if(Utils.hasAndroidProject(androidPrjDir)){

			const apkDir = androidPrjDir+"⁨/app⁩/build⁩/outputs⁩/apk⁩/release⁩"
			await Utils.sh('open file://'+apkDir)
			vscode.window.showInformationMessage('Dir opened!');	
		}else{
			vscode.window.showErrorMessage('Cannot find android project ');
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
