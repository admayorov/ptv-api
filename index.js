"use strict";

const HMAC = require('crypto-js/hmac-sha1');
const vars = require('./local_vars');
const axios = require('axios');
const util = require('util');


function generateSignature(request) {
    return HMAC(request, vars.key);
}

async function makePTVrequest(baseString, params = {}) {
    // Remove any trailing "/"
    if (baseString[baseString.length - 1] == '/') {
        baseString = baseString.slice(0, -1)
    }

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
    let response;
    try {
        response = await axios.get(vars.baseURL + baseString);
    }
    catch (e) {
        console.error("There was an error making the PTV API request:");
        throw e;
    }
    return response.data;
}

async function getDepartures(routeType, stopId, routeId, params = {}) {
    let baseString = "/v3/departures";

    // URI parameters:
    baseString += "/route_type/" + routeType;
    baseString += "/stop/" + stopId;
    if (routeId) {
        baseString += "/route/" + routeId;
    }

    const result = await makePTVrequest(baseString, params);
    return result;
}

async function getSearchResults(searchTerm, params = {}) {
    const baseString = "/v3/search/" + encodeURIComponent(searchTerm)
    return makePTVrequest(baseString, params);
}

async function getDirectionsForRoute(routeId, params = {}) {
    const baseString = `/v3/directions/route/${routeId}`
    return makePTVrequest(baseString, params);
}

async function getDirections(directionId, routeType, params = {}) {
    let baseString = `/v3/directions/${directionId}`
    if (routeType) {
        baseString += `/route_type/${routeType}`
    }
    return makePTVrequest(baseString, params);
}

async function getStoppingPatternDetails(runId, routeType, expandList, params = {}) {
    const baseString = `/v3/pattern/run/${runId}/route_type/${routeType}`
    const newParams = {}
    for ([key,value] in Object.entries(params)) {
        newParams[key] = value;
    }
    if (expandList) {
        newParams["expand"] = expandList;
    }
    return makePTVrequest(baseString, params);

}

async function getRoutes(routeId, params = {}) {
    const baseString = `/v3/routes/${routeId}`
    return makePTVrequest(baseString, params);
}

async function getRunsForRoute(routeId, routeType, params = {}) {
    let baseString = `/v3/stops/route/${routeId}`
    if (routeType) {
        baseString += `/route_type/${routeType}`
    }
    return makePTVrequest(baseString, params);
}

// async function getRuns(runId, routeType, params = {}) {
//
// }

async function getStopsForRoute(routeId, routeType, params = {}) {
    const baseString = `/v3/stops/route/${routeId}/route_type/${routeType}`
    return makePTVrequest(baseString, params);
}

async function getNearbyStops(latitude, longitude, params = {}) {
    const baseString = `/v3/stops/location/${latitude},${longitude}`
    return makePTVrequest(baseString, params);
}

// ----------------------------------------------

async function test() {
    const MODE_TRAIN = 0;
    const STOP_PARKDALE = 1154;

    const departures = await getDepartures(
        MODE_TRAIN, STOP_PARKDALE, null,
        { max_results: 5, platform_numbers: [1, 2], }
    );
    console.log(departures);
    



    // getDirectionsForRoute(routeId, params = { max_results: 5 })



    
    const search = await getSearchResults("Parkdale Station");
    console.log(search);
}

async function main() {

    await test()


}


main();












