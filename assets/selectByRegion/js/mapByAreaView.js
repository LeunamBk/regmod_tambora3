var coverageModel = {

    coverageEventData : "",

    coverageEventRawData : "",

    covHeatmapExtentYiiDom : "#byRegionOverviewExtent-content",
    covHeatmapExtentBaseHref : "",

    covHeatmapDataYiiDom : "#byRegionOverviewData-content",
    covHeatmapDataBaseHref : "",

    coverageHeatmapHref : function(mode) {
        var baseDataHref = this.covHeatmapDataBaseHref;
        var baseExtentHref = this.covHeatmapExtentBaseHref;
        var bbox = mapController.getBbox();

        if(typeof mode === 'undefined' && bbox.length === 4){
            var bboxJson = JSON.stringify(bbox);
            var hrefExtent = baseExtentHref + '?mode=bbox_data&bbox=' + bboxJson;
            var hrefData = baseDataHref + '?mode=bbox_data&bbox=' + bboxJson;
        } else if(typeof mode === 'undefined' && bbox.length !== 4){
            var hrefExtent = baseExtentHref;
            var hrefData = baseDataHref;
        } else if(mode === 'timeframe' && bbox.length !== 4){
            var dates = coverageModel.timeframeFilter;
            var yearStart = dates.startYear;
            var yearEnd = dates.endYear;
            var hrefExtent = baseExtentHref + '?mode=timeframe_data&yearStart='+yearStart+'&yearEnd='+yearEnd;
            var hrefData = baseDataHref + '?mode=timeframe_data&yearStart='+yearStart+'&yearEnd='+yearEnd;
        } else if(mode === 'timeframe' && bbox.length === 4){
            var bboxJson = JSON.stringify(bbox);
            var hrefExtent = baseExtentHref + '?mode=timeframe_bbox_data&bbox=' + bboxJson;
            var hrefData = baseDataHref + '?mode=timeframe_bbox_data&bbox=' + bboxJson;
        }


        return { data : hrefData,
            extent : hrefExtent}

    },

    covEventMarkerDataYiiDom : "#byRegionEventData-content",
    covEventMarkerDataBaseHref : "",

    coverageMarkerHref : function() {
        var baseDataHref = this.covEventMarkerDataBaseHref;
        var bbox = mapController.getBbox();

        if (bbox.length === 4) {
            var bboxJson = JSON.stringify(bbox);
            var hrefData = baseDataHref + '?mode=bbox_data&bbox='+bboxJson;
        } else {
            var hrefData = baseDataHref;
        }

        return hrefData;

    },

    getCoverageMarkerDataByTime : function(){


        function filterbyTimeframe(value){
            var dates = coverageModel.timeframeFilter;
            var startYear = dates.startYear;
            var endYear = dates.endYear;

            return (value.year >= startYear && value.year <= endYear)
        };

        var rawdata = this.coverageEventRawData;
        var filteredData = rawdata.filter(filterbyTimeframe);

        return coverageUtils.aggregateEventsByLocation(filteredData);

    },

    timeframeFilter : {startYear: "", endYear: ""}

}


