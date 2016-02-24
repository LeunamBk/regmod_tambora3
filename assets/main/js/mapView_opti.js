/**
 * Created by mcb on 16.12.15.
 */

// "use strict";

var mapModel = {

    // Enable/Disable Info Table and inline stats
    showInfoTableStats : false,

    // Enable/Disable timeline
    showTimeline : true,

    // Enable/Disable statistics (toggle events,...)
    enableStatistics : false,

    // Enable/Disable inline text stats (n events at n locations, and in statistics view also cru/ghcnm off...)
    enableInlineStats : true,

    // Enable/Disable filtering of markers based on timeframe selection in timeline
    filterByTimeframe : false,

    // leaflet map object
    mapObj : "",

    // temperature by click popup YII route dom element
    temperatureClickYiiDom : '#mapLatLonInfoData-content',

    // temperature by click popup base href
    temperatureClickHref : "",

    // is data spatial subselected 1 == no subselection
    bbox : 1,

    // array with event_ids of selected "active" events
    selectedEventIds : [],

    // array of all availabel event_ids for year month
    allEventIds : [],

    // selected year
    year : "",

    // selected month
    month : "",

    // image bounds for the whole world
    globalImageBounds : [[83.75,179.75],[-56.25, -180.25]],     // ymax, xmax, ymin, xmin

    // reference all map layers
    mapLayers : [],

    // reference all the map controls
    mapControls : [],

    // layer control lables
    layerControlLables : {
        indexData : 'event marker',
        evalMarkersGroup : 'event marker',
        temperatureMap : 'reconstructed temperature map',
        regressionMap : 'regionalised idices map',
        validationData : 'climate stations',
        reconValidationData : 'climate stations',
        contourL : 'contour lines',
        selectedTemperatureMap : 'reconstructed temperature map',
        liveReconstruction : 'reconstructed temperature map'
    },

    // active layer with detailed info in info box
    activeInfoLayerId : "",

    //#################################################################################################################
    // TEMPERATURE RASTER

    tRasterDataYiiDom : "#mapTemperatureRasterData-content",
    tRasterDataBaseHref : "",

    tRasterNoDataYiiDom : '#mapTemperatureNoRasterData-content',
    tRasterNoDataBaseHref : "",

    tRasterExtentYiiDom : '#mapTemperatureRasterExtent-content',
    tRasterExtentBaseHref : "",

    temperatureBboxRasterHref : function(){
        var baseDataHref = this.tRasterDataBaseHref;
        var baseExtentHref = this.tRasterExtentBaseHref;
        var bbox = JSON.stringify(this.bbox);
        var year = this.year;
        var month = this.month;

        var hrefExtent  = baseExtentHref+'?mode=bbox_data&year='+year+'&month='+month+'&bbox='+bbox;
        var hrefData = baseDataHref + '?mode=bbox_data&year=' + year + '&month=' + month + '&bbox=' + bbox;

        return { data : hrefData,
            extent : hrefExtent};
    },

    temperatureRasterHref : function(){
        var baseDataHref = this.tRasterDataBaseHref;
        var baseExtentHref = this.tRasterExtentBaseHref;
        var year = this.year;
        var month = this.month;

        if(this.enableStatistics){
            var hrefData = baseDataHref + '?year=' + year + '&month=' + month;
        } else {
            var hrefData = baseDataHref + '?mode=all_data_simple&year=' + year + '&month=' + month;
        }

        var hrefExtent = baseExtentHref+'?year='+year+'&month='+month;

        return { data : hrefData,
            extent : hrefExtent};

    },

    temperatureRasterNoDataHref : function(){
        var month = this.month;
        var baseHref = this.tRasterNoDataBaseHref;
        return baseHref + '?&month=' + month;
    },

    temperatureSelectRasterHref : function() {
        var baseDataHref = this.tRasterDataBaseHref;
        var baseExtentHref = this.tRasterExtentBaseHref;
        var hrefData = baseDataHref +'?mode=select_data&eventIds='+this.selectedEventIds.toString();
        var hrefExtent = baseExtentHref+'?mode=select_data&year='+this.year+'&month='+this.month+'&eventIds='+this.selectedEventIds.toString();

        return { data : hrefData,
            extent : hrefExtent};

    },

    temperatureAjax : "",

    //range in temperature of the reconstructed map
    temperatureRange : "",



    //#################################################################################################################
    // REGRESSION RASTER

    regressionRasterDataYiiDom : '#mapTRegressionRasterData-content',
    regressionRasterDataBaseHref : "",

    regressionBboxRasterHref : function() {
        var baseUrl = this.regressionRasterDataBaseHref;
        return baseUrl + '?mode=bbox_data&year='+this.year+'&month='+this.month+'&bbox='+this.bbox;
    },

    regressionRasterHref : function() {
        var baseUrl = this.regressionRasterDataBaseHref;
        return baseUrl+'?year='+this.year+'&month='+this.month; //+'&areaView='+bbox;
    },

    regressionSelectRasterHref : function() {
        var baseUrl = this.regressionRasterDataBaseHref;
        return baseUrl+'?mode=select_data&eventIds='+this.selectedEventIds.toString();
    },


    //#################################################################################################################
    // VECTOR DATA

    eventMarkerYiiDom : '#mapIndices-content',
    eventMarkerBaseHref : "",

    eventAjax : "",

    getEventMarkerHref : function(){
        var baseUrl = this.eventMarkerBaseHref;
        var bbox = this.bbox;
        if(bbox === 1){
            var href = baseUrl + '?year=' + this.year + '&month=' + this.month;
        } else {
            var href = baseUrl + '?mode=bbox_data&year=' + this.year + '&month=' + this.month + '&bbox=' + JSON.stringify(bbox);
        }
        return href;
    },

    // array with data and metadata to all events
    eventMarkerData : [],

    // GHCNMV3 data
    ghcnmYiiDom : '#mapGhcnmData-content',
    ghcnmBaseHref : "",

    getGhcmnMarkerHref : function(mode){
        var baseHref = this.ghcnmBaseHref;
        var bbox = this.bbox;
        if(mode == "all_data") {
            if (bbox === 1) {
                var href = baseHref + '?year=' + this.year + '&month=' + this.month;
            } else {
                var href = baseHref + '?mode=bbox_data&year=' + this.year + '&month=' + this.month + '&bbox=' + JSON.stringify(bbox);
            }
        } else if(mode == "select_data"){
            var href = baseHref+'?mode=select_data&year='+this.year+'&month='+this.month+'&eventIds='+this.selectedEventIds.toString();
        }

        return href;
    },

    ghcnmAjax : "",

    updateAppYiiDom : '#updateApp-trigger',
    updateAppBaseHref : "",


    //#################################################################################################################
    // STORAGE DATA UTILS

    // jquery dom referneces of the yii data routes to urls
    parseYiiDomDataRoutes : function() {

        this.tRasterDataBaseHref = $(this.tRasterDataYiiDom).attr('data-url');
        this.tRasterNoDataBaseHref = $(this.tRasterNoDataYiiDom).attr('data-url');
        this.tRasterExtentBaseHref = $(this.tRasterExtentYiiDom).attr('data-url');
        this.temperatureClickHref = $(this.temperatureClickYiiDom).attr('data-url');
        this.regressionRasterDataBaseHref = $(this.regressionRasterDataYiiDom).attr('data-url');
        this.eventMarkerHref = $(this.eventMarkerYiiDom).attr('data-url');
        this.eventMarkerBaseHref = $(this.eventMarkerYiiDom).attr('data-url');
        this.ghcnmBaseHref = $(this.ghcnmYiiDom).attr('data-url');
        this.updateAppBaseHref = $(this.updateAppYiiDom).attr('data-url');

    },

    // geojson representation of active event data
    eventJson : "",

    setEventIds : function(json){
        this.allEventIds = [];
        this.selectedEventIds = [];
        for(var i = 0; i < json.features.length; i++){
            var id = json.features[i].properties['event_id'];
            this.allEventIds.push(id);
            this.selectedEventIds.push(id);
        }
    },



};


