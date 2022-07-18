'use strict';

const crypto = require('node:crypto');
const WebSocket = require('ws');

const debug = require('./debug.js');

// require configs
const clientConfig = require('./../config/client.js');

const reqRes = new Map();
let webSocket = null;

const createSocket = () => {
  webSocket = new WebSocket(clientConfig.snowflakeWebsocketServerHost);

  webSocket.on('close', function(code, reason) {
    debug.websocket(`close due to code: ${code} reason: ${reason}`);
  });

  webSocket.on('error', function(error) {
    debug.websocket(`error: ${error.code}`);
  });

  webSocket.on('message', function(data, _isBinary) {
    data = JSON.parse(data);
    if (reqRes.has(data.id)) {
      reqRes.get(data.id)(data.message);
      reqRes.delete(data.id);
    }
  });

  webSocket.on('open', function() {
    debug.websocket('open');
  });

  webSocket.onclose = function(event) {
    debug.websocket(`is closed due to event: ${event.code}`);
    debug.websocket(`Reconnecting in 5 second.`);
    setTimeout(() => createSocket(), 5e3);
  };
};
createSocket();

const createWebsocketRequest = (data) => {
  return new Promise((resolve, reject) => {
    if (webSocket.readyState !== WebSocket.OPEN) {
      const err = new Error('snowflake websocket client is not yet in open state');
      reject(err);
    }

    data.id = crypto.randomUUID();
    reqRes.set(data.id, (data) => resolve(data));

    webSocket.send(
      JSON.stringify(data)
    );
  });
};

const snowflake = {
  terminate: () => webSocket.terminate(),
  id: () => {
    const data = {
      type: 'SNOWFLAKE_ID',
      message: ''
    };
    return createWebsocketRequest(data);
  },
  decodeId: (id) => {
    const data = {
      type: 'SNOWFLAKE_DECODE_ID',
      message: id
    };
    return createWebsocketRequest(data);
  }
};

module.exports = snowflake;
