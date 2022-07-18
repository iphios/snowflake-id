'use strict';

const config = {};
config.port = process.env.PORT || 5171;
config.snowflakeBaseMachineProcessId = process.env.SNOWFLAKE_BASE_MACHINE_PROCESS_ID || -1;

module.exports = config;
