
$(function(){
    controller.init();
// add navigation triggers
    $('.navi li a').click(function(){
        $('#reconstructor-form').hide();
        /*
         if(model.marker.length !== 0){
         for(id in model.marker){
         map.removeLayer(model.marker[id])
         }
         model.marker = [];

         model.tableRowNumber = -1;

         }
         */
        if($(this).parent().attr('class') == 'evaluation') {

            $('#reconstructor-form').show();
       //     $('.table-remove:visible').click();
            //controller.setYearMonth(lacatorArr['year'], lacatorArr['month']);
            //controller.setMapObj(map);
            //controller.setEventIdsArray(allEventIds);
            controller.render();

        }
    });
});

var model = {

    init : function(){
        this.parseReconYiiDomDataRoutes();
    },

    markerColors : {
        '-3' : '#4575b4',
        '-2' : '#91bfdb',
        '-1' : '#e0f3f8',
        '0'  : '#ffffbf',
        '1'  : '#fee090',
        '2'  : '#fc8d59',
        '3'  : '#d73027',
    },

    tableRowNumber : -1,

    year : "",

    month : "",

    mapObj : "",

    tamboraEvents : "",

    selectData : [],

    marker : [],

    eventFormData : [],

    livereconstructDataYiiDom : "#liveReconstructTemperatureData-content",
    livereconstructDataBaseHref : "",

    livereconstructExtentYiiDom : "#liveReconstructTemperatureExtent-content",
    livereconstructExtentBaseHref : "",

    // jquery dom referneces of the yii data routes to urls
    parseReconYiiDomDataRoutes : function() {
        this.livereconstructDataBaseHref = $(this.livereconstructDataYiiDom).attr('data-url');
        this.livereconstructExtentBaseHref = $(this.livereconstructExtentYiiDom).attr('data-url');
        this.livereconstructRegressionDataBaseHref = $(this.livereconstructRegressionDataYiiDom).attr('data-url');
    },

    reconstructedDataHref : function(){
        var baseExtentHref = this.livereconstructExtentBaseHref;
        var baseDataHref = this.livereconstructDataBaseHref;
        var formData = this.eventFormData;
        var year = mapController.getSelectedYear();
        var month = mapController.getSelectedMonth();

        var hrefExtent  = baseExtentHref+'?year='+year+'&month='+month+'&eventIdString='+JSON.stringify(formData);
        var hrefData = baseDataHref+'?year='+year+'&month='+month+'&eventIdString='+JSON.stringify(formData);

        return { data : hrefData,
            extent : hrefExtent};

    },

    reconstructedTMeta : "",

    livereconstructRegressionDataYiiDom : "#liveReconstructRegressionData-content",
    livereconstructRegressionDataBaseHref : "",

    getRegressionLayerHref : function(){
        var baseDataHref = this.livereconstructRegressionDataBaseHref;
        var formData = this.eventFormData;
        var year = mapController.getSelectedYear();
        var month = mapController.getSelectedMonth();

        var hrefData = baseDataHref+'?year='+year+'&month='+month+'&eventIdString='+JSON.stringify(formData);
        return hrefData;

    },

    getGhcnmLayerHref : function(){
        var baseHref = mapController.getGhcnmBaseHref();
        var year = mapController.getSelectedYear();
        var month = mapController.getSelectedMonth();
        var formData = this.eventFormData;

        var href = baseHref+'?mode=reconstructed_data&year='+year+'&month='+month+'&eventIds='+JSON.stringify(formData);
        return href;
    }

};


