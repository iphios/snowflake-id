'use strict';

const crypto = require('node:crypto');
const WebSocket = require('ws');

const debug = require('./debug.js');

// require configs
const clientConfig = require('./../config/client.js');

const reqRes = new Map();
let webSocket = null;
const retry = {
  connection: true,
  timeout: null
};

const createSocket = () => {
  webSocket = new WebSocket(clientConfig.snowflakeWebsocketServerHost);

  webSocket.on('close', function(code, reason) {
    debug.websocket(`close due to code: ${code} reason: ${reason}`);
    if (retry.connection) {
      debug.websocket(`Reconnecting in 5 second`);
      retry.timeout = setTimeout(() => createSocket(), 5e3);
    }
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
};
createSocket();

const createWebsocketRequest = (data) => {
  return new Promise((resolve, reject) => {
    if (webSocket.readyState !== WebSocket.OPEN) {
      const err = new Error(`snowflake websocket client is not in open state, current state: ${webSocket.readyState}`);
      return reject(err);
    }

    data.id = crypto.randomUUID();
    reqRes.set(data.id, (data) => resolve(data));

    webSocket.send(
      JSON.stringify(data)
    );
  });
};

const snowflake = {
  close: () => {
    return new Promise((resolve, _reject) => {
      clearTimeout(retry.timeout);
      retry.connection = false;
      const callResolveFun = () => {
        debug.websocket('closed');
        resolve();
      };
      if (webSocket.readyState !== WebSocket.CLOSED) {
        webSocket.onclose = function(_event) {
          callResolveFun();
        };
        webSocket.close(4000, 'manual_close');
      } else {
        callResolveFun();
      }
    });
  },
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
