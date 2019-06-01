const HMAC = require('crypto-js/hmac-sha1');
const vars = require('./local_vars');


function generateSignature(request) {
    return HMAC(request, vars.key);
}

function main() {
    const route_type = 0;
    const stop_id = 1154;

    const requestText = `/v3/departures/route_type/${route_type}/stop/${stop_id}?devId=${vars.devId}`;

    signature = generateSignature(requestText);
    console.log(`request: ${requestText}&signature=${signature}`);
}

main();












