# snowflake-id
snowflake id websocket server and client

## How to use as server
Use yarn scripts to start `yarn run start`

## How to use as client
Add this as dependency in package.json

```
"dependencies": {
  ...
  "snowflake-id": "git+ssh://git@github.com:iphios/snowflake-id.git#<commit_id>"
  ...
}
```

### How to get new id
```javascript
const snowflake = require('snowflake-id');
(async () => {
  const id = await snowflake.id();
  console.log(id);
})();
```

### How to get decoded infromation for snowflakeId
```javascript
const snowflake = require('snowflake-id');
(async () => {
  const data = await snowflake.decodeId(<snowflakeId>);
  console.log(data);
})();
```

### How to close /stop retrying snowflake client connection
```javascript
const snowflake = require('snowflake-id');
(async () => {
  await snowflake.close();
})();
```