var mapView = {

    init : function(){
        this.render();
    },

    render : function(){
        this.setMapSize();
        this.addBaseMap();
        this.addOnClickInfo();
        this.addOnAddRemoveInfo();

        // add tileSelect
        getAdvancedMenu1();
    },

    //#################################################################################################################
    // DATA BINDINGS
    getTemperatureClickHref : function(lat, lon) {
        var baseHref = mapController.getTemperatureClickHref();
        var bbox = mapController.getBbox();
        var allEventIds = mapController.getAllEventIds();
        var selectedEventIds = mapController.getSelectedEventIds();
        var year = mapController.getSelectedYear();
        var month = mapController.getSelectedMonth();

        if (selectedEventIds.length === allEventIds.length && bbox === 1) {
            var href = baseHref+'?year='+year+"&month="+month+"&lat="+lat+"&lon="+lon;//+"&eventIds="+selectedEventIds.toString();
        } else if (selectedEventIds[0] != null && selectedEventIds.length != allEventIds.length && bbox === 1) {
            var href = baseHref+'?mode=select_data&year='+year+"&month="+month+"&lat="+lat+"&lon="+lon+'&eventIds='+selectedEventIds.toString();
        } else if (bbox !== 1) {
            var href = baseHref+'?mode=bbox_data&year='+year+"&month="+month+"&lat="+lat+"&lon="+lon+'&eventIds='+selectedEventIds.toString();
        }
        return href;
    },

    //#################################################################################################################
    // MAP FUNCTIONALITY

    setMapSize : function(){
        // Scale map height based on window.height
        var mapheight = $('.wrap').height()-(2.3*$('header').height());
        $('#map').css({'height':mapheight});
        $('#top').css({'height':mapheight});

        var mapWidth = $('#top').width() - $('.left').width();
        $('#top .right').width(mapWidth-10);
        // set map width based on parent yii style width
        $('#map').css({'width':'100%'});
    },

    addBaseMap : function(){
        // load and add basemap
        var map = L.map('map', { zoomControl: false }).setView([51, 11], 4);

        L.tileLayer('http://a.tiles.mapbox.com/v3/jcheng.map-5ebohr46/{z}/{x}/{y}.png', {
            maxZoom: 8,
            minZoom: 2
        }).addTo(map);

        // add zoom control
        new L.Control.Zoom({ position: 'topright' }).addTo(map);

        // save map object
        mapController.setMapObj(map);
    },

    addOnClickInfo : function() {
        var self = this;
        var map = mapController.getMapObj();

        map.on('click', function (e) {
            var clickHref = self.getTemperatureClickHref(e.latlng.lat, e.latlng.lng);

            $.getJSON(clickHref,
                function (temperature) {
                    if (temperature != null) {
                        self.setTPopUp(temperature, e.latlng.lat, e.latlng.lng);
                    }
                }
            );
        });
    },

    setTPopUp : function(temperature, lat, lon){
        var map = mapController.getMapObj();
        var marker = L.circleMarker([lat,lon]).addTo(map)
            .bindPopup(parseFloat(temperature).toFixed(2)+" &deg;C" ).openPopup();
        setTimeout(function(){ map.removeLayer(marker); }, 1000);
    },

    addOnAddRemoveInfo : function(){
        var layerControlLables = mapController.getLayerControlLables();
        var map = mapController.getMapObj();

        map.on('overlayadd', function(e){
            if(e.name===layerControlLables.regressionMap){
                legends.addRegressionLegend();
                legends.addEventLegend();
                var tMpaControl = $('span:contains('+layerControlLables.temperatureMap+')').parent().children(':first-child');
                if(tMpaControl.is(':checked')){
                    tMpaControl.click();
                }
            }
            if(e.name===layerControlLables.temperatureMap){
                var tMpaControl = $('span:contains('+layerControlLables.regressionMap+')').parent().children(':first-child');
                if(tMpaControl.is(':checked')){
                    tMpaControl.click();
                }
            }
        });

        map.on('overlayremove', function(e){
            if(e.name===layerControlLables.regressionMap){
                legends.addTemperatureLegend();
                legends.addEventLegend();
                var tMpaControl = $('span:contains('+layerControlLables.temperatureMap+')').parent().children(':first-child');
                if(!tMpaControl.is(':checked')){
                    tMpaControl.click();
                }
            }
        });
    },



};

