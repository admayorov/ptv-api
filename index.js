const HMAC = require('crypto-js/hmac-sha1');
const vars = require('./local_vars');

const route_type = 0;
const stop_id = 1154;

const requestText = `/v3/departures/route_type/${route_type}/stop/${stop_id}?devId=${vars.devId}`;
const signature = HMAC(requestText, vars.key);

console.log(`requestText: ${requestText}`);
console.log(`signature: ${signature}`);





