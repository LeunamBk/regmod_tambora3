var statisticsModel = {

    meanGhcnmOff : "",

    inlineStatsDataYiiDom : '#tableInlineStatsData-content',
    inlineStatsBaseHref : "",

    // jquery dom referneces of the yii data routes to urls
    parseYiiDomDataRoutes : function() {
        this.inlineStatsBaseHref = $(this.inlineStatsDataYiiDom).attr('data-url');
    },

    cruInlineStatsReconstructionHref : function() {

        var baseDataHref = this.inlineStatsBaseHref;
        var formData = controller.getEventFormData();
        var year = mapController.getSelectedYear();
        var month = mapController.getSelectedMonth();

        var hrefData = baseDataHref+'?mode=reconstructed_data&year='+year+'&month='+month+'&eventIds='+JSON.stringify(formData);
        return hrefData;

    }


}

var statisticsView = {

    updateStatsOnReconstruction : function(){

        var statsHref = statisticsController.getCruInlineStatsHref();
        var meanGhcnmOff = statisticsController.getMeanGhcnmOff();

        $.getJSON(statsHref,
            function(res){
                var cruOff = res['cruStats']['comparisonStats']['mean'].toFixed(2)
                if(meanGhcnmOff != "") {
                    var stationOffMean = meanGhcnmOff.toFixed(2);
                    $('#stationTextMean').text(stationOffMean);
                    $('.stationInlineDescription').show();

                } else {
                    $('.stationInlineDescription').hide();
                    $('#stationTextMean').text(null);

                }
                $('#cruText').text(cruOff);
                $('#mapStats').show();
            }
        );
    }

}

var statisticsController = {

    init : function(){
        statisticsModel.parseYiiDomDataRoutes();
    },

    setMeanGhcnmOff : function(off){
        statisticsModel.meanGhcnmOff = off;
    },

    getMeanGhcnmOff : function(off){
        return statisticsModel.meanGhcnmOff;
    },

    getCruInlineStatsHref : function(){
        return statisticsModel.cruInlineStatsReconstructionHref();
    },

    renderUpdate : function(){
        statisticsView.updateStatsOnReconstruction();
    }



}

$(function(){
    // int parts of the statistics modele
    // NOTE: this asset is only part refactores the underlyiing parts rely on some
    // global variables. The whole asset should be refactored and directly incorparated in
    // the different module parts e.g. the reconstruction asset or the coverage (selectByRegion) asset
    statisticsController.init();
})


// Populate Info Table and Text
function getStats(res){
    // Stats for station data
    if(typeof res['stationStats'] !== 'undefined'){
        var allStOff = [];
        for(var evid in res['stationStats']){
            for(vals in res['stationStats'][evid]){
                allStOff.push(res['stationStats'][evid][vals]);
            }
        }
        var avgSt = average(allStOff).toFixed(2);
        var stdSt = stddev(allStOff).toFixed(2);

        // set stats text
        if(avgSt != "" && stddev != "") {
            $('#stationTextMean').text(avgSt);
            $('#stationTextStd').text(stdSt);
        } else {
            $('#stationTextMean').text(null);
            $('#stationTextStd').text(null);
        }
    }

    // cru Stats
    if(typeof res['cruStats'] !== 'undefined'){
        var allCruOff = [];
        for(var evid in res['cruStats']){
            allCruOff.push(res['cruStats'][evid][0]);
        }
        var avgCru = average(allCruOff).toFixed(2);

        // set stats text
        if(avgCru != "") {
            $('#cruText').text(avgCru);
        } else {
            $('#cruText').text(null);
        }
    }

    // show stats
    // TODO: FIX THIS THAT STAT WERE ONLY DISPALAYED IF AVAILABLE 
    if(avgSt != "" || stddev != "" || avgCru != ""){
    } else {
    }
}