var mapLayersView = {


    updateMap : function(){

        var self = this;
        var appSettings = mapController.getAppSettings();
        // remove all layers from basemap
        this.resetMapLayers();

        // remove all controls from basemap
        this.resetMapControls();

        // check if events to display are availabel
        // if(!mapController.allEventsUnselected()) {

        // if data for all available events is requested
        if (appSettings.statistics && mapController.areEventsUnselected()) {
            rasterLayers.getRasterLayer('selectedTemperatureMap');
        } else {
            rasterLayers.getRasterLayer('temperatureMap');
            vectorLayers.getMarkers('indexData');
        }

        if (appSettings.statistics) {

            rasterLayers.getRasterLayer('regressionMap');
            // check if select layer for validation data is available
            if (mapController.getSelectedEventIds().length !== 0) {
                vectorLayers.getMarkers('validationData');
            }

            // load all data and wait till everything is done, than add controls
            $.when(mapController.getTemperatureAjax(), mapController.getGhcnmAjax(), mapController.getEventAjax()).done(function (rasterMinMax, valiData) {

                self.renderMapFeatures(rasterMinMax, valiData);
                $('.loading').remove();
            });

        } else {

            // load all data and wait till everything is done, than add controls
            $.when(mapController.getTemperatureAjax(), mapController.getEventAjax()).done(function (rasterMinMax) {

                self.renderMapFeatures(rasterMinMax);
                $('.loading').remove();
            });
        }
        // }

    },

    renderMapFeatures : function(rasterMinMax, valiData){

        var appSettings = mapController.getAppSettings();

        // register temperature range
        mapController.setTemperatureRange(rasterMinMax);

        // add legends for event view
        legends.renderEventViewLegends();

        if(appSettings.statistics) {
            //register inline mean station offset
            meanGhcnmOff = valiData[0]['meanGhcnmOff'];

            // add controls
            this.removeMapControlLayer('layerControl');
            this.addControls();
        }

        // add map info with shorttext
        this.addInfo();

        // add info table
        if (appSettings.infoTable) addInfoTable(mapController.getEventMarkerData());

        // add simple inline stats x events at x diffrent locations
        if (!appSettings.statistics && appSettings.inlineStats){
            addInlineStatistics(mapController.getEventMarkerData());
        }

        // show and update cru and ghcnm inline stats
        if(appSettings.statistics && appSettings.inlineStats){
            evaluationTextStats(mapController.getEventMarkerData());
            updateStats();
        }

        // re-enable select meanu:
        utils.enableMenu();

    },

    resetMapLayers : function(){
        var layers = mapController.getAllMapLayerModel();
        var layerType = Object.keys(layers);
        for(var i = 0; i < layerType.length; i++){
            this.removeMapLayer(layerType[i]);
        }
    },

    resetMapControls : function(){
        var controls = mapController.getAllMapControlsModel();
        var controls = Object.keys(controls);
        for(var i = 0; i < controls.length; i++){
            this.removeMapControlLayer(controls[i]);
        }
    },

    removeMapLayer : function(lName){
        var map = mapController.getMapObj();
        var layerObj = mapController.getMapLayerModel(lName);
        if (typeof layerObj !== 'undefined') {
            map.removeLayer(layerObj);
            mapController.deleteFromMapLayerModel(lName);
        }
    },

    removeMapControlLayer : function(lName){
        var map = mapController.getMapObj();
        var layerObj = mapController.getMapControlModel(lName);
        if (typeof layerObj !== 'undefined') {
            map.removeControl(layerObj);
            mapController.deleteFromMapControlModel(lName);
        }
    },

    removeMapLegends : function(){
        // remove all legend Items from map
        Object.keys(mapController.getAllMapControlsModel()).map(function(ctrlItem){
            if(~ctrlItem.toLowerCase().indexOf('legend')){
                mapLayersView.removeMapControlLayer(ctrlItem);
            }
        });
    },

    addControls : function(){

        var overlayPane = {};

        var layerControlLables = mapController.getLayerControlLables();

        // add all layers to layer control
        Object.keys(mapController.getAllMapLayerModel()).map(function(crtlItem){
            overlayPane[layerControlLables[crtlItem]] = mapController.getMapLayerModel(crtlItem);
        });

        // Add a layer control element to the map
        var layer = L.control.layers(null, overlayPane, {position: 'topleft'});

        // save layer
        mapController.setMapControlModel('layerControl', layer);

        // add layer to map
        mapController.getMapControlModel('layerControl').addTo(mapController.getMapObj());

        // set ckeckbox to true of hacked layer control event data
        $('span:contains(event marker)').parent().children(':first-child').attr('checked',true);

    },

    addInfo : function(){

        $('.info').remove();

        var year = mapController.getSelectedYear();
        var month = mapController.getSelectedMonth();
        var selMonthArr = new Array('NONE','January','February','March','April','May','June','July','August','September','October','November','December');

        //define info control
        var info = L.control({style:this.infoStyle, position: 'bottomleft'});

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
        };

        info.update = function (props) {

            var shortPointTxt = utils.getEventTextShort();

            if(typeof shortPointTxt === 'undefined'){
                this._div.innerHTML = '<h4>'+selMonthArr[month]+" "+year+'</h4>';
            } else {
                this._div.innerHTML = '<h4>'+selMonthArr[month]+" "+year+'</h4>' + '<i>'+shortPointTxt+'</i>';

                /*
                 this._div.innerHTML = '<h4>'+selMonthArr[month]+" "+year+'</h4>' +  (props ?
                 'TemperatureHHHHHHHHHHHHHHHHH: ' + props.temp
                 : '<i>'+shortPointTxt+'</i>'
                 );
                 */
            }

            if(mapController.getAppSettings().infoTable) highlightInfoTable('NULL') ;
        };

        // show detail info to selected (hover) index point
        info.updatePoint = function (props) {

            var text = props.text;
            var location = props.location;

            if(mapController.getAppSettings().infoTable) highlightInfoTable(location);

            text = utils.replaceAll(text, '*', '');
            //  if(text.length > 9000) text = text.substring(0,9000) +' [...]';
            this._div.innerHTML = '<h4>'+year+" "+selMonthArr[month]+'</h4>' +  (props ?
                '<b>Location: </b>' + props.location + '<br />'+
                (props.public == true ? '<b>Event Id: </b><a href=/index.php/grouping/event/show?event_id=' + props.event_id + '>'+props.event_id + '</a><br />' : '<b>Event Id: </b>' + props.event_id + '<br />')+
                    '<b>Value: </b>' + props.idx + '<br />'+
                '<b>Longitude: </b>' +  parseFloat(props.lon_info).toFixed(2) + '<br />'+
                '<b>Latitude: </b>' +  parseFloat(props.lat_info).toFixed(2) + '<br />'+
                '<b>Text: </b>' + text + '<br />'
                    : '');
        };

        // save layer
        mapController.setMapControlModel('info', info);

        // add layer to map
        mapController.getMapControlModel('info').addTo(mapController.getMapObj());

        // disable map interaction when cursor is in info field
        this.disableMapNexusByMouseOver();

        // customize info box
        this.styleInfoLayer();

    },

    // INFO BLOCK STYLE
    infoStyle : function(feature) {
        return {
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '0',
            fillOpacity: 0.7
        };
    },

    styleInfoLayer : function(){
        // modify info style
        var width = $('.left').width()-10;
        var height = ($('#map').height()/100) * 80;
        var statistics = mapController.getAppSettings().statistics;

        if(statistics) $('.info').css({'max-width':width, 'max-height':height, 'overflow': 'hidden'});
        else $('.info').css({'max-width':width, 'max-height':height});
    },

    disableMapNexusByMouseOver : function() {

        var info = mapController.getMapControlModel('info');
        var map = mapController.getMapObj();

        // Disable map interaction when user's cursor enters the element
        info.getContainer().addEventListener('mouseover', function () {
            map.dragging.disable();
            map.touchZoom.disable();
            map.doubleClickZoom.disable();
            map.scrollWheelZoom.disable();
        });

        // Re-enable map interaction when user's cursor leaves the element
        info.getContainer().addEventListener('mouseout', function () {
            map.dragging.enable();
            map.touchZoom.enable();
            map.doubleClickZoom.enable();
            map.scrollWheelZoom.enable();
        });

    }

};


