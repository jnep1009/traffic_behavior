/**
 * Created by june on 4/21/16.
 */
define(['jquery', 'd3'], function ($) {

    function getDailySummary(stn_id, date) {
        var get_url = 'avgEachDay?stn_id=' + stn_id + '&date=' + date;
        d3.json(get_url, function (error, json_p) {
            console.log(json_p);
        });
    }

    return {
        getDailySummary: getDailySummary
    }

});