var coverageController = {

    init: function () {

        // remove all prevoius rendered map layers
        mapController.removeAllMapControls();
        mapController.removeAllMapLayers();

        this.parseCovYiiDomDataRoutes();
        this.render();

    },

    render: function () {
        coverageVectorView.addCoverageEventMarker();
        coverageRasterView.addCoverageHeatmap();
        coverageDrawControlsView.init();
    },

    renderUpdate: function () {

        mapController.removeAllMapLegends();

        // selective removing of layers for maintain bbox rectangle layer
        // TODO: change this if more layers have to be available over multiple views away.
        // eg. with own layer cache class
        mapController.removeMapLayerByName('coverageMap');
        mapController.removeMapLayerByName('coverageEventMarker');

        coverageVectorView.addCoverageEventMarker();
        coverageRasterView.addCoverageHeatmap();

    },

    renderUpdateByTime: function () {

        mapController.removeMapLayerByName('coverageEventMarker');
        coverageVectorView.updateCoverageEventMarker();

    },

    renderUpdateCoverageHeatmap: function() {
        if (mapController.getAppSettings().filterByTimeframe) {
            mapController.removeMapLayerByName('coverageMap');
            mapController.removeMapControlByName('covHeatmapLegend');
            coverageRasterView.addCoverageHeatmap('timeframe');
        }
    },

    parseCovYiiDomDataRoutes: function () {

        coverageModel.covHeatmapExtentBaseHref = $(coverageModel.covHeatmapExtentYiiDom).attr('data-url');
        coverageModel.covHeatmapDataBaseHref = $(coverageModel.covHeatmapDataYiiDom).attr('data-url');
        coverageModel.covEventMarkerDataBaseHref = $(coverageModel.covEventMarkerDataYiiDom).attr('data-url');

    },

    getCoverageHeatmapHref: function (mode) {
        return coverageModel.coverageHeatmapHref(mode);
    },

    getCoverageMarkerHref: function () {
        return coverageModel.coverageMarkerHref();
    },

    setCovEventData: function (eventData) {
        coverageModel.coverageEventData = eventData;
    },

    setCovEventRawData: function (eventData) {
        coverageModel.coverageEventRawData = eventData;
    },

    getCovEventRawData: function () {
        return coverageModel.coverageEventRawData;
    },

    getCovEventData: function (markerData) {
        return coverageModel.coverageEventData;
    },

    getTimeFilteredMarkerData: function () {
        return coverageModel.getCoverageMarkerDataByTime();
    },

    filterByTimeframe: function(brushExtent) {

        if (mapController.getAppSettings().filterByTimeframe) {
            var start = brushExtent[0];
            var end = brushExtent[1];

            // save timeframe start end dates
            coverageModel.timeframeFilter.startYear = parseInt(Highcharts.dateFormat('%Y', start));
            coverageModel.timeframeFilter.endYear = parseInt(Highcharts.dateFormat('%Y', end));

            // update markers displayed based on timeframe
            this.renderUpdateByTime();
        }
    },



}

var coverageRasterView = {

    // create available data heatmap
    addCoverageHeatmap : function(mode) {

        var coverageRaster = coverageController.getCoverageHeatmapHref(mode);

        $.getJSON(coverageRaster.extent,
            function (res) {

                var map = mapController.getMapObj();

                var dim = res['rasterExtent'];

                // var bbox = mapController.getBbox();
                // var viewBounds = [[bbox[1]['lat'], bbox[2]['lon']], [bbox[0]['lat'], bbox[0]['lon']]];  //  ymax, xmax, ymin, xmin

                var imageBounds = [[dim['ymax'], dim['xmax']], [dim['ymin'], dim['xmin']]];  //  ymax, xmax, ymin, xmin

                var coverageMap = L.imageOverlay(coverageRaster.data, imageBounds, {opacity: 0.7});

                // save raster layer
                mapController.setMapLayerModel('coverageMap', coverageMap);

                // add layer to map
                mapController.getMapLayerModel('coverageMap').addTo(map);

                // set view to countor Image extent
                map.fitBounds(imageBounds);

                // add legend
                coverageLegendView.addCovHeatmapLegend();
            }
        );
    }

}


