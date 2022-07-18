'use strict';

const config = {};
config.snowflakeWebsocketServerHost = process.env.SNOWFLAKE_WEBSOCKET_SERVER_HOST || 'ws://127.0.0.1:5171?client_id=mango';

module.exports = config;
