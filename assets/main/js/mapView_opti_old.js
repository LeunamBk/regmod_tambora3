//start App
$(function(){

    // clear session storage from previous sessions
    sessionStorage.clear();

    // Enable/Disable Info Table and inline stats
    showInfoTableStats = false;

    // Enable/Disable timeline
    showTimeline = true;

    // Enable/Disable statistics (toggle events,...)
    enableStatistics = false;

    // Enable/Disable inline text stats (n events at n locations, and in statistics view alsu cru/ghcnm off...)
    enableInlineStats = true;

    // Add Loading animation
    // $('#map').prepend('<img class="loading" src="img/loadanimation.gif"/>');

    // Scale map height based on window.height
    var mapheight = $('.wrap').height()-(2.3*$('header').height());
    $('#map').css({'height':mapheight});
    $('#top').css({'height':mapheight});

    // set map width based on parent yii style width
    $('#map').width($('#map').parent().width());

    // add map
    appInit();

    // add tileSelect
    getAdvancedMenu1();

});

function appInit(){
    // load and add basemap
    map = L.map('map', { zoomControl: false }).setView([51, 11], 4);

    addBaseMap(map);
    $('.loading').hide();

    // add on click temp info
    addOnClickInfo();

    addOnAddRemoveInfo();
}

function updateApp(selYear, selMonth,xx){
    // disable select menu
    disableMenu();

    // make accesable
    this.selYear = selYear;
    this.selMonth = selMonth;

    if(typeof this.contourMap !== 'undefined'){
        map.removeLayer(this.contourMap);
        this.contourMap = undefined;
    }
    if(typeof this.regioMap !== 'undefined'){
        map.removeLayer(this.regioMap);
        this.regioMap = undefined;
    }
    if(typeof this.indexData !== 'undefined'){
        map.removeLayer(this.indexData);
        this.indexData = undefined;
        this.geojsonIdx = undefined;
    }
    if(typeof this.validationData !== 'undefined'){
        map.removeLayer(this.validationData);
        this.validationData = undefined;
    }
    if(typeof this.contourL !== 'undefined'){
        map.removeLayer(this.contourL);
        this.contourL = undefined;
    }
    if(typeof this.selectedEventIds !== 'undefined'){
        this.selectedEventIds = undefined;
    }
    if(typeof this.allEventIds !== 'undefined'){
        this.allEventIds = undefined;
    }
    if(typeof this.selectMap !== 'undefined'){
        map.removeLayer(this.selectMap);
        this.selectMap = undefined;
    }
    if(typeof this.layerControl !== 'undefined'){
        this.layerControl.removeFrom(map);
        this.layerControl = undefined;
    }

    getRasterMap(map, selYear, selMonth, 'contourMap')
    getDataPoints(map, selYear, selMonth, 1, 'indexData')

    if(enableStatistics) {

        getDataPoints(map, selYear, selMonth, 1, 'validationData')
        getRasterMap(map, selYear, selMonth, 'regionMap')

        // getContourLines(map, selYear, selMonth)

        // load all data and wait till everything is done, than add controls
        // $.when(mapTemperature, pointVali, pointIdx, contourLines, regioMap).done(function(rasterMinMax,a2,indexData){
        $.when(mapTemperature, pointIdx, pointVali, regioMap).done(function (rasterMinMax, indexData, valiData) {
            mapTemperature = pointVali = pointIdx = contourLines = undefined;

            // add temperature legend
            if (rasterMinMax !== null) {
                rasterMinMaxData = rasterMinMax[0]['rasterMinMax'];
                addTempLegend(map);
            }

            //register inline mean station offset
            meanGhcnmOff = valiData[0]['meanGhcnmOff'];

            // add map controls
            addControls(map);

            // add map info with shorttext
            addInfo(map, selYear, selMonth);

            // add info table
            if (showInfoTableStats) addInfoTable(indexData[0]);

            // show evaluation inline stats text
            if (enableInlineStats) evaluationTextStats(indexData[0]);
            if (enableInlineStats) updateStats(selectedEventIds, selYear, selMonth);

            // re-enable select meanu:
            enableMenu();
        });

    } else {
        // load all data and wait till everything is done, than add controls
        // $.when(mapTemperature, pointVali, pointIdx, contourLines, regioMap).done(function(rasterMinMax,a2,indexData){
        $.when(mapTemperature, pointIdx).done(function (rasterMinMax, indexData) {
            mapTemperature = pointIdx = undefined;

            // add temperature legend
            if (rasterMinMax !== null) {
                rasterMinMaxData = rasterMinMax[0]['rasterMinMax'];
                addTempLegend(map);
            }

            // add map controls
            // addControls(map);

            // add map info with shorttext
            addInfo(map, selYear, selMonth);

            // add info table
            if (showInfoTableStats) addInfoTable(indexData[0]);

            // add inline stats
            if (enableInlineStats) addInlineStatistics(indexData[0]);

            // re-enable select meanu:
            enableMenu();
        });
    }

}


