"use strict";

const local_vars = require('./local_vars');
const util = require('util');
const PTV = require('./ptv');

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

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

var routeCache = {};
async function routeIDtoNumber(ptv, id) {
    const delay = randInt(200,3000)
    console.log("Waiting for " + delay + " ms")
    await new Promise(rsv => setTimeout(rsv, delay))
    let result = routeCache[id];
    if (result == null || result == undefined) {
        result = await ptv.getRoutes(id);
        routeCache[id] = result;
    }

    return result;
}

const dToS = (d) => (d ? d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2) : null)

async function nextBusStopDepartures(ptv) {

    let _;

    _ = (await ptv.getSearchResults("Oakleigh Station", { route_types: ['2'] }))
    _ = _.stops[3]

    _ = (await ptv.getDepartures('2', _.stop_id, null, {date_utc: '2019-07-20T02:00:50Z', max_results: 1}))
    _ = _.departures

    // _ = _.slice(0,10);
    _ = await Promise.all(
        _.map(
            async (o) => ({
                r_no : (await routeIDtoNumber(ptv, o.route_id)).route.route_number,
                time : dToS(new Date(o.scheduled_departure_utc)),
                est_time: dToS(new Date(o.estimated_departure_utc)),
            })
        )
    )

    _ = _.map(o => `Route ${o.r_no}:     sch ${o.time}  est ${o.est_time}`)

    return _
    
}

const ptv = new PTV(local_vars);
nextBusStopDepartures(ptv).then((data) => {
    console.log(data);
    console.log("done")
})

// let ptv = new PTV(local_vars);
// ptv.getSearchResults("Murrumbeena", {route_types: ['0']}).then(console.log);  



// main().then((result) => {
//     console.log(
//         result.map(({ name, sch, est }) => (`${name} \t sch ${dToS(sch)} \t est ${dToS(est)}`)).join('\n')
//     );
// });