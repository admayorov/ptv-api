"use strict";

const HMAC = require('crypto-js/hmac-sha1');
const axios = require('axios');


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

module.exports = PTV;