//###############################################################################
function addBaseMap(map){

    L.tileLayer('http://a.tiles.mapbox.com/v3/jcheng.map-5ebohr46/{z}/{x}/{y}.png', {
        maxZoom: 8,
        minZoom: 2
    }).addTo(map);

    // add zoom control
    new L.Control.Zoom({ position: 'topright' }).addTo(map);
}

function addRasterMap(imageUrl, type, imageBounds, viewBounds){

    // load map
    this[type] = L.imageOverlay(imageUrl, imageBounds, {opacity:0.7});

    // display map
    this[type].addTo(map);

    // set view to countor Image extent
    if(typeof viewBounds !== 'undefined'){
        map.fitBounds(viewBounds);
    }
}

function addCircleMarker(map, geojson, type){
    if(type !== "validationData"){

        // add index marker
        this[type] = L.geoJson(geojson, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, getMarkerOptions(feature, type));
            },
            onEachFeature: onEachFeature
        });
        if(!enableStatistics) this[type].addTo(this.map);

    } else {
        // add climate station rectangle marker
        this[type] = L.geoJson(geojson, {
            pointToLayer: function (feature, latlng) {
                return  L.squareMarker(latlng, getMarkerOptions(feature, type));
            },
            onEachFeature: onEachFeature
        });
    }
}

function addInfo(map, selYear, selMonth){

    $('.info').remove();

    var selMonthArr = new Array('NONE','January','February','March','April','May','June','July','August','September','October','November','December');

    if(typeof this.geojsonIdx !== 'undefined'){
        var shortPointTxt = createShortTxt(this.geojsonIdx);
    } else {
        var shortPointTxt = undefined;
    }

    //define info control
    info = L.control({style:style, position: 'bottomleft'});

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    info.update = function (props) {
        if(typeof shortPointTxt === 'undefined'){
            this._div.innerHTML = '<h4>'+selMonthArr[selMonth]+" "+selYear+'</h4>'

        } else {
            this._div.innerHTML = '<h4>'+selMonthArr[selMonth]+" "+selYear+'</h4>' +  (props ?
                    'Temperature: ' + props.temp
                        : '<i>'+shortPointTxt+'</i>'
                );
        }

        if(showInfoTableStats) highlightInfoTable('NULL') ;
    };

    // show detail info to selected (hover) index point
    info.updatePoint = function (props) {

        var text = props.text;
        var location = props.location;

        if(showInfoTableStats) highlightInfoTable(location);

        text = replaceAll(text, '*', '');
        if(text.length > 9000) text = text.substring(0,9000) +' [...]';
        this._div.innerHTML = '<h4>'+selYear+" "+selMonthArr[selMonth]+'</h4>' +  (props ?
            '<b>Location: </b>' + props.location + '<br />'+
            '<b>Event Id: </b>' + props.event_id + '<br />'+
            '<b>Value: </b>' + props.idx + '<br />'+
            '<b>Longitude: </b>' +  parseFloat(props.lon_info).toFixed(2) + '<br />'+
            '<b>Latitude: </b>' +  parseFloat(props.lat_info).toFixed(2) + '<br />'+
            '<b>Text: </b>' + text + '<br />'
                : '');
    };

    info.addTo(map);

    // modify info style
    var width = $('.left').width()-10;
    var height = $('#map').height();
    height = (height/100) * 80;
    if(enableStatistics) $('.info').css({'max-width':width, 'max-height':height, 'overflow': 'hidden'});
    else $('.info').css({'max-width':width, 'max-height':height});
}