function updateStats(){

    var selectedEventIds = mapController.getSelectedEventIds();
    var selYear = mapController.getSelectedYear();
    var selMonth = mapController.getSelectedMonth();
    var allEventIds = mapController.getAllEventIds();

    if(selectedEventIds[0] != null && selectedEventIds.length != allEventIds.length){

        // check if bounding box was defined and load data appropriate
        var statsHref = $('#tableInlineStatsData-content').attr('data-url');
        console.log(statsHref+'?mode=select_data&year='+selYear+'&month='+selMonth+'&eventIds='+selectedEventIds.toString())
        $.getJSON(statsHref+'?mode=select_data&year='+selYear+'&month='+selMonth+'&eventIds='+selectedEventIds.toString(),//+'&areaView='+bbox,
            function(res){
                // check if view is available in db
                var cruOff = res['cruStats']['comparisonStats']['mean'].toFixed(2);
                if(res['ghcnmStats']['mean'] != "") {
                    var ghcnmStats = parseFloat(res['ghcnmStats']['mean']);
                    $('#stationTextMean').text(ghcnmStats.toFixed(2));
                    $('.stationInlineDescription').show();
                } else {
                    $('.stationInlineDescription').hide();
                    $('#stationTextMean').text(null);
                }
                $('#cruText').text(cruOff);
                $('#mapStats').show();
            }
        )

    } else if (selectedEventIds.length === allEventIds.length){

        // check if bounding box was defined and load data appropriate
        var statsHref = $('#tableInlineStatsData-content').attr('data-url');
        var bbox = checkBoundingBox()[0]
        if(bbox === 1){
            var statsConString = statsHref+'?year='+selYear+'&month='+selMonth;
        } else {
            var statsConString = statsHref+'?mode=bbox_data&year='+selYear+'&month='+selMonth+'&bbox='+bbox;
        }

        $.getJSON(statsConString,
            function(res){
                var cruOff = res['cruStats']['comparisonStats']['mean'].toFixed(2)
                if(meanGhcnmOff != "") {
                    var stationOffMean = meanGhcnmOff.toFixed(2);
                    $('#stationTextMean').text(stationOffMean);
                    $('.stationInlineDescription').show();

                } else {
                    $('.stationInlineDescription').hide();
                    $('#stationTextMean').text(null);

                }
                $('#cruText').text(cruOff);
                $('#mapStats').show();
            }
        )
    } else {
        $('#cruText').text(null);
        $('#stationTextMean').text(null);
    }
};

function addInfoTable(indicesData){
    // get table statistics data
    if(typeof allEventIds !== 'undefined'){
        var indicesHref = $('#tableStatisticsData-content').attr('data-url');
        $.getJSON(indicesHref+'?year='+selYear+'&month='+selMonth+'&eventIds='+selectedEventIds.toString(),//+'&areaView='+bbox,
            function(res){
                addTable1(indicesData, res['cruStats'], res['ghcnmStats']);
                updateStats(selectedEventIds, selYear, selMonth);
            });
    } else {
        $('#jstable table').remove();
        $('.mainText').hide();
        $(".center h1").remove();
        $( "<center><h1 style='margin-top:20%;'><i>no data available</i></h1></center>" ).appendTo( ".center" );
    }
}