var formView = {

    init : function(){
        this.addFormHtml();
        this.addFormTableLogic();

    },

    addFormHtml : function(){
        $('#reconstructor-form').appendTo('#top .left');
    },

    render : function(){

        this.populateReconSelect();
        this.populateFormTable();
    },

    populateReconSelect : function() {
        $('#yearSel').val(mapController.getSelectedYear());
        $('#monthSel option:eq(' + mapController.getSelectedMonth() + ')').prop('selected', true)
    },

    addFormTableLogic : function(){

        var $TABLE = $('#table');
        var $BTN = $('#recon-submit');
        var $EXPORT = $('#export');
        var self = this;

        $('.table-add').click(function () {
            var rowNumber = controller.getTableRowNumber();

            var $clone = $TABLE.find('tr.hide').clone(false).removeClass('hide table-line');
            $clone.find('.id').html(++rowNumber);
            $clone.find('.event-active').attr('disabled',true);
            $TABLE.find('table').append($clone);

            self.addOnchangeMap();
            self.addAutocomplete();

            $('.table-remove').click(function () {

                // reconstruct t with layer removed if active
                var $activateBox = $(this).parents('tr').find('.event-active');
                if($activateBox.is(':checked')) {
                    $activateBox.click();
                }

                // remove form entry
                $(this).parents('tr').detach();
                var id = $(this).parent().parent().find('.id').text();

                // remove marker from map
                evaluationMapView.removeMarker(id);

            });

            controller.setTableRowNumber(rowNumber);
        });

        $BTN.click(function () {

            // turn all existing rows into a loopable array ad store in model
            self.formRowsToDataArray();

            // reconstruct data and add result to map
            controller.renderUpdateReconstruction();
        });

    },

    formRowsToDataArray : function(){
        // turn all existing rows into a loopable array

        // A few jQuery helpers for exporting only
        jQuery.fn.pop = [].pop;
        jQuery.fn.shift = [].shift;

        var $TABLE = $('#table');
        var $rows = $TABLE.find('tr:not(:hidden)');
        var headers = ['id'];
        var data = [];

        // get the headers
        $($rows.shift()).find('th:not(:empty)').each(function () {
            // exclude unused information
            if($(this).text().toLowerCase() !== 'active') {
                headers.push($(this).text().toLowerCase());
            }
        });

        $rows.each(function () {
            var $td = $(this).find('td');
            var h = {};

            // use the headers from earlier to name hash keys
            headers.forEach(function (header, i) {
                if ($td.eq(i).attr('class') === 'index') {
                    h[header] = $td.eq(i).find('select').val();
                } else {
                    h[header] = $td.eq(i).text();
                }
            });
            data.push(h);
        });

        // store data in model
        controller.setEventFormData(data);

        // update all event ids model
        mapController.updateAllEvidsModel(data);

    },

    populateFormTable : function() {

        var tamboraEvents = mapController.getEventMarkerData();

        var rowNumber = controller.getTableRowNumber();

        tamboraEvents.forEach(function(event){

            rowNumber++;

            $('.table-add').click();
            var $row = $('.table tr:not(:hidden)');
            $row.find('.id').eq(rowNumber).text(event['event_id']);
            $row.find('.lat').eq(rowNumber).text(parseFloat(event['lat_info']).toFixed(2));
            $row.find('.lon').eq(rowNumber).text(parseFloat(event['lon_info']).toFixed(2));
            $row.find('.name').eq(rowNumber).val(event['location']);
            $row.find('.indexSel').eq(rowNumber).val(parseInt(event['idx']));
            $row.find('.event-active').eq(rowNumber).attr('checked',true);

            // disable tambora base data manipulation
            $row.find('.lat').eq(rowNumber).attr("contentEditable", true);
            $row.find('.lon').eq(rowNumber).attr("contentEditable", true);
            $row.find('.name').eq(rowNumber).attr('disabled',true);
            $row.find('.indexSel').eq(rowNumber).attr('disabled',true);
            $row.find('.event-active').eq(rowNumber).attr('disabled',false);
       //     $row.find('.table-remove').eq(rowNumber);

            // trigger map draw
            $row.find('.lon').eq(rowNumber).blur();

        });

        controller.setTableRowNumber(rowNumber);

    },

    addAutocomplete : function (){
        var self = this;
        $(".name")
            .geocomplete()
            .bind("geocode:result", function(event, result){
                $(this).val(result.name);
                var lat = result.geometry.location.lat().toFixed(2);
                var lon = result.geometry.location.lng().toFixed(2);
                $(this).parent().parent().find('.lat').html(lat);
                $(this).parent().parent().find('.lon').html(lon);

                var tdParent = $(this).parent().parent();
                var dataPoint = [];
                var row = $(this).parent().parent().children().index($(this).parent());
                dataPoint['id'] = row;
                tdParent.find("td").each(function(){
                    var className = $(this).attr('class');
                    if(className === 'index') dataPoint[className] = $(this).find('select').val();
                    else if(className === 'index-active') dataPoint[className] = $(this).find('.event-active').is(":checked");
                    else if(typeof className !== 'undefined') dataPoint[className] = $(this).html();
                });
                // draw circle marker on map
                evaluationMapView.addLiveCircleMarker(dataPoint);

            });

    },

    addOnchangeMap : function() {

        var self = this;

        // remove all previous set event handlers
        $('[contenteditable=true]')
            .off("focus", "**")
            .off("blur", "**");

        $('select')
            .off("focus", "**")
            .off("blur", "**");

        // Find all editable content.
        $('[contenteditable=true]')

            .focus(function () {
                $(this).data("initialText", $(this).html());
            })
            .blur(function () {
                if ($(this).data("initialText") !== $(this).html()) {

                    var tdParent = $(this).parent();
                    var dataPoint = [];
                    var row = $(this).parent().parent().children().index($(this).parent());
                    dataPoint['id'] = row;
                    tdParent.find("td").each(function () {
                        var className = $(this).attr('class');
                        if (className === 'index') dataPoint[className] = $(this).find('select').val();
                        else if(className === 'index-active') dataPoint[className] = $(this).find('.event-active').is(":checked");
                        else if (typeof className !== 'undefined') dataPoint[className] = $(this).html();
                    });

                    // draw circle marker on map
                    evaluationMapView.addLiveCircleMarker(dataPoint);
                }
            });

        // Find all editable content.
        $('.indexSel')
            .change(function () {

                var tdParent = $(this).parent().parent().parent();
                var dataPoint = [];
                var row = $(this).parent().parent().parent().children().index($(this).parent().parent());
                dataPoint['id'] = row;
                tdParent.find("td").each(function () {
                    var className = $(this).attr('class');
                    if(className === 'index-active') dataPoint[className] = $(this).find('.event-active').is(":checked");
                    else if (typeof className !== 'undefined') dataPoint[className] = $(this).html();

                });

                dataPoint['index'] = $(this).val();
                evaluationMapView.addLiveCircleMarker(dataPoint);
            });

        // onclick event for toggling events
        $('.event-active').unbind('click');
        $('.event-active').click(function(){
            var layerId = parseInt($(this).parent().parent().parent().find('.id').text());

            utils.updateEvidsSelected(layerId);

            evaluationMapView.toggleMarker(layerId);

            mapLayersView.updateMap();

            evaluationMapView.addMarkersToLayerModel();

        });
    },

    remapEventActiveClickBehaviour : function(){
        // onclick event for toggling events
        $('.event-active').unbind('click');
        $('.event-active').click(function(){
            var layerId = parseInt($(this).parent().parent().parent().find('.id').text());

            utils.updateEvidsSelected(layerId);

            evaluationMapView.toggleMarker(layerId);

            // remove unselected events from eventFormData
            var selEvids = mapController.getSelectedEventIds();
            // read all form data to data model
            controller.updateFormModelData();
            var formData = controller.getEventFormData();
            var newFormData = formData.filter(function(v,i){ return selEvids.some(elem => elem == v.id); });

            // store data in model
            controller.setEventFormData(newFormData);

            controller.renderUpdateReconstruction();

            evaluationMapView.addMarkersToLayerModel();

        });
    }

};

