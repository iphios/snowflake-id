'use strict';

const cluster = require('node:cluster');
const numCPUs = require('node:os').cpus().length;

const debug = require('./debug.js');

if (cluster.isPrimary) {
  debug.cluster(`primary process id: ${process.pid} is started`);

  cluster.on('fork', (worker) => {
    debug.cluster(`worker process id: ${worker.process.pid}(${worker.id}) is forked`);
  });

  cluster.on('online', (worker) => {
    debug.cluster(`worker process id: ${worker.process.pid}(${worker.id}) is online after it was forked`);
  });

  cluster.on('listening', (worker, address) => {
    debug.cluster(`worker process id: ${worker.process.pid}(${worker.id}) is now listening on port: ${address.port}`);
  });

  cluster.on('disconnect', (worker) => {
    debug.cluster(`worker process id: ${worker.process.pid}(${worker.id}) has disconnected`);
  });

  cluster.on('exit', (worker, code, signal) => {
    debug.cluster(`worker process id: ${worker.process.pid}(${worker.id}) is offline with code: ${code} and singal: ${signal}`);
  });

  // The SIGHUP is caused due to nodemon restart, which is the custom signal present in nodemon.json file, SIGUSR2 is the default signal present in nodemon lib/config/defaults.js file
  process.on('SIGHUP', (signal) => {
    debug.cluster(`primary process id: ${process.pid} got signal: ${signal}`);

    for (const worker of Object.values(cluster.workers)) {
      worker.process.kill('SIGTERM');
    }
  });

  // fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else if (cluster.isWorker) {
  require('./server.js');
}