var coverageVectorView = {

    addCoverageEventMarker : function() {

        var self = this;

        $.getJSON(coverageController.getCoverageMarkerHref(),
            function(eventData) {

                var map = mapController.getMapObj();

                // save coverage raw event data for time based selection
                coverageController.setCovEventRawData(eventData);

                // aggreagte data by location and count
                eventData = coverageUtils.aggregateEventsByLocation(eventData);

                // convert to geojson object
                var covEventData = GeoJSON.parse(eventData, {Point: ['lat', 'lon']});

                // save coverage event data
                coverageController.setCovEventData(covEventData);

                // style coverage event marker
                var coverageEventMarker = L.geoJson(covEventData, {
                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng, self.getCovMarkerOptions(feature));
                    },
                    onEachFeature: self.covMarkerOnEachFeature
                });

                // save coverage marker layer
                mapController.setMapLayerModel('coverageEventMarker', coverageEventMarker);

                // add layer to map
                mapController.getMapLayerModel('coverageEventMarker').addTo(map);

                // ensure larger markers dont cover smaler ones
                self.smallerMarkersToFront();

                // add legend
                coverageLegendView.addCovMarkerLegend();
            }
        );
    },

    // updates coverage marker based on time selection
    updateCoverageEventMarker : function(){

        var self = this;
        var map = mapController.getMapObj();

        var eventData = coverageController.getTimeFilteredMarkerData();

        // convert to geojson object
        var covEventData = GeoJSON.parse(eventData, {Point: ['lat', 'lon']});

        // style coverage event marker
        var coverageEventMarker = L.geoJson(covEventData, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, self.getCovMarkerOptions(feature));
            },
            onEachFeature: self.covMarkerOnEachFeature
        });

        // save coverage marker layer
        mapController.setMapLayerModel('coverageEventMarker', coverageEventMarker);

        // add layer to map
        mapController.getMapLayerModel('coverageEventMarker').addTo(map);

        // ensure larger markers dont cover smaler ones
        self.smallerMarkersToFront();

    },

    smallerMarkersToFront : function(){
        // ensures that all circels are hoverable by bringing the smaler ones
        // (first to iterate) to front
        var eventMarker = mapController.getMapLayerModel('coverageEventMarker');
        for (layer in eventMarker._layers) {
            eventMarker._layers[layer].bringToBack();
        };
    },

    getCovMarkerOptions : function(feature){
        return {
            radius: 3+(feature.properties.count/5),
            fillColor: '#ffffbf',
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6
        }
    },

    covMarkerOnEachFeature : function(feature, layer){
        layer.on({
            click: toggleCoverageMarkerFeature
        });


        function toggleCoverageMarkerFeature(e){
            var layer = e.target;

            layer.bindPopup('<b>Location: </b>'+layer.feature.properties.location+'<br><b>Event Count: </b>'+layer.feature.properties.count);
            layer.openPopup();
            setTimeout(function(){ layer.closePopup(); }, 3000);

        }


    },



}


