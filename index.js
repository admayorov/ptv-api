"use strict";

const HMAC = require('crypto-js/hmac-sha1');
const vars = require('./local_vars');
const axios = require('axios');
const util = require('util');


function generateSignature(request) {
    return HMAC(request, vars.key);
}

async function getDepartures(routeType, stopId, params = {}) {
    let requestString = "/v3/departures";

    // URI parameters:
    requestString += "/route_type/" + routeType;
    requestString += "/stop/" + stopId;

    // Query parameters:
    requestString += "?devId=" + vars.devId;
    for (const [key, value] of Object.entries(params)) {
        // Some params (e.g. platform_numbers) take arrays as a value and each element 
        // must be inserted as a duplicate query parameter:
        if (Array.isArray(value)) {
            for (let entry of value) {
                requestString += "&" + key + "=" + entry;
            }
        }
        else {
            requestString += "&" + key + "=" + value;
        }
    }


    requestString += "&signature=" + generateSignature(requestString);

    console.debug(vars.baseURL + requestString)
    const response = await axios.get(vars.baseURL + requestString);
    return response.data;
}

async function main() {
    const MODE_TRAIN = 0;
    const STOP_PARKDALE = 1154;

    const departures = await getDepartures(MODE_TRAIN, STOP_PARKDALE, { max_results: 2, platform_numbers: [1, 2], });
    console.log(util.inspect(departures))

}

main();












