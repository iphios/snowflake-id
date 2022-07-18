'use strict';

// require packages
const url = require('node:url');
const cluster = require('node:cluster');
const http = require('node:http');
const WebSocket = require('ws');

const debug = require('./debug.js');
const Snowflake = require('./snowflake.class.js');

// require configs
const serverConfig = require('./../config/server.js');

// snowflake obj
const snowflake = new Snowflake(serverConfig.snowflakeBaseMachineProcessId + cluster.worker.id);

// server for webSocket
const server = http.createServer();

const webSocketServer = new WebSocket.Server({
  clientTracking: true,
  server: server
});

const onServerTerminate = {
  closeAllClients: async() => {
    debug.websocket('closing all clients');
    for (let it = webSocketServer.clients.values(), val = it.next().value; val !== undefined; val = it.next().value) {
      await val.close();
    }
    debug.websocket('closed all clients');
  },
  closeWebSocketServer: () => {
    return new Promise((resolve, _reject) => {
      webSocketServer.close(function() {
        debug.websocket('server closed due to server terminate');
        resolve();
      });
    });
  }
};

webSocketServer.on('close', () => {
  debug.websocket('server closes');
});

webSocketServer.on('connection', (websocket, request) => {
  const urlObject = url.parse(request.url, true);
  const clientId = urlObject.query.client_id;

  debug.websocket(`connection from clientId: ${clientId}`);
  debug.websocket(`total clients: ${webSocketServer.clients.size}`);

  websocket.on('message', (data) => {
    debug.websocket(`new request from clientId: ${clientId}`);
    data = JSON.parse(data);
    if (data.type === 'SNOWFLAKE_ID') {
      data.message = snowflake.id();
    } else if (data.type === 'SNOWFLAKE_DECODE_ID') {
      data.message = snowflake.decodeId(data.message);
    }
    websocket.send(JSON.stringify(data));
  });

  websocket.on('close', () => {
    debug.websocket(`disconnected from clientId: ${clientId}`);
    debug.websocket(`total clients: ${webSocketServer.clients.size}`);
  });
});

webSocketServer.on('error', (error) => {
  debug.websocket('server error: ', error);
});

webSocketServer.on('listening', () => {
  debug.websocket('server listening');
});

module.exports = {
  server,
  onServerTerminate
};
