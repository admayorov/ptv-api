"use strict";

const HMAC = require('crypto-js/hmac-sha1');
const local_vars = require('./local_vars');
const axios = require('axios');
const util = require('util');

class PTV {
    constructor(vars) {
        this.vars = vars;
    }

    generateSignature(request) {
        return HMAC(request, this.vars.key);
    }

    async makePTVrequest(baseString, params = {}) {
        // Remove any trailing "/"
        if (baseString[baseString.length - 1] == '/') {
            baseString = baseString.slice(0, -1)
        }

        baseString += "?devId=" + this.vars.devId;
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

        baseString += "&signature=" + this.generateSignature(baseString);

        console.debug(this.vars.baseURL + baseString)
        let response;
        try {
            response = await axios.get(this.vars.baseURL + baseString);
            return response.data;
        }
        catch (e) {
            console.error("There was an error making the PTV API request:" + e);
            return {};
        }

    }

    async getDepartures(routeType, stopId, routeId, params = {}) {
        let baseString = "/v3/departures";

        // URI parameters:
        baseString += "/route_type/" + routeType;
        baseString += "/stop/" + stopId;
        if (routeId) {
            baseString += "/route/" + routeId;
        }

        const result = await this.makePTVrequest(baseString, params);
        return result;
    }

    async getSearchResults(searchTerm, params = {}) {
        const baseString = "/v3/search/" + encodeURIComponent(searchTerm)
        return this.makePTVrequest(baseString, params);
    }

    async getDirectionsForRoute(routeId, params = {}) {
        const baseString = `/v3/directions/route/${routeId}`
        return this.makePTVrequest(baseString, params);
    }

    async getDirections(directionId, routeType, params = {}) {
        let baseString = `/v3/directions/${directionId}`
        if (routeType) {
            baseString += `/route_type/${routeType}`
        }
        return this.makePTVrequest(baseString, params);
    }

    async getStoppingPatternDetails(runId, routeType, expandList, params = {}) {
        const baseString = `/v3/pattern/run/${runId}/route_type/${routeType}`
        const newParams = {}
        for (const [key, value] in Object.entries(params)) {
            newParams[key] = value;
        }
        if (expandList) {
            newParams["expand"] = expandList;
        }
        return this.makePTVrequest(baseString, params);

    }

    async getRoutes(routeId, params = {}) {
        const baseString = `/v3/routes/${routeId}`
        return this.makePTVrequest(baseString, params);
    }

    async getRunsForRoute(routeId, routeType, params = {}) {
        let baseString = `/v3/stops/route/${routeId}`
        if (routeType) {
            baseString += `/route_type/${routeType}`
        }
        return this.makePTVrequest(baseString, params);
    }

    // async getRuns(runId, routeType, params = {}) {
    //
    // }

    async getStopInfo(stopId, routeType, params = {}) {
        const baseString = `/v3/stops/${stopId}/route_type/${routeType}`
        return this.makePTVrequest(baseString, params);
    }

    async getStopsForRoute(routeId, routeType, params = {}) {
        const baseString = `/v3/stops/route/${routeId}/route_type/${routeType}`
        return this.makePTVrequest(baseString, params);
    }

    async getNearbyStops(latitude, longitude, params = {}) {
        const baseString = `/v3/stops/location/${latitude},${longitude}`
        return this.makePTVrequest(baseString, params);
    }
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
    const MODE_TRAIN = 0;
    const STOP_PARKDALE = 1154;

    let result = await getDepartures(
        MODE_TRAIN, STOP_PARKDALE, null,
        { max_results: 5, platform_numbers: [1], }
    );

    const runId = result.departures[0].run_id

    const getStopName = async (stop_id) => {
        const stop_obj = (await getStopInfo(stop_id, 0)).stop
        return (stop_obj ? stop_obj.stop_name : null)
    }

    result = await getStoppingPatternDetails(runId, 0, ['stop'])
    result = await Promise.all(
        result.departures.map(
            async (o) => ({
                name: await getStopName(o.stop_id),
                sch: new Date(o.scheduled_departure_utc),
                est: (o.estimated_departure_utc ? new Date(o.estimated_departure_utc) : null),
            })
        )
    );




    return result
}

let myPtv = new PTV(local_vars);
myPtv.getSearchResults("Murrumbeena", {route_types: ['0']}).then(console.log);    

// const dToS = (d) => (d ? d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2) : null);

// main().then((result) => {
//     console.log(
//         result.map(({ name, sch, est }) => (`${name} \t sch ${dToS(sch)} \t est ${dToS(est)}`)).join('\n')
//     );
// });