var rasterLayers = {

    getRasterLayer : function(type){

        var self = this;
        var imageBounds = mapController.getGlobalImageBounds();

        // remove all previous added layers
        mapLayersView.resetMapLayers()

        if(type === 'temperatureMap'){

            var rasterHref = mapController.getTemperatureLayerHref("all_data");

            var mapTemperature =  $.getJSON(rasterHref.data.extent,
                function(res){
                    // check if view is available in db else show cru selMonth mean map
                    if(res['rasterExtent'] === 'no data'){
                        var imageUrl = rasterHref.noData;
                    } else {
                        var dim = res['rasterExtent'];
                        var imageUrl = rasterHref.data.data;

                        // place map like corner coordinates
                        var viewBounds = [[dim['ymax'], dim['xmax']], [dim['ymin'], dim['xmin']]];  //  ymax, xmax, ymin, xmin
                        if(!mapController.getAppSettings().statistics && mapController.getBbox() === 1) imageBounds = viewBounds;
                    }
                    self.renderRasterLayer(imageUrl, type, imageBounds, viewBounds)
                });

            mapController.setTemperatureAjax(mapTemperature);

        } else if(type == 'regressionMap'){

            var regressionMap = L.imageOverlay(mapController.getRegressionLayerHref(), imageBounds, {opacity:0.9});

            // save raster layer
            mapController.setMapLayerModel('regressionMap', regressionMap);

        } else if(type === 'selectedTemperatureMap') {
            if (mapController.getSelectedEventIds().length !== 0) {
                var rasterHref = mapController.getTemperatureLayerHref("select_data");

                selMap = $.getJSON(rasterHref.extent,
                    function (res) {
                        self.renderRasterLayer(rasterHref.data, type, imageBounds);
                    });
            }
        } else {
            return false;
        }
    },

    renderRasterLayer : function(imageUrl, type, imageBounds, viewBounds){

        var map = mapController.getMapObj();

        // create layer
        var layer = L.imageOverlay(imageUrl, imageBounds, {opacity:0.7});

        // save raster layer
        mapController.setMapLayerModel(type, layer);

        // add layer to map
        mapController.getMapLayerModel(type).addTo(map);

        // set view to countor Image extent
        if(typeof viewBounds !== 'undefined'){
            map.fitBounds(viewBounds);
        }
    },

};


