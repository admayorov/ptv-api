"use strict";

const HMAC = require('crypto-js/hmac-sha1');
const vars = require('./local_vars');
const axios = require('axios');
const baseURL = "https://timetableapi.ptv.vic.gov.au/";
const util = require('util');


function generateSignature(request) {
    return HMAC(request, vars.key);
}

async function getDepartures(routeType, stopId) {
    let requestString = "/v3/departures";

    requestString += "/route_type/" + routeType;
    requestString += "/stop/" + stopId;

    requestString += "?devId=" + vars.devId;
    requestString += "&signature=" + generateSignature(requestString);
    
    const response = await axios.get(baseURL + requestString);
    return response.data;
}

async function main() {
    const route_type = 0;
    const stop_id = 1154;

    const departures = await getDepartures(route_type, stop_id);
    console.log(util.inspect(departures))
    
}

main();