function addControls(map){

    // hack the markers added by the reconstructor app into layer control
    var markerGroup = new L.LayerGroup()
    var markerIds = Object.keys(model.marker)
    for(var i=0; i<markerIds.length;i++){
        model.marker[parseInt(markerIds[i])].addTo(markerGroup)
    }

    var overlayPane = {};

    if (typeof this.contourMap !== 'undefined') {
        overlayPane['reconstructed temperature map'] = this.contourMap;
    }
    if (typeof this.regioMap !== 'undefined') {
        overlayPane['regionalised idices map'] = this.regioMap;
    }
    if (typeof this.indexData !== 'undefined') {
        overlayPane['event marker'] = markerGroup;
    }
    if (typeof this.validationData !== 'undefined') {
        overlayPane['climate stations'] = this.validationData;
    }
    if (typeof this.contourL !== 'undefined') {
        overlayPane['contour lines'] = this.contourL;
    }
    if (typeof this.selectMap !== 'undefined') {
        overlayPane['reconstructed temperature map'] = this.selectMap;
    }

    // Add a layer control element to the map
    layerControl = L.control.layers(null, overlayPane, {position: 'topleft'});
    layerControl.addTo(map);

    // set ckeckbox to true of hacked layer control event data
    $('span:contains(event marker)').parent().children(':first-child').attr('checked',true);

}

function addContourLines(map, geojson){
    // contourL = L.geoJson(geojson, {style: style, onEachFeature: onEachFeature});
    contourL = L.geoJson(geojson, {style: style});
    // Lgeojson.addTo(map); // disabled by default
}

function updateAppBySelect(){

    if(this.selectedEventIds[0] != null && this.selectedEventIds.length != this.allEventIds.length){

        $('.loading').show();

        // toggles the layer selection that every layer could be removed
        toggleLayersForRemove()

        // add layer
        getRasterMap(map, selYear, selMonth, 'selectMap');
        getRasterMap(map, selYear, selMonth, 'regionMap');

        if(typeof this.layerControl !== 'undefined'){
            this.layerControl.removeFrom(map);
            this.layerControl = undefined;
        }

        // add controls on load
        $.when(selMap, regioMap).done(function(a1,a2){
            $('.loading').hide();

            getDataPoints(map, selYear, selMonth, 1,'validationDataArea');

            // update info table and inline stats
            if(enableInlineStats) updateStats(selectedEventIds, selYear, selMonth);

            $.when(pointValiArea).done(function(){
                // update controls with new layer info
                addControls(map);
            })

        });

    } else if(this.selectedEventIds.length === this.allEventIds.length) {

        // toggles the layer selection that every layer could be removed
        toggleLayersForRemove()

        // add layer
        getRasterMap(map, selYear, selMonth, 'contourMap');
        getRasterMap(map, selYear, selMonth, 'regionMap');
        getDataPoints(map, selYear, selMonth, 1, 'validationData');
        // update info table and inline stats
        if(enableInlineStats) updateStats(selectedEventIds, selYear, selMonth);

        if(typeof this.layerControl !== 'undefined'){
            this.layerControl.removeFrom(map);
            this.layerControl = undefined;
        }

        // add controls on load
        $.when(mapTemperature, regioMap, pointVali).done(function(a1,a2,a3){

            // update controls with new layer info
            addControls(map);

        });

    } else {

        // toggles the layer selection that every layer could be removed
        toggleLayersForRemove()

        if(typeof this.layerControl !== 'undefined'){
            this.layerControl.removeFrom(map);
            this.layerControl = undefined;
        }
        if(typeof this.contourMap !== 'undefined'){
            map.removeLayer(this.contourMap);
            this.contourMap = undefined;
        }
        if(typeof this.regioMap !== 'undefined'){
            map.removeLayer(this.regioMap);
            this.regioMap = undefined;
        }
        if(typeof this.selectMap !== 'undefined'){
            map.removeLayer(this.selectMap);
            this.selectMap = undefined;
        }
        if(typeof this.validationData !== 'undefined'){
            map.removeLayer(this.validationData);
            this.validationData = undefined;
        }

        // update controls with new layer info
        addControls(map);

    }
}