var evaluationMapView = {


    renderUpdateMapControls : function(){
        // remove map layer control
        mapController.removeMapControlByName('layerControl');

        // add map controls
        mapController.renderMapControls();

        this.addMarkersToLayerModel();
    },

    renderMarkers : function(){
        this.addMarkersToLayerModel();
        this.renderUpdateMapControls();
    },

    renderUpdateReconstruction : function(){

        mapController.removeMapLayerByName('temperatureMap');
        mapController.removeMapLayerByName('liveReconstruction');
        mapController.removeMapLayerByName('regressionMap');
        mapController.removeMapLayerByName('validationData');

        mapController.removeMapControlByName('layerControl');
        this.addReconstructedData();
        this.addReconstructedMetaInfo();
        this.updateSelectAfterReconstruct();

        // change events on active click to take new added events into account
        controller.remapOnSelectEvents();

    },

    updateSelectAfterReconstruct : function(){
        $('.event-active').attr('checked',true);
        var formData = controller.getEventFormData();
        var selEvids = mapController.getSelectedEventIds();
        formData.map(function(layer){
            // select all unselected markers
            if(!~selEvids.indexOf(parseInt(layer.id))){
                utils.updateEvidsSelected(parseInt(layer.id));
                evaluationMapView.toggleMarker(parseInt(layer.id));
            }
        });

        // enable all active controls on reconstructed data sets
        $('.event-active').attr('disabled',false);

    },

    addMarkersToLayerModel : function(){
        var markers = controller.getMarkers();

        // create and store markers in new layer group
        var evalMarkersGroup = new L.LayerGroup();
        var markerIds = Object.keys(markers);
        for(var i=0; i < markerIds.length; i++){
            markers[parseInt(markerIds[i])].addTo(evalMarkersGroup);
        }

        // save layer
        mapController.setMapLayerModel('evalMarkersGroup', evalMarkersGroup);

        // add layer to map
        mapController.getMapLayerModel('evalMarkersGroup').addTo(mapController.getMapObj());

    },

    addLiveCircleMarker : function(data){
        var lat = parseFloat(data['lat']);
        var lon = parseFloat(data['lon']);
        var idx = parseInt(data['index']);
        var id = parseInt(data['id']);
        var active = data['index-active'];

        this.removeMarker(id);

        var markerData = L.circleMarker([lat,lon], this.markerStyle(active, idx));

        controller.setMarker(id, markerData, idx);

        this.renderMarkers();
    },

    markerStyle : function(active, idx){
        // main marker style
        var markerStyle = {
            radius:6,
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }

        if(typeof idx !== 'undefined'){
            markerStyle['fillColor'] = controller.getMarkerColor(idx);
        }

        active ? markerStyle['color'] = "#000" : markerStyle['color'] = '#FFFFFF';

        return markerStyle;
    },

    removeMarker : function (id){

        var marker = controller.getMarker(id);
        if(typeof marker !== 'undefined'){
            mapController.getMapObj().removeLayer(marker);
            controller.removeMarkerFromModel(id);
        }
    },

    toggleMarker : function(id){
        var marker = controller.getMarker(id);
        if(typeof marker !== 'undefined'){
            if(!mapController.getSelectedEventIds().some(elem => elem == id)){
                // set marker style to inactive
                marker.setStyle(this.markerStyle(false))
            } else {
                // set marker style to active
                marker.setStyle(this.markerStyle(true))
            }
        }
    },

    addReconstructedData : function(){
        // project raster in global image bounds
        var imageBounds = mapController.getGlobalImageBounds();
        var reconHref = model.reconstructedDataHref();
        var map = mapController.getMapObj();

        var reconMapTemperature = $.getJSON(reconHref.extent,
            function(res){

                var dim = res.rasterExtent;

                // set view bounds
                var viewBounds = [[dim['ymax'], dim['xmax']], [dim['ymin'], dim['xmin']]];  //  ymax, xmax, ymin, xmin
                // var imageBounds = [[70,50],[30, -30]];  //  ymax, xmax, ymin, xmin

                // contour image has to be globel if created in query function!
                var liveReconstruction = L.imageOverlay(reconHref.data, imageBounds, {opacity:0.7});

                mapController.setMapLayerModel('liveReconstruction', liveReconstruction);

                // add layer to map
                mapController.getMapLayerModel('liveReconstruction').addTo(map);

                // set view to countor Image extent
                map.fitBounds(viewBounds);

                // set contour layer to background to not overlap event daat points
                mapController.getMapLayerModel('liveReconstruction').bringToBack();
            });

        mapController.setTemperatureAjax(reconMapTemperature);

    },

    addReconstructedRegressionData : function(){

        var regressionMap = L.imageOverlay(controller.getRegressionLayerHref(), mapController.getGlobalImageBounds(), {opacity:0.9});

        // save raster layer
        mapController.setMapLayerModel('regressionMap', regressionMap);
    },

    getMarkers : function(type){

        var ghcnmHref = controller.getGhcnmLayerHref();

        var ghcnmData = $.getJSON(ghcnmHref,
            function (response) {

                // check if view is available in db
                if (response['ghcnmData'] != '') {

                    // make geojson object from data
                    var geojson = GeoJSON.parse(response['ghcnmData'], {Point: ['lat', 'lon']});

                    // create station marker overlay
                    mapController.addCircleMarker(geojson, type);
                }
            }
        );

        mapController.setGhcnmAjax(ghcnmData);

    },

    addReconstructedMetaInfo : function(){
        var self = this;
        // load all data and wait till everything is done, than add controls
        $.when(mapController.getTemperatureAjax()).done(function (raster) {

            controller.setReconRasterMeta(raster)

            self.addReconstructedRegressionData();
            // add ghcnm station data
            self.getMarkers('validationData');

            $.when(mapController.getGhcnmAjax()).done(function (valiData) {
                self.renderMapFeatures([controller.getReconRasterMeta()], [valiData]);
            });

        });

    },

    renderMapFeatures : function(rasterMinMax, valiData){

        var appSettings = mapController.getAppSettings();

        // register temperature range
        mapController.setTemperatureRange(rasterMinMax);

        // add legends for event view
        legends.renderEventViewLegends();

        if(appSettings.statistics) {

            //register inline mean station offset
            statisticsController.setMeanGhcnmOff(valiData[0]['meanGhcnmOff']);

            // add controls
            mapController.removeMapControlByName('layerControl');
            mapController.renderMapControls();
        }

        // add simple inline stats x events at x diffrent locations
        if (!appSettings.statistics && appSettings.inlineStats){
            addInlineStatistics(controller.getEventFormData());
        }

        // show and update cru and ghcnm inline stats
        if(appSettings.statistics && appSettings.inlineStats){
            evaluationTextStats(controller.getEventFormData());
            statisticsController.renderUpdate();

        }

        // re-enable select meanu:
        utils.enableMenu();

    },


}