function addTable1(geojson, cruStats, stStats) {
    if(geojson !== ''){
        $('.center h1').remove();
        gjsondata = GeoJSON.parse(geojson, {Point: ['lat', 'lon']});

        var myTableDiv = document.getElementById("jstable");
        var table = document.createElement('TABLE');
        var tableBody = document.createElement('TBODY');

        table.border = '1'
        table.appendChild(tableBody);

        var heading = new Array();
        heading[0] = "Location";
        heading[1] = "Events";
        heading[2] = "Value";
        heading[3] = "CRU offset [\u00B0C]";
        if(stStats != '') {
            heading[4] = "Station offset [\u00B0C]";
        }

        var stock = new Array()
        var mycount = 0;

        if(!gjsondata.features){
            gjsondata =  gjsondata[0];
        }

        for(var j = 0; j < gjsondata.features.length; j++){
            var location = geojson[j].location;
            var flag = 0;

            if(stock.length > 0){
                for(var i = 0; i < stock.length; i++){
                    var stack = String(stock[i][0]);
                    if(stack == String(location)){
                        stock[i][1] = 1 + parseInt(stock[i][1]);
                        var tindex = gjsondata.features[j].properties.idx;
                        stock[i][2] += ', ' + tindex;
                        flag = 1;
                    }
                }
            }

            if(flag == 0){
                var tindex = gjsondata.features[j].properties.idx;
                var evId = gjsondata.features[j].properties.event_id;

                // populate table
                if(typeof stStats[evId] === "undefined") {
                    if(stStats == ""){
                        stock.push(new Array(location, "1", tindex, cruStats[evId]));
                    } else {
                        stock.push(new Array(location, "1", tindex, cruStats[evId],'-'));
                    }
                } else {
                    stock.push(new Array(location, "1", tindex, cruStats[evId], stStats[evId]));
                }
            }
            mycount +=1;
        }

        //TABLE COLUMNS
        var cheadingWidth=[90,40,40,80,85]

        var tr = document.createElement('TR');
        tableBody.appendChild(tr);
        for (i = 0; i < heading.length; i++) {
            var th = document.createElement('TH');
            th.width = cheadingWidth[i];
            th.appendChild(document.createTextNode(heading[i]));
            tr.appendChild(th);
        }

        //TABLE ROWS
        for (i = 0; i < stock.length; i++) {
            var tr = document.createElement('TR');
            for (j = 0; j < stock[i].length; j++) {
                var td = document.createElement('TD');
                td.appendChild(document.createTextNode(stock[i][j]));
                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
        }
        $('#jstable table').remove();
        myTableDiv.appendChild(table);

        if(mycount <= 1){
            document.getElementById("eventCount").innerHTML = mycount;
            document.getElementById("eventText").innerHTML = 'event';
        } else {
            document.getElementById("eventCount").innerHTML = mycount;
            document.getElementById("eventText").innerHTML = 'events';
        }

        if(stock.length <= 1){
            document.getElementById("locationCount").innerHTML = stock.length;
            document.getElementById("locationText").innerHTML = 'location';
        }else{
            document.getElementById("locationCount").innerHTML = stock.length;
            document.getElementById("locationText").innerHTML = 'different locations';
        }

        $('.mainText').show();
        $('.center').show();

    }  else{
        $('#jstable table').remove();
        $('.mainText').hide();
        $(".center h1").remove();
        $( "<center><h1 style='margin-top:20%;'><i>no data available</i></h1></center>" ).appendTo( ".center" );
    }
}

function highlightInfoTable(location){
    if (location != 'NULL'){

        var arr = [];
        $("#jstable tr").each(function(){
            arr.push($(this).find("td:first").text()); //put elements into array
            var found = $.inArray(location, arr);
            if(found > -1){
                $("#jstable tr").eq(found).addClass('highlight-info');
            }
        });
    }else{
        $("#jstable tr").removeClass('highlight-info');
    }
}

function getIndicesStatsFromData(indicesData){
    var mycount = indicesData.length;
    var lats = indicesData.map(function(obj) { return obj.lat; });
    var lons = indicesData.map(function(obj) { return obj.lon; });
    var locations = lats.filter(function(v,i) { return lats.indexOf(v) == i && lons.indexOf(lons[i]) == i; }).length;

    if(mycount <= 1){
        var eventCount = mycount;
        var eventText = 'event';
    } else {
        var eventCount = mycount;
        var eventText = 'events';
    }

    if(locations <= 1){
        var locationCount = locations;
        var locationText = 'location';
    }else{
        var locationCount = locations;
        var locationText = 'different locations';
    }

    return {
        eventCount: eventCount,
        eventText: eventText,
        locationCount: locationCount,
        locationText: locationText
    };
};

function addInlineStatistics(indicesData){

    var indicesStats = getIndicesStatsFromData(indicesData);

    $('header').empty();
    var main = "<center><h3>Browse reconstructed monthly temperature distributions from monthly aggregated historical thermal indices</h3></center>";
    var sub = "<center><p>Calculated from <b><span id='eventCount'>"+indicesStats.eventCount+"</span></b> <span id='eventText'>"+indicesStats.eventText+"</span> at <b><span id='locationCount'>"+indicesStats.locationCount+"</span></b> <span id='locationText'>"+indicesStats.locationText+"</span>. Duis nisl leo, congue eget odio ac, cursus aliquam mauris. Fusce viverra erat sit amet nibh finibus molestie. </p></center>";
    $('header').append(main+sub);

}

function coverageTextStats(){
    var coverageStatsData = $('#statisticsTextCoverage-content').attr('data-url');

    $.getJSON(coverageStatsData,
        function(res){
            $('header').empty();
            var main = "<center><h3>Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...</h3></center>";
            var sub = "<center><p>Calculated from <b><span id='eventCount'>"+res['event_count']+"</span></b> events at <b><span id='locationCount'>"+res['location_count']+"</span></b> different locations. Duis nisl leo, congue eget odio ac, cursus aliquam mauris. Fusce viverra erat sit amet nibh finibus molestie. </p></center>";
            $('header').append(main+sub);
        });

};

function evaluationTextStats(indicesData){

    var indicesStats = getIndicesStatsFromData(indicesData);

    var evaluationText = "<h4>Evaluate the impact of differnt event combinations by selecting event markers and \
    compare the reconstructed temperature distributions with measured data from different climate \
    stations and see the impact area for every event, by selecting from the top left map control \
    or compare with own added datapoints by clicking plus sign and reconstruct.</h4>";

    $('header').empty();
   // var main = "<center><h3>Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...</h3></center>";
    var sub =  "<center>"+evaluationText + "Calculated from <b><span id='eventCount'>"+indicesStats.eventCount+"</span></b> <span id='eventText'>"+indicesStats.eventText+"</span> at <b><span id='locationCount'>"+indicesStats.locationCount+"</span></b> <span id='locationText'>"+indicesStats.locationText+"</span>. Cru Offset: <b><span id='cruText' style='color:orange'>0.00</span></b>&deg;C<span class='stationInlineDescription'>, Station Offset: </span><b><span id='stationTextMean' style='color:orange'></span></b><span class='stationInlineDescription'>&deg;C</span></b></center>";
    $('header').append(sub);

};