function addOnClickInfo(){
    map.on('click', function(e) {

        var lat = e.latlng.lat;
        var lon = e.latlng.lng;
        var latLonHref = $('#mapLatLonInfoData-content').attr('data-url');
        var bbox = checkBoundingBox()[0]

        if(selectedEventIds.length === allEventIds.length && bbox === 1){

            $.getJSON(latLonHref+'?year='+selYear+"&month="+selMonth+"&lat="+lat+"&lon="+lon,//+"&eventIds="+selectedEventIds.toString(),
                function(temperature){
                    if(temperature != null){
                        setTPopUp(temperature, lat, lon);
                    }
                    // define rectangle geographical bounds
                    //  var bounds = [[e.latlng.lat, e.latlng.lng], [e.latlng.lat+1, e.latlng.lng+1]];
                    // create an orange rectangle
                    //  L.rectangle(bounds, {color: "#ff7800", weight: 100}).addTo(map);

                });
        } else if(selectedEventIds[0] != null && selectedEventIds.length != allEventIds.length && bbox === 1){

            $.getJSON(latLonHref+'?mode=select_data&year='+selYear+"&month="+selMonth+"&lat="+lat+"&lon="+lon+'&eventIds='+selectedEventIds.toString(),
                function(temperature){
                    if(temperature != null){
                        setTPopUp(temperature, lat, lon);
                    }
                });
        } else if(bbox !== 1){

            $.getJSON(latLonHref+'?mode=bbox_data&year='+selYear+"&month="+selMonth+"&lat="+lat+"&lon="+lon+'&eventIds='+selectedEventIds.toString(),
                function(temperature){
                    if(temperature != null){
                        setTPopUp(temperature, lat, lon);
                    }
                });
        }
    });
}

function addOnAddRemoveInfo(){
    map.on('overlayadd', function(e){
        if(e.name==='regionalised idices map'){
            addRegioLegend(map)
            var tMpaControl = $('span:contains(reconstructed temperature map)').parent().children(':first-child')
            if(tMpaControl.is(':checked')){
                tMpaControl.click();
            }
        }
        if(e.name==='reconstructed temperature map'){
            var tMpaControl = $('span:contains(regionalised idices map)').parent().children(':first-child')
            if(tMpaControl.is(':checked')){
                tMpaControl.click();
            }
        }
    });

    map.on('overlayremove', function(e){
        if(e.name==='regionalised idices map'){
            addTempLegend(map)
            var tMpaControl = $('span:contains(reconstructed temperature map)').parent().children(':first-child')
            if(!tMpaControl.is(':checked')){
                tMpaControl.click();
            }
        }
    });
};


//######################################################################################
// create default historical text from shortest historical comment
function createShortTxt(geojsonPoints){
    for(var i = 0; i < geojsonPoints.features.length; i++){
        var pointTxt = geojsonPoints.features[i].properties['text'];
        if(i == 0){
            shortPointTxt = pointTxt;
        }
        else if(shortPointTxt.length > pointTxt.length){
            shortPointTxt = pointTxt;
        }
    }

    // cut text to n chars and display selMonth selYear h4
    shortPointTxt = replaceAll(shortPointTxt, '*', '');
    if(shortPointTxt.length > 150) shortPointTxt = shortPointTxt.substring(0,150) +' [...]';
    // $('.info').html('<h4>'+ this.selMonthArr[selMonth]+" "+selYear+'</h4><i>'+shortPointTxt+'</i>');

    return shortPointTxt;
}

function checkSameLatLon(data){
    // check if points exist on same location; make little offset if so
    var checkLoc = [];
    for(var i = 0; i < data.length; i++){
        if($.inArray(data[i]['lon'], checkLoc) != -1){

            // multiply offset for multiple same locations
            var count = checkLoc.reduce(function(n, val) {
                return n + (val === data[i]['lon']);
            }, 0);
            checkLoc.push(data[i]['lon'])
            data[i]['lon'] =  parseFloat(data[i]['lon'])+(0.1*count)
        } else {
            checkLoc.push(data[i]['lon'])
        }
    }
    return data
}

function getIndexDataHref(selYear, selMonth, bbox){
    var indicesHref = $('#mapIndices-content').attr('data-url');

    // check if bounding box was defined and load data appropriate
    var bbox = checkBoundingBox()[0]
    if(bbox === 1){
        var indicesConString = indicesHref+'?year='+selYear+'&month='+selMonth;
    } else {
        var indicesConString = indicesHref+'?mode=bbox_data&year='+selYear+'&month='+selMonth+'&bbox='+bbox;
    }

    return indicesConString
}