var vectorLayers = {

    getMarkers : function(type){
        var self = this;
        var appSettings = mapController.getAppSettings();

        if(type === 'indexData'){

            // get indices data
            var eventIdx = $.getJSON(mapController.getEventDataHref(),
                function(response){
                    if(response != ''){

                        mapController.setEventMarkerData(response);

                        // check if points exist on same location; make little offset if so
                        response = self.checkSameLatLon(response);

                        // make geojson object from data
                        var geojson = GeoJSON.parse(response, {Point: ['lat', 'lon']});

                        // store all available event ids for select
                        mapController.setEventDataStorage(geojson);

                        // add index marker
                        if(!appSettings.statistics) self.addCircleMarker(geojson, type);
                    }
                }
            );

            mapController.setEventAjax(eventIdx);

        } else if(type === 'validationData') {

            if(mapController.areEventsUnselected()) {
                var ghcnmHref = mapController.getGhcnmHref("select_data");
            } else {
                var ghcnmHref = mapController.getGhcnmHref("all_data");
            }

            var ghcnmData = $.getJSON(ghcnmHref,
                function (response) {

                    // check if view is available in db
                    if (response['ghcnmData'] != '') {

                        // make geojson object from data
                        var geojson = GeoJSON.parse(response['ghcnmData'], {Point: ['lat', 'lon']});

                        // create station marker overlay
                        self.addCircleMarker(geojson, type);
                    }
                }
            );

            mapController.setGhcnmAjax(ghcnmData);

        }

    },

    checkSameLatLon : function(data, leafletObj){
        // check if points exist on same location; make little offset if so
        var offsetMultiplier = 0.3;

        if(typeof leafletObj !== 'undefined' && leafletObj) {
            var lfObject = data;
            var data = utils.latLngTolatLon(data);
        }

        var lats = data.map(function(obj) { return obj.lat; });
        var lons = data.map(function(obj) { return obj.lon; });

        var checkLoc = [];
        lats.filter(function(v,i) {
            if(lats.indexOf(v) !== i && lons.indexOf(lons[i]) !== i){

                var count = checkLoc.reduce(function(n, val) {
                    return n + (val === data[i]['lon']);
                }, 0);

                data[i]['lon'] =  parseFloat(data[i]['lon'])+(offsetMultiplier*count);
            }
            checkLoc.push(data[i]['lon']);
        });

        if(typeof leafletObj !== 'undefined' && leafletObj) {
            var data = utils.latLonToLatLngLf(data,lfObject);
        }

        return data;
    },

    addCircleMarker : function(geojson, type){

        var self = this;

        if(type !== "validationData"){
            var map = mapController.getMapObj();

            // add index marker
            var layer = L.geoJson(geojson, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, self.getMarkerOptions(feature, type));
                },
                onEachFeature: self.onEachFeature
            });

            // save layer
            mapController.setMapLayerModel(type, layer);

            // add layer to map
            if(!mapController.getAppSettings().statistics) mapController.getMapLayerModel(type).addTo(map);

        } else {

            // add climate station rectangle marker
            var layer = L.geoJson(geojson, {
                pointToLayer: function (feature, latlng) {
                    return  L.squareMarker(latlng, self.getMarkerOptions(feature, type));
                },
                onEachFeature: self.onEachFeature
            });

            // save layer
            mapController.setMapLayerModel(type, layer);
        }

    },