var coverageLegendView = {

    addCovHeatmapLegend : function(){

        var self = this;
        var map = mapController.getMapObj();

        var covHeatmapLegend = L.control({position: 'bottomright'});

        covHeatmapLegend.onAdd = function() {
            var div = L.DomUtil.create('div', 'info legendHz'),
                grades1 = ['less','' ,'data' ,'' ,'','','more' ,'' ,'' ,'data',''],

                grades = [0.9,0.91,0.92,0.93,0.94,0.95,0.96,0.97,0.98,0.99,1.0],
                grades = grades.sort(function(a,b){return a - b}),
                grades = grades,
                labels = [];
            div.innerHTML += '<center><b>data per raster cell</b></center>'

            // loop through our density intervals and generate a label with a colored square for each interval
            // first loop for colored legend boxes
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<span style="background:' + self.heatmapColor(grades[i]) + '"></span> ';
            }

            // a line break
            div.innerHTML += '<br>';

            // second loop for text
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<label><b>' + grades1[i]+ '</b></label>';
            }
            return div;
        };

        // save legend control layer
        mapController.setMapControlModel('covHeatmapLegend', covHeatmapLegend)

        // add legend layer to map
        mapController.getMapControlModel('covHeatmapLegend').addTo(map);

    },

    // heatmap legend color gradient
    heatmapColor : function(d) {
        return d > 9999 ? '#000000' :
            d > 0.99 ? '#a50026' :
                d > 0.98 ? '#d73027' :
                    d > 0.97 ? '#f46d43' :
                        d > 0.96 ? '#fdae61' :
                            d > 0.95 ? '#fee090' :
                                d > 0.94 ? '#ffffbf' :
                                    d > 0.93 ? '#e0f3f8' :
                                        d > 0.92 ? '#abd9e9' :
                                            d > 0.91 ? '#74add1' :
                                                d > 0.90 ? '#4575b4' :
                                                    d > 0.85 ? '#313695' :
                                                        '#000000';
    },

    addCovMarkerLegend : function(){

        var self = this;
        var map = mapController.getMapObj();

        var eventMarkerCircleLegend = L.control( { position: 'bottomright' } );

        eventMarkerCircleLegend.onAdd = function() {
            return self.covMarkerLegend();
        };

        // save legend control layer
        mapController.setMapControlModel('eventMarkerCircleLegend', eventMarkerCircleLegend)

        // add legend layer to map
        mapController.getMapControlModel('eventMarkerCircleLegend').addTo(map);

    },

    getCovMarkerRange : function(){

        // get unique values
        function unique(elem){
            var count = elem.properties.count;
            if(!~uniqueValues.indexOf(count)) uniqueValues.push(count);
        }

        // get marker data
        var eventData = coverageController.getCovEventData();

        var uniqueValues = [];
        eventData.features.map(unique);

        var min = Math.min.apply(null, uniqueValues),
            max = Math.max.apply(null, uniqueValues);

        // ensure propper legend visualisation even with view events
        if( min === max || max <= 70){
            min = 1;
            max = 70;
        }

        return { min : min,
            max : max };

    },

    covMarkerLegend : function(){

        var legendRange = this.getCovMarkerRange();
        var min = legendRange.min;
        var max = legendRange.max;

        var legendContainer = L.DomUtil.create("div", "legend"),
            symbolsContainer = L.DomUtil.create("div", "symbolsContainer"),
            classes = [min, coverageUtils.roundNumber((max-min)/2), coverageUtils.roundNumber(max)].reverse(),
            legendCircle,
            diameter,
            diameters = [];

        // define legead title and set margins for same width as heatmap legend
        $(legendContainer).append("<h3 style='margin:0px 5px 0px 3px !important;'>event count</h3>");

        // create circles
        for (var i = 0; i < classes.length; i++) {

            legendCircle = L.DomUtil.create("div", "legendCircle");
            diameter =  2*(3+(classes[i]/5));
            diameters.push(diameter);

            var lastdiameter;

            if (diameters[i-1]){
                lastdiameter = diameters[i-1];
            } else {
                lastdiameter = 0;
            };

            $(legendCircle).attr("style", "width: "+diameter+"px; height: "+diameter+
                "px; margin-left: -"+((diameter+lastdiameter+2)/2)+"px" );
            $(legendCircle).append("<span class='legendValue'>"+classes[i]+"<span>");
            $(symbolsContainer).append(legendCircle);
        };

        $(legendContainer).append(symbolsContainer);

        L.DomEvent.addListener(legendContainer, 'mousedown', function(e) { L.DomEvent.stopPropagation(e); });

        return legendContainer;
    }

}


var coverageDrawControlsView = {

    init : function(){

        this.addDrawnLayerGroup();
        this.addDrawControls();
        this.addDrawEventListner();

    },

    addDrawnLayerGroup : function(){

        var map = mapController.getMapObj();

        // Initialise the FeatureGroup to store editable layers
        var drawnMapItems = new L.FeatureGroup();

        // save layer
        mapController.setMapLayerModel('drawnMapItems', drawnMapItems);

        // add layer to map
        mapController.getMapLayerModel('drawnMapItems').addTo(map);

    },

    addDrawControls : function(){

        var map = mapController.getMapObj();

        // Initialise the draw control and pass it the FeatureGroup of editable layers
        var drawControl = new L.Control.Draw({
            draw: {
                position: 'topleft',
                polygon: false,
                polyline: false,
                circle: false,
                marker: false
            },
            edit: {
                featureGroup: mapController.getMapLayerModel('drawnMapItems')
            }
        });

        // save layer
        mapController.setMapControlModel('drawControl', drawControl);

        // add layer to map
        mapController.getMapControlModel('drawControl').addTo(map);

    },

    addDrawEventListner : function(){

        var self = this;
        var map = mapController.getMapObj();

        // unbind previous set event listners
        map.removeEventListener('draw:created');
        map.removeEventListener('draw:edited');
        map.removeEventListener('draw:deletestart');

        // triggered when a new rectangle has been created.
        map.on('draw:created', function (e) {

                var layer = e.layer;

                // var get drawm items layer group
                var drawnItems = mapController.getMapLayerModel('drawnMapItems');

                // remove prevous drawn elements from layer group
                drawnItems.clearLayers();

                // add new layer to drawn items layer group
                drawnItems.addLayer(layer);

                // calculate and store bounding box coordinates of drawn rectangle
                self.calculateDrawnBoundingBox(layer);

                // update view with spatial subselected data
                coverageController.renderUpdate();

            }
        );

        // triggered when layer has been edited and saved
        map.on('draw:edited', function (e) {

            var layers = e.layers;

            layers.eachLayer(function(layer) {

                // calculate and store bounding box coordinates of drawn rectangle
                self.calculateDrawnBoundingBox(layer);

                // update view with spatial subselected data
                coverageController.renderUpdate();

            });
        });

        // triggered when layer has been deleted
        map.on('draw:deletestart', function (e) {

            // surpress delete menu with cancel and save
            $('*[title="Save changes."]').parent().parent().remove();

            // remove drawn layers
            mapController.getMapLayerModel('drawnMapItems').clearLayers();

            // set bounding box to no boundingbox available
            mapController.setBbox(1);

            // update view
            coverageController.renderUpdate();

        });

    },

    calculateDrawnBoundingBox : function(layer){

        // var area = L.GeometryUtil.geodesicArea(layer.getLatLngs())
        var latlon = layer.getLatLngs()
        var bbox = [];
        for(var i = 0; i < 4; i++){
            bbox.push({'lat':latlon[i]['lat'],'lon':latlon[i]['lng']});
        }

        // save bbox coordinates
        mapController.setBbox(bbox);

        // update controls with region info
        coverageByBboxControlsView.updateControlsByArea();

    },

}

var coverageByBboxControlsView = {

    updateControlsByArea : function(){

        // Enable/Disable filtering of events based on timeline selected timeframe
        mapController.updateAppSettings('filterByTimeframe', false);

        var bboxJson = JSON.stringify(mapController.getBbox());

        // get Timeline Data and preselect (brush) century
        var timelineHref = $('#timelineData-content').attr('data-url');
        $.getJSON(timelineHref+'?mode=bbox_data&bbox='+bboxJson,
            function(res){

                // remove old timeline
                $('#timeline svg').remove();

                // draw new timeline
                drawBarPlot(res, 0);

            });


        // populate select
        var tilesHref = $('#tilesSelectData-content').attr('data-url');
        $.getJSON(tilesHref+'?mode=bbox_data&bbox='+bboxJson,
            function(res){
                // make no click init
                sessionStorage.setItem('noclick', 1);
                createTileSelect1(res, 'century', '');
        });


    },

    addAreaTimeline :function(){
        /*
         // Enable/Disable filtering of events based on timeline selected timeframe
         mapController.updateAppSettings('filterByTimeframe', false);

         var bboxJson = JSON.stringify(JSON.parse(mapController.getBbox()))

         // get Timeline Data and preselect (brush) century
         var timelineHref = $('#timelineData-content').attr('data-url');
         $.getJSON(timelineHref+'?mode=bbox_data&bbox='+bboxJson,
         function(res){
         //  $('.right svg').remove();
         drawBarPlot(res, 0,function(){
         drawBrush(1000, 1899);
         });
         });

         // Enable/Disable filtering of events based on timeline selected timeframe
         mapController.updateAppSettings('filterByTimeframe', true);
         */
    }

}




var coverageUtils = {

    roundNumber : function(inNumber) {
        return (Math.round(inNumber/10) * 10);
    },

    aggregateEventsByLocation : function(array){
        // the aggregation is done here because of time frame based marker selection
        // if data is aggregfated by sql, every new time frame has to be queried from db
        var aggregate = [];
        for(var i = 0; i < array.length; i++) {
            var count = 1;
            var newValue = true;
            for (var j = 0; j < aggregate.length; j++) {
                if (array[i].lat === aggregate[j].lat && array[i].lon === aggregate[j].lon) {
                    newValue = false;
                    aggregate[j].count = aggregate[j].count + 1;
                    break;
                }
            }
            if(newValue){
                array[i].count = 1;
                aggregate.push(array[i]);
            }
        }

        // sort aggregated data
        aggregate.sort(function(a, b) {
            return a.count - b.count;
        })


        return aggregate;
    },

}
