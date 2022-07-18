'use strict';

/**
 * @prototype
 * @desc custom async for each function.
 * @param {Function} cbk callback function for async forEach.
 */
Object.defineProperty(Array.prototype, 'asyncForEach', {
  value: async function(callbackFn, thisArg) {
    const len = this.length;
    for (let i = 0; i < len; i++) {
      await callbackFn.call(thisArg, this[i], i, this);
    }
  }
});

/**
 * @prototype
 * @desc custom async for each function.
 * @param {Function} cbk callback function for async map.
 */
Object.defineProperty(Array.prototype, 'asyncMap', {
  value: async function(callbackFn, thisArg) {
    const arr = [];
    const len = this.length;
    for (let i = 0; i < len; i++) {
      arr.push(await callbackFn.call(thisArg, this[i], i, this));
    }
    return arr;
  }
});

/**
 * @prototype
 * @desc this function is used to check string is uuidv4 or not
 * {@link https://stackoverflow.com/questions/19989481/how-to-determine-if-a-string-is-a-valid-v4-uuid}.
 * {@link https://stackoverflow.com/questions/12808597/php-verify-valid-uuid}.
 */
Object.defineProperty(String.prototype, 'isUUIDv4', {
  value: function() {
    const regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    return regex.test(this);
  }
});
