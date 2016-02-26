/**
 *  Logic for the navigation of the regmod module
 */
$(function(){

    $('#test1').hide();

    $('.navi li a').click(function(){
        // handle navigation styling
        $('.navi li a').attr('class','');
        $(this).attr('class','active');

        $('#coverage-sidebar-stats').remove();

        $('.footer').appendTo('body');


        if($(this).parent().attr('class') == 'coverage'){

            $('#timeline').show();

            // show coverage inline stats text
            coverageTextStats();

            // hack to force the map to refresh (map will be distorted after beeing hidden)
            mapController.getMapObj()._onResize();
            $('#map').show();

            coverageController.init();

            // Enable/Disable filtering of events based on timeline selected timeframe
            mapController.updateAppSettings('filterByTimeframe', true);

            $('#advancedSelect').hide();
            
        }else if($(this).parent().attr('class') == 'evaluation'){

            $('#advancedSelect').hide();
            $('#timeline').hide();

            // hack to force the map to refresh (map will be distorted after beeing hidden)
            mapController.getMapObj()._onResize();
            $('#map').show();

            /*
            if(typeof selectedEventIds !== 'undefined'){
                selectedEventIds = undefined;
            }
*/
            // Enable/Disable statistics (toggle events,...)
            mapController.updateAppSettings('enableStatistics',true);

            mapController.updateApp(lacatorArr['year'], lacatorArr['month']);

        }else if($(this).parent().attr('class') == 'mapBrowser'){

            $('#advancedSelect').show();
            $('#timeline').show();

            // Enable/Disable statistics (toggle events,...)
            mapController.updateAppSettings('enableStatistics',false);

            // Enable/Disable filtering of events based on timeline selected timeframe
            mapController.updateAppSettings('filterByTimeframe', false);

            // hack to force the map to refresh (map will be distorted after beeing hidden)
            mapController.getMapObj()._onResize();
            $('#map').show();

            /*
            if(typeof selectedEventIds !== 'undefined'){
                selectedEventIds = undefined;
            }

*/
            $('#advancedSelect').show();

            mapController.updateApp(lacatorArr['year'], lacatorArr['month']);

        }
        /* DASHBOARD NAVIGATION IS IN widgets assets js dashboard.js*/

    });


});