function getDataPoints(map, selYear, selMonth, bbox, type){
    if(type === 'indexData'){

        var indicesConString = getIndexDataHref(selYear, selMonth, bbox);

        // get indices data
        pointIdx = $.getJSON(indicesConString,//+'&areaView='+bbox,
            function(data){
                // check if view is available in db
                if(data != ''){

                    mapIndexData = data;

                    // check if points exist on same location; make little offset if so
                    data = checkSameLatLon(data)

                    // make geojson object from data
                    geojsonIdx = GeoJSON.parse(data, {Point: ['lat', 'lon']});

                    // store all available event ids for select
                    getAllEventIds(geojsonIdx);

                    // add index marker
                    addCircleMarker(map, geojsonIdx, type)
                }
            });

    } else if(type === 'validationData'){

        if(typeof this.validationData !== 'undefined'){
            map.removeLayer(this.validationData);
            this.validationData = undefined;
        }

        // get GHCNMV3 data
        var ghcnmHref = $('#mapGhcnmData-content').attr('data-url');

        // check if bounding box was defined and load data appropriate
        var bbox = checkBoundingBox()[0]
        if(bbox === 1){
            var ghcnmConString = ghcnmHref+'?year='+selYear+'&month='+selMonth;
        } else {
            var ghcnmConString = ghcnmHref+'?mode=bbox_data&year='+selYear+'&month='+selMonth+'&bbox='+bbox;
        }

        pointVali = $.getJSON(ghcnmConString,
            function(res){
                // check if view is available in db
                if(res['ghcnmData'] != ''){

                    // make geojson object from data
                    geojson = GeoJSON.parse(res['ghcnmData'], {Point: ['lat', 'lon']});

                    // create station marker overlay
                    addCircleMarker(map, geojson, type)
                }
            });
    } else if(type === 'validationDataArea'){

        if(typeof this.validationData !== 'undefined'){
            map.removeLayer(this.validationData);
            this.validationData = undefined;
        }

        // get GHCNMV3 data
        var ghcnmHref = $('#mapGhcnmData-content').attr('data-url');
        pointValiArea = $.getJSON(ghcnmHref+'?mode=select_data&year='+selYear+'&month='+selMonth+'&eventIds='+selectedEventIds.toString(),
            function(res){
                // check if view is available in db
                if(res['ghcnmData'] != ''){

                    // make geojson object from data
                    geojson = GeoJSON.parse(res['ghcnmData'], {Point: ['lat', 'lon']});

                    // create station marker overlay
                    addCircleMarker(map, geojson, 'validationData')
                }
            });
    }
}

function getContourLines(map, selYear, selMonth){
    // load contour data
    contourLines =  $.getJSON(window.location+'test.php?year='+selYear+'&month='+selMonth,
        function(res){
            if(res.features !== null){
                addContourLines(map, res)
            }
        });
}

