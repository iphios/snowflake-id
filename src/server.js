'use strict';

// require packages
const cluster = require('node:cluster');
require('./util.js');
const appObj = require('./app.js');
const debug = require('./debug.js');

// require configs
const serverConfig = require('./../config/server.js');

// set up http server
appObj.server.listen(serverConfig.port, () => {
  debug.server(`worker process id: ${process.pid}(${cluster.worker.id}) started on port: ${serverConfig.port}`);
});

// set up server terminate function
const serverTerminate = (() => {
  let _isRunning = false;
  return async() => {
    if (!_isRunning && (_isRunning = true)) {
      debug.server(`worker process id: ${process.pid}(${cluster.worker.id}) terminating`);
      await appObj.onServerTerminate.closeAllClients();
      await appObj.onServerTerminate.closeWebSocketServer();
      appObj.server.close(() => {
        debug.server(`worker process id: ${process.pid}(${cluster.worker.id}) terminated`);
        process.exit(0);
      });
    } else {
      debug.server(`worker process id: ${process.pid}(${cluster.worker.id}) serverTerminate function called twice so skipping it`);
    }
  };
})();

// The SIGTERM signal is a generic signal used to cause program termination when using systemctl stop
process.on('SIGTERM', async(signal) => {
  debug.server(`worker process id: ${process.pid}(${cluster.worker.id}) got signal: ${signal}`);
  await serverTerminate();
});

// The SIGINT signal is a program interrupt triggered by the user when pressing ctrl-c
process.on('SIGINT', async(signal) => {
  debug.server(`worker process id: ${process.pid}(${cluster.worker.id}) got signal: ${signal}`);
  await serverTerminate();
});

// The SIGQUIT signal is similar to SIGINT, except that it’s controlled by a different key—the QUIT character, usually ctrl-\
process.on('SIGQUIT', async(signal) => {
  debug.server(`worker process id: ${process.pid}(${cluster.worker.id}) got signal: ${signal}`);
  await serverTerminate();
});

// uncaughtException signal
process.on('uncaughtException', async(err, origin) => {
  debug.server(`worker process id: ${process.pid}(${cluster.worker.id}) uncaughtException at: ${origin} err: ${err}`);
  await serverTerminate();
});

// uncaughtException signal
process.on('unhandledRejection', async(reason, promise) => {
  debug.server(`worker process id: ${process.pid}(${cluster.worker.id}) Unhandled Rejection at: `, promise, 'reason: ', reason);
  await serverTerminate();
});

// The exit signal event is emitted when the Node.js process is about to exit
process.on('exit', (code) => {
  debug.server(`worker process id: ${process.pid}(${cluster.worker.id}) exit event with code: ${code}`);
});