var controller = {

    init : function() {
        formView.init();
        model.init();


    },

    render : function() {
        this.resetModel();
        formView.render();
    },

    resetModel : function(){
        model.marker = [];
        model.tableRowNumber = -1;
        // remove all entries from form exclude header
        $('#reconstructor-form tr:visible').slice(1).detach();
    },

    setYearMonth : function(year, month){
        model.year = year;
        model.month = (month -1);
    },

    getYearMonth : function(){
        return {
            year: model.year,
            month: model.month
        };
    },

    getMarker : function(id) {
        return model.marker[id];
    },

    getMarkers : function() {
        return model.marker;
    },

    setMarker : function(id, data) {
        model.marker[id] = data;
    },

    removeMarkerFromModel : function(id){
        delete model.marker[id];
    },

    getTableRowNumber : function() {
        return model.tableRowNumber;
    },

    setTableRowNumber : function(num) {
        model.tableRowNumber = num;
    },

    // this functions waitrs till a variable is found and than executes the callback
    waitForElement : function(element, time, callback){
        if(typeof element !== "undefined"){
            callback();
        } else{
            setTimeout(function(){
                this.waitForElement(element, time, callback);
            },time);
        }
    },

    /*
     tamboraPopulateTable : function(){
     formView.populateFormTable(mapIndexData)
     },


     loadTamboraEvents : function() {
     var self = this;
     setTimeout(function () {
     self.waitForElement(mapIndexData, 250, self.tamboraPopulateTable);
     }, 250);
     },
     */

    setDropdownData : function(){
        // for reconstructer year month dropdown selects
        var reconSelect = [];
        for (century in phpTilesData) {
            for (decade in phpTilesData[century]) {
                for (year in phpTilesData[century][decade]) {
                    if (year !== 'count') {
                        reconSelect[year] = phpTilesData[century][decade][year];
                    }
                }
            }
        }
        model.selectData = reconSelect;
    },

    getMarkerColor : function(idx) {
        return model.markerColors[idx];
    },

    setEventFormData : function(fData){
        model.eventFormData = fData;
    },

    getEventFormData : function(){
        return model.eventFormData;
    },

    renderUpdateReconstruction : function(){
        evaluationMapView.renderUpdateReconstruction();
    },

    getRegressionLayerHref : function(){
        return model.getRegressionLayerHref();
    },

    getGhcnmLayerHref : function(){
        return model.getGhcnmLayerHref();
    },

    setReconRasterMeta : function(meta){
        model.reconstructedTMeta = meta;
    },

    getReconRasterMeta : function(meta){
        return model.reconstructedTMeta;
    },

    remapOnSelectEvents : function() {
        formView.remapEventActiveClickBehaviour();
    },

    updateFormModelData : function(){
        formView.formRowsToDataArray();
    }



    /*
     setEventIdsArray : function(allEventIds){
     model.allEventIds = allEventIds;
     model.selectedEventIds = allEventIds;
     },

     getSelectedEventIds : function(){
     return model.selectedEventIds;
     },
     */

}