function getRasterMap(map, selYear, selMonth, type){
    if(type === 'contourMap'){

        if(typeof this.contourMap !== 'undefined'){
            map.removeLayer(this.contourMap);
            this.contourMap = undefined;
        }
        if(typeof this.selectMap !== 'undefined'){
            map.removeLayer(this.selectMap);
            this.selectMap = undefined;
        }

        // check if bounding box was defined and load data appropriate
        var bbox = checkBoundingBox()[0];
        var rasterDataHref = $('#mapTemperatureRasterData-content').attr('data-url');
        var rasterNoDataHref = $('#mapTemperatureNoRasterData-content').attr('data-url');
        var rasterExtentHref = $('#mapTemperatureRasterExtent-content').attr('data-url');

        if(bbox === 1){
            var rasterExtentConString = rasterExtentHref+'?year='+selYear+'&month='+selMonth;
            if(enableStatistics){
                var rasterDataConString = rasterDataHref + '?year=' + selYear + '&month=' + selMonth;
            } else {
                var rasterDataConString = rasterDataHref + '?mode=all_data_simple&year=' + selYear + '&month=' + selMonth;
            }
        } else {
            var rasterExtentConString  = rasterExtentHref+'?mode=bbox_data&year='+selYear+'&month='+selMonth+'&bbox='+bbox;
            var rasterDataConString  = rasterDataHref+'?mode=bbox_data&year='+selYear+'&month='+selMonth+'&bbox='+bbox;
        }

        mapTemperature =  $.getJSON(rasterExtentConString,
            function(res){

                // check if view is available in db else show cru selMonth mean map
                if(res['rasterExtent'] === 'no data'){
                    var imageUrl = rasterNoDataHref+'?&month='+selMonth;

                    // place map like corner coordinates
                    var imageBounds = [[83.75,179.75],[-56.25, -180.25]];  //  ymax, xmax, ymin, xmin
                    var viewBounds = imageBounds;
                } else {
                    var dim = res['rasterExtent'];
                    var imageUrl = rasterDataConString;

                    // place map like corner coordinates
                    var viewBounds = [[dim['ymax'], dim['xmax']], [dim['ymin'], dim['xmin']]];  //  ymax, xmax, ymin, xmin
                    var imageBounds = [[83.75,179.75],[-56.25, -180.25]];  //  ymax, xmax, ymin, xmin

                    if(!enableStatistics) imageBounds = viewBounds;
                }

                addRasterMap(imageUrl, type, imageBounds, viewBounds)
            }
        )
    } else if(type == 'regionMap'){

        if(typeof this.regioMap !== 'undefined'){
            map.removeLayer(this.regioMap);
            this.regioMap = undefined;
        }

        //var regresRasterDataExtent  = $('#mapTRegressionRasterData-content').attr('data-url');
        var regresRasterDataHref = $('#mapTRegressionRasterData-content').attr('data-url');

        var bbox = checkBoundingBox()[0]

        if(bbox !== 1 && typeof this.selectedEventIds === 'undefined'){
            var imageUrl = regresRasterDataHref+'?mode=bbox_data&year='+selYear+'&month='+selMonth+'&bbox='+bbox
        } else {
            if(typeof this.selectedEventIds !== 'undefined'){
                var imageUrl = regresRasterDataHref+'?mode=select_data&eventIds='+this.selectedEventIds.toString();
            }else {
                var imageUrl = regresRasterDataHref+'?year='+selYear+'&month='+selMonth; //+'&areaView='+bbox;
            }
        }
        // load map and display
        var imageBounds = [[70,50],[30,-30]];  //  ymax, xmax, ymin, xmin
        var imageBounds = [[83.75,179.75],[-56.25, -180.25]];  //  ymax, xmax, ymin, xmin

        regioMap = L.imageOverlay(imageUrl, imageBounds, {opacity:0.9});

    } else if(type === 'selectMap'){

        if(typeof this.selectMap !== 'undefined'){
            map.removeLayer(this.selectMap);
            this.selectMap = undefined;
        }
        if(typeof this.contourMap !== 'undefined'){
            map.removeLayer(this.contourMap);
            this.contourMap = undefined;
        }

        var rasterDataHref = $('#mapTemperatureRasterData-content').attr('data-url');
        var rasterExtentHref = $('#mapTemperatureRasterExtent-content').attr('data-url');
        console.log(rasterExtentHref+'?mode=select_data&year='+this.selYear+'&month='+this.selMonth+'&eventIds='+this.selectedEventIds.toString());
        selMap = $.getJSON(rasterExtentHref+'?mode=select_data&year='+this.selYear+'&month='+this.selMonth+'&eventIds='+this.selectedEventIds.toString(),
            function(res){

                var imageUrl = rasterDataHref+'?mode=select_data&eventIds='+selectedEventIds.toString();
                var imageBounds = [[83.75,179.75],[-56.25, -180.25]];  //  ymax, xmax, ymin, xmin

                addRasterMap(imageUrl, type, imageBounds)
            });
    }
}

function getPythonRasterMap(){
    // rework if available get extend and then load like getRaster map but with evHASH if not get extend -> calc data -> get data like before
    var imageUrl = 'rasterToPng.php?year='+selYear+'&month='+selMonth+'&evid='+selectedEventIds.toString()+'&evidHash='+evHash;
    var imageBounds = [[70, 50], [30, -30]];  //  ymax, xmax, ymin, xmin
    //var imageBounds = [[41.6932432432432, -3.30367647058824], [59.2932432432432, 29.7963235294118]];  //  ymax, xmax, ymin, xmin
    map.removeLayer(contourImage);
    contourImage = new L.imageOverlay(imageUrl, imageBounds, {opacity:0.7});
    contourImage.addTo(map);
}

//######################################################################################################
// UTILS

function clacEventHash(selectedEventIds){

    var sum = selectedEventIds.reduce(function(a, b) { return parseInt(a) + parseInt(b); });
    var evHash = sum/selectedEventIds.length

    return evHash
}

function updateEvidsSelected(layerId, selectedEventIds){
    // this has to be persistent in some way

    if(jQuery.inArray( layerId, selectedEventIds ) == -1){
        selectedEventIds.push(layerId);
    } else {
        var idx = jQuery.inArray( layerId, selectedEventIds )
        selectedEventIds.splice(idx, 1);
    }
}

