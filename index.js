"use strict";

const HMAC = require('crypto-js/hmac-sha1');
const vars = require('./local_vars');
const axios = require('axios');
const util = require('util');


function generateSignature(request) {
    return HMAC(request, vars.key);
}

async function makePTVrequest(baseString, params) {
    baseString += "?devId=" + vars.devId;
    for (const [key, value] of Object.entries(params)) {
        // Some params (e.g. platform_numbers) take arrays as a value and each element 
        // must be inserted as a duplicate query parameter:
        if (Array.isArray(value)) {
            for (let entry of value) {
                baseString += "&" + key + "=" + entry;
            }
        }
        else {
            baseString += "&" + key + "=" + value;
        }
    }

    baseString += "&signature=" + generateSignature(baseString);

    console.debug(vars.baseURL + baseString)
    const response = await axios.get(vars.baseURL + baseString);
    return response.data;
}

async function getDepartures(routeType, stopId, params = {}) {
    let baseString = "/v3/departures";

    // URI parameters:
    baseString += "/route_type/" + routeType;
    baseString += "/stop/" + stopId;

    const result = await makePTVrequest(baseString, params);
    return result;
}

async function main() {
    const MODE_TRAIN = 0;
    const STOP_PARKDALE = 1154;

    const departures = await getDepartures(MODE_TRAIN, STOP_PARKDALE, { max_results: 2, platform_numbers: [1, 2], });
    console.log(util.inspect(departures))

}

main();












