const chalk = require('chalk');
const process = require('process');

const config = require('../config.js');
const { Platform } = require('../platform.js');


module.exports = {
  do: async (cmd) => {
    const cfg = config.read(cmd.config);

    console.log(chalk.yellow('Unlocking platform states...'));
    const platform = new Platform(cfg);
    try {
      // Node this cmd is not very well supported, as this should not be needed if the tf process is executed cleanly.
      // In case the tensorflow actions fails due to not being able to acquire the locks because it unexpectedly exited
      // before, the locks can be released with this command. The `lockId`s in question need to be added to the node's
      // config.
      //
      // IMPORTANT: Only use this when you are sure the lock is not used by another user.
      await platform.unlock();
    } catch (e) {
      console.log(chalk.red(`Could not unlock platform: ${e.message}`));
      process.exit(-1);
    }
    console.log(chalk.green('Done'));
  }
}