function getAllEventIds(geojson){
    //get all event_id's for this selYear selMonth combi
    allEventIds = [];
    selectedEventIds = [];
    for(var i = 0; i < geojson.features.length; i++){
        allEventIds.push(geojson.features[i].properties['event_id']);
        // make deep copy cause js a = b is just a reference ...
        selectedEventIds = deepCopy(allEventIds);
    }
}

function disableMenu(){
    $('#century').css({'pointerEvents':'none'});
    $('#decade').css({'pointerEvents':'none'});
    $('#year').css({'pointerEvents':'none'});
    $('#month').css({'pointerEvents':'none'});
    $('#map .leaflet-clickable').css({'pointerEvents':'none'});
}

function enableMenu(){
    $('#century').css({'pointerEvents':'auto'});
    $('#decade').css({'pointerEvents':'auto'});
    $('#year').css({'pointerEvents':'auto'});
    $('#month').css({'pointerEvents':'auto'});
    $('#map .leaflet-clickable').css({'pointerEvents':'auto'});
}

function toggleLayersForRemove(){
    // solves bug, where temperature map is not removeable while
    // regionalised map is shown and temperature map is toggled off
    var tMpaControl = $('span:contains(reconstructed temperature map)').parent().children(':first-child')
    if(!tMpaControl.is(':checked')){
        tMpaControl.click();
    }
}


//######################################################################################################
// Animation

function toggleFeature(e){
    layer = e.target;

    // only index points are clickable
    if(layer.feature.properties.text){

        if(!enableStatistics){
            // check if contour layer or point layer
            if(!layer['_radius']){
                layer.setStyle({
                    weight: 2,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.7
                });
            }

            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }

            info.update();

            // populate info appropriate to layer feature
            (!layer['_radius']) ? info.update(layer.feature.properties) : info.updatePoint(layer.feature.properties);
        }
    }
}

function getMarkerOptions(feature, type) {
    if(type !== "validationData"){
        return {
            radius: 6,
            fillColor: getColorP(feature.properties.idx),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }
    }
    else {
        return {
            radius: 5,
            fillColor: getTemperatureColor(feature.properties.temperature),
            color: "#000",
            weight: 1,
            opacity:1,
            fillOpacity: 0.7
        }
    }
};

// style for point layer
function getColor(d) {
    return d == '-3' ? '#4575b4' :
        d == '-2'  ? '#91bfdb' :
            d == '-1'  ? '#e0f3f8' :
                d == '0'  ? '#ffffbf' :
                    d == '1'  ? '#fee090' :
                        d == '2'  ? '#fc8d59' :
                            d == '3'  ? '#d73027' :
                                '#9F0000';
}

// CONTOUR DATA
function style(feature) {
    return {
        // fillColor: getColor(parseInt(feature.properties.level)),
        weight: 1,
        opacity: 1,
        color: 'white',//getColor(parseInt(feature.properties.level)),
        dashArray: '0',
        fillOpacity: 0.7
    };
}

// add map Interaction
function highlightFeature(e) {
    var layer = e.target;
    // if indexpoint or vali point
    if(layer.feature.properties.text){
        // check if contour layer or point layer
        if(!layer['_radius']){
            layer.setStyle({
                weight: 2,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
            });
        }

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
        // populate info appropriate to layer feature
        (!layer['_radius']) ? info.update(layer.feature.properties) : info.updatePoint(layer.feature.properties);
    }else {
        // popup for vali point
        layer.bindPopup('<b>Location: </b>'+layer.feature.properties.name+'<br><b>Station Temperature: </b>'+layer.feature.properties.temperature+'<br><b>Recon Temperature: </b>'+parseFloat(layer.feature.properties.temp_recon).toFixed(2))
        layer.openPopup();
    }
}

function resetHighlight(e) {
    var layer = e.target;
    if(layer.feature.properties.text){
        if(!e.target['_radius']) Lgeojson.resetStyle(e.target);
        if(enableStatistics) info.update();
    } else {
        setTimeout(function(){ layer.closePopup(); }, 2000);
    }
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: toggleFeature
    })
};

function setTPopUp(temperature, lat, lon){
    var marker = L.circleMarker([lat,lon]).addTo(map)
        .bindPopup(parseFloat(temperature).toFixed(2)+" &deg;C" ).openPopup();
    setTimeout(function(){ map.removeLayer(marker); }, 1000);
};
