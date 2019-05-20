import { exec } from 'child_process';
/* UTILS */

const Utils = {
  initCommands(context) {
    const {
      commands
    } = vscode.extensions.getExtension('fabiospampinato.vscode-open-in-finder').packageJSON.contributes;
    commands.forEach(({
      command,
      title
    }) => {
      const commandName = _.last(command.split('.')),
            handler = Commands[commandName],
            disposable = vscode.commands.registerCommand(command, () => handler());

      context.subscriptions.push(disposable);
    });
    return Commands;
  },

  folder: {
    getRootPath(basePath) {
      const {
        workspaceFolders
      } = vscode.workspace;
      if (!workspaceFolders) return;
      const firstRootPath = workspaceFolders[0].uri.fsPath;
      if (!basePath || !absolute(basePath)) return firstRootPath;

      const rootPaths = workspaceFolders.map(folder => folder.uri.fsPath),
            sortedRootPaths = _.sortBy(rootPaths, [path => path.length]).reverse(); // In order to get the closest root


      return sortedRootPaths.find(rootPath => basePath.startsWith(rootPath));
    },

    sh(cmd) {
      return new Promise(function (resolve, reject) {
        exec(cmd, (err, stdout, stderr) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              stdout,
              stderr
            });
          }
        });
      });
    }

  }
};
/* EXPORT */

export default Utils;