//#################################################################################################################
    // MARKER STYLING

    getMarkerOptions : function(feature, type) {
        if(type !== "validationData"){
            return {
                radius: 6,
                fillColor: this.getEventColor(feature.properties.idx),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }
        } else {
            return {
                radius: 5,
                fillColor: legends.getTemperatureColor(feature.properties.temperature),
                color: "#000",
                weight: 1,
                opacity:1,
                fillOpacity: 0.7
            }
        }
    },

    // colors for event markers
    getEventColor : function(d) {
        return d == '-3' ? '#4575b4' :
            d == '-2'  ? '#91bfdb' :
                d == '-1'  ? '#e0f3f8' :
                    d == '0'  ? '#ffffbf' :
                        d == '1'  ? '#fee090' :
                            d == '2'  ? '#fc8d59' :
                                d == '3'  ? '#d73027' :
                                    '#9F0000';
    },

    //#################################################################################################################
    // MARKER ANIMATION

    onEachFeature : function(feature, layer){

        var self = this;

        // define events
        layer.on({
             mouseover: highlightFeature,
             mouseout: resetHighlight,
            click: toggleDetails
        })

        function toggleDetails(e){
            var layer = e.target;
            var layerId = layer._leaflet_id;
            var info = mapController.getMapControlModel('info');
            var activeId = mapController.getActiveInfoLayerId();

            if(activeId === layerId) {
                info.update(layer.feature.properties);
                mapController.setActiveInfoLayerId("");
            } else {
                info.updatePoint(layer.feature.properties);
                mapController.setActiveInfoLayerId(layerId);
            }

        }

        // open info with event information
        function highlightFeature(e) {

            var layer = e.target;

            var info = mapController.getMapControlModel('info');

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
        };

        // close info
        function resetHighlight(e){

            var layer = e.target;
            if(layer.feature.properties.text){
                if(!e.target['_radius']) Lgeojson.resetStyle(e.target);
                if(mapController.getAppSettings().statistics) mapController.getLayerModel('info').update();
            } else {
                setTimeout(function(){ layer.closePopup(); }, 2000);
            }
        };


        function toggleFeature(e){

            var layer = e.target;

            var info = mapController.getLayerModel('info');

            // only index points are clickable
            if(layer.feature.properties.text){

                if(!mapController.getAppSettings().statistics){
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
        };

    },

};

var mapController = {

    init : function(){
        // get yii data routes
        mapModel.parseYiiDomDataRoutes();

        // clear session storage from previous sessions
        // TODO: depracted
        sessionStorage.clear();

        mapView.init();

        this.triggerUpdateAppData();

    },

    updateApp : function(year, month){

        $('.right').append("<img class='loading' src="+loadingGif+" /></div>")

        // disable select menu
        utils.disableMenu();

        mapModel.year = year;
        mapModel.month = month;
        mapLayersView.updateMap();
    },

    setMapObj : function(map){
        mapModel.mapObj = map;
    },

    getMapObj : function(){
        return mapModel.mapObj;
    },

    getBbox : function(){
        return mapModel.bbox;
    },

    setBbox : function(bbox){
        mapModel.bbox = bbox;
    },

    getTemperatureClickHref : function(){
        return mapModel.temperatureClickHref;
    },

    setEventDataStorage : function(json){
        mapModel.setEventIds(json);
        mapModel.eventJson = json;
    },

    getEventDataJson : function(){
        return mapModel.eventJson;
    },

    getAllEventIds : function(){
        return mapModel.allEventIds;
    },

    setAllEventIds : function(ids){
        mapModel.allEventIds = ids;
    },

    getSelectedEventIds : function(){
        return mapModel.selectedEventIds;
    },

    updateSelectedEventIds : function(evidsSel){
        mapModel.selectedEventIds = evidsSel;
    },

    getSelectedYear : function(){
        return mapModel.year;
    },

    getSelectedMonth : function(){
        return mapModel.month;
    },

    getTemperatureLayerHref : function(mode){
        if(mode == "all_data") {
            if (mapModel.bbox === 1) {
                var rasterData = mapModel.temperatureRasterHref();
                var rasterNoData = mapModel.temperatureRasterNoDataHref();
            } else {
                var rasterData = mapModel.temperatureBboxRasterHref();
                var rasterNoData = mapModel.temperatureRasterNoDataHref();
            }
            return {
                data: rasterData,
                noData: rasterNoData
            }
        } else if(mode == "select_data"){
            return mapModel.temperatureSelectRasterHref();
        }
    },

    getRegressionLayerHref : function(){
        if(mapModel.bbox !== 1 && typeof mapModel.selectedEventIds === 'undefined'){
            return mapModel.regressionBboxRasterHref();
        } else {
            if(typeof mapModel.selectedEventIds !== 'undefined'){
                return mapModel.regressionSelectRasterHref();
            } else {
                return mapModel.regressionRasterHref();
            }
        }
    },

    getGlobalImageBounds : function(){
        return mapModel.globalImageBounds;
    },

    setMapLayerModel : function(type, layer){
        mapModel.mapLayers[type] = layer;
    },

    getMapLayerModel : function(type){
        return mapModel.mapLayers[type];
    },

    deleteFromMapLayerModel : function(type){
        delete mapModel.mapLayers[type];
    },

    getAllMapLayerModel : function(){
        return mapModel.mapLayers;
    },

    setMapControlModel : function(type, layer){
        mapModel.mapControls[type] = layer;
    },

    getMapControlModel : function(type){
        return mapModel.mapControls[type];
    },

    deleteFromMapControlModel : function(type){
        delete mapModel.mapControls[type];
    },

    getAllMapControlsModel : function(){
        return mapModel.mapControls;
    },

    getEventDataHref : function(){
        return mapModel.getEventMarkerHref();
    },

    setEventMarkerData : function(mData){
        mapModel.eventMarkerData = mData;
    },

    getEventMarkerData : function(mData){
        return mapModel.eventMarkerData;
    },

    getAppSettings : function(){
        return {
            infoTable : mapModel.showInfoTableStats,
            inlineStats : mapModel.enableInlineStats,
            statistics : mapModel.enableStatistics,
            timeline : mapModel.showTimeline,
            filterByTimeframe : mapModel.filterByTimeframe
        }
    },

    updateAppSettings : function(setting, value){
        mapModel[setting] = value;
    },

    getGhcnmHref : function(mode){
        return mapModel.getGhcmnMarkerHref(mode);
    },

    setTemperatureAjax : function(ajax){
        mapModel.temperatureAjax = ajax;
    },

    getTemperatureAjax : function(){
        return mapModel.temperatureAjax;
    },

    setEventAjax : function(ajax){
        mapModel.eventAjax = ajax;
    },

    getEventAjax : function(){
        return mapModel.eventAjax;
    },

    setGhcnmAjax : function(ajax){
        mapModel.ghcnmAjax = ajax;
    },

    getGhcnmAjax : function(){
        return mapModel.ghcnmAjax;
    },

    setTemperatureRange : function(tRange){
        mapModel.temperatureRange = tRange[0].rasterMinMax;
    },

    getTemperatureRange : function(){
        return mapModel.temperatureRange;
    },

    areEventsUnselected : function(){
        if(this.getSelectedEventIds().length != this.getAllEventIds().length){
            return true;
        } else {
            return false;
        }
    },
    /*
     allEventsUnselected : function(){
     console.log(this.getSelectedEventIds())
     if(typeof this.getSelectedEventIds()[0] === 'undefined'){
     return true;
     } else {
     return false;
     }
     },
     */
    getLayerControlLables : function(){
        return mapModel.layerControlLables;
    },

    removeAllMapControls : function(){
        mapLayersView.resetMapControls();
    },

    removeMapLayerByName : function(lName){
        mapLayersView.removeMapLayer(lName);
    },

    removeMapControlByName : function(cName){
        mapLayersView.removeMapControlLayer(cName);
    },

    removeAllMapLayers : function(){
        mapLayersView.resetMapLayers();
    },

    removeAllMapLegends : function(){
        mapLayersView.removeMapLegends();
    },

    setActiveInfoLayerId : function(id){
        mapModel.activeInfoLayerId = id;
    },

    getActiveInfoLayerId : function(){
        return mapModel.activeInfoLayerId;
    },

    renderMapControls : function(){
        mapLayersView.addControls();
    },

    renderMapFeatures : function(rasterMinMax, valiData){
        mapLayersView.renderMapFeatures(rasterMinMax, valiData);
    },

    vectorlayersGetMarkers: function(type){
        vectorLayers.getMarkers(type);
    },

    getGhcnmBaseHref : function(){
        return mapModel.ghcnmBaseHref;
    },

    addCircleMarker : function(geojson, type){
        vectorLayers.addCircleMarker(geojson, type);
    },

    updateAllEvidsModel : function(array){
        utils.updateAllEvidsAivailabel(array);
    },

    triggerUpdateAppData : function(){

        $.getJSON(mapModel.updateAppBaseHref,
            function(response){
                if(response){
                    console.log('new data added to database');
                } else {
                    console.log('no new data available');
                }
            })

    },



};

var utils = {

    // create default historical text from shortest historical comment
    getEventTextShort : function(){

        var eventJson = mapController.getEventDataJson();

        if(typeof eventJson !== 'undefined'){

            // find shortest text of all events in month
            for(var i = 0; i < eventJson.features.length; i++){
                var pointTxt = eventJson.features[i].properties['text'];
                if(i == 0){
                    var shortPointTxt = pointTxt;
                }
                else if(shortPointTxt.length > pointTxt.length){
                    var shortPointTxt = pointTxt;
                }
            }

            // cut text to n chars and display selMonth selYear h4
            shortPointTxt = utils.replaceAll(shortPointTxt, '*', '');
            if(shortPointTxt.length > 150) shortPointTxt = shortPointTxt.substring(0,150) +' [...]';

        } else {
            var shortPointTxt = undefined;
        }
        return shortPointTxt;
    },

    enableMenu : function(){
        $('#century').css({'pointerEvents':'auto'});
        $('#decade').css({'pointerEvents':'auto'});
        $('#year').css({'pointerEvents':'auto'});
        $('#month').css({'pointerEvents':'auto'});
        $('#map .leaflet-clickable').css({'pointerEvents':'auto'});
    },

    disableMenu : function(){
        $('#century').css({'pointerEvents':'none'});
        $('#decade').css({'pointerEvents':'none'});
        $('#year').css({'pointerEvents':'none'});
        $('#month').css({'pointerEvents':'none'});
        $('#map .leaflet-clickable').css({'pointerEvents':'none'});
    },

    updateEvidsSelected : function(layerId){
        var selectedEventIds = mapController.getSelectedEventIds();

        if(!~jQuery.inArray(layerId, selectedEventIds)){
            selectedEventIds.push(layerId);
        } else {
            var idx = jQuery.inArray(layerId, selectedEventIds);
            selectedEventIds.splice(idx, 1);
        }
        // update selected Event IDS array
        mapController.updateSelectedEventIds(selectedEventIds);
    },

    updateAllEvidsAivailabel : function(array) {

        // store all event Ids
        var allEventIdsNew = [];
        array.map(function (layer) {
            allEventIdsNew.push(parseInt(layer.id));
        })

        // update all event ids model
        mapController.setAllEventIds(allEventIdsNew);
    },


    /*
     getAllEventIds : function(geojson){
     //get all event_id's for this selYear selMonth combi
     allEventIds = [];
     selectedEventIds = [];
     for(var i = 0; i < geojson.features.length; i++){
     allEventIds.push(geojson.features[i].properties['event_id']);
     // make deep copy cause js a = b is just a reference ...
     selectedEventIds = deepCopy(allEventIds);
     }
     },
     */

    toggleLayersForRemove : function(){
        // solves bug, where temperature map is not removeable while
        // regionalised map is shown and temperature map is toggled off
        var tMpaControl = $('span:contains('+mapController.getLayerControlLables().regressionMap+')').parent().children(':first-child')
        if(!tMpaControl.is(':checked')){
            tMpaControl.click();
        }
    },

    //replaces all search with replacement
    replaceAll : function(str, search, replacement) {
        return str.split(search).join(replacement);
    },
}

$(function(){
    mapController.init();
})