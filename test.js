"use strict";

const local_vars = require('./local_vars');
const util = require('util');

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

let ptv = new PTV(local_vars);
ptv.getSearchResults("Murrumbeena", {route_types: ['0']}).then(console.log);    

// const dToS = (d) => (d ? d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2) : null);

// main().then((result) => {
//     console.log(
//         result.map(({ name, sch, est }) => (`${name} \t sch ${dToS(sch)} \t est ${dToS(est)}`)).join('\n')
//     );
// });