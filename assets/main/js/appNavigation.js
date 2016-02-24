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

            // TODO: SEPERATE THIS FUNCTIONALITY INTO COVERAGE SCRIPT SEE ALSO REMOVE ABOVE; CHANGE ALL SIDEBAR ELEMENTS HTML TO CLASS SIDEBAR
            $('#top .left').append("<div id='coverage-sidebar-stats' class='sidebar' style='width:95%; float:left; margin-top:3%' ><img style='width:95%' src='http://h2281281.stratoserver.net/regmod/img/storyData/indicesDataGrey.jpg'/></div>");
            $('#coverage-sidebar-stats').mouseover(function(){
                $(this).css({"border":"1px solid black"});
            });
            $('#coverage-sidebar-stats').mouseout(function(){
                $(this).css({"border":"1px solid #f5f5f5"});
            });
            $('#coverage-sidebar-stats img').click(function(){
                var $bigPic = $(this).clone();
                $bigPic.css({"position":"absolute","width":"70%","z-index":"9999","top":"10%","left":"15%","border":"1px solid #f5f5f5","border-radius":"10px"});
                $('body').append($bigPic);
                $bigPic.click(function(){
                    $(this).remove();
                    $('.greyoutoverlay').remove();
                });
                $('body').append("<div class='greyoutoverlay'></div>");
            })




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