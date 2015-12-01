/**
 * Created by june on 11/23/15.
 */
define(['jquery', 'mapbox','d3'], function ($) {

    function initialize() {
        $.get('getStation',
            function (data) {
                console.log(JSON.parse(data));
            });
    }
    return{
        initialize: initialize
    }
});