/**
 * utils functions
 */




/*


 //#####################################################################################################################
 $(document).ready(function() {


 var selMonth = $('#monthSel').val();
 var loc = window.location.pathname;
 var dir = loc.substring(0, loc.lastIndexOf('/'));
 console.log(dir+'/validator.php?tableData='+JSON.stringify(data)+'&month='+selMonth)
 $.getJSON(dir+'/validator.php?tableData='+JSON.stringify(data)+'&month='+selMonth,
 function(dim){

 var imageUrl = '/regmod/validator.php?month='+selMonth;

 // place map like corner coordinates
 var viewBounds = imageBounds = [[dim['ymax'], dim['xmax']], [dim['ymin'], dim['xmin']]];  //  ymax, xmax, ymin, xmin
 // var imageBounds = [[70,50],[30, -30]];  //  ymax, xmax, ymin, xmin

 // contour image has to be globel if created in query function!
 contourImage = L.imageOverlay(imageUrl, imageBounds, {opacity:0.7});
 contourImage.addTo(map);

 // set view to countor Image extent
 map.fitBounds(viewBounds);

 // set contour layer to background to not overlap event daat points
 contourImage.bringToBack()
 });
 })
 });

 //#####################################################################################################################

 $(function () {
 addOnchangeMap();
 addAutocomplete();
 });

 //#####################################################################################################################


 */















