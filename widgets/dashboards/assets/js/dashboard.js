var dashboardModel = {

    offByIndexYiiDom : '#dashboardWidget-content',
    offByIndexHref : "",

    // jquery dom referneces of the yii data routes to urls
    parseYiiDomDataRoutes : function() {
        this.offByIndexHref = $(this.offByIndexYiiDom).attr('data-url');
    },

    offByStationHref : function(){
        return this.offByIndexHref + '?mode=station_data';
    },

    plotsData : {

        cruByIdx : {
            config: {
                domId: 'cruByIdx',
                title: 'mean difference by indice compared to reanalysis data',
                labelX: 'thermal indice',
                labelY: 'difference Celsius',
                scatterRadius :4
            },
        },
        offByStation : {
            statByIdx: {
                config: {
                    domId: 'statByIdx',
                    title: 'mean difference by indice compared to reanalysis data',
                    labelX: 'thermal indice',
                    labelY: 'difference Celsius',
                    scatterRadius :3
                },
            },
            statByLoc: {
                config: {
                    domId: 'statByLoc',
                    title: 'mean difference by indice compared to reanalysis data',
                    labelX: 'location',
                    labelY: 'difference Celsius',
                    scatterRadius :2
                },
            },
            statByMonth: {
                config: {
                    domId: 'statByMonth',
                    title: 'mean difference by indice compared to reanalysis data',
                    labelX: 'month',
                    labelY: 'difference Celsius',
                    scatterRadius :2
                },
            },
            tooltipMeta: {},
        }

    },

    getPlotsData : function(type){
        if(type === 'cruByIdx'){
            return this.plotsData[type];
        } else {
            var plotData = this.plotsData['offByStation'][type];

            // add metadata
            plotData['plots']['tooltipMeta'] = this.plotsData['offByStation']['tooltipMeta'];

            return plotData;
        }
    },

    monthNames : ['NONE','January','February','March','April','May','June','July','August','September','October','November','December'],

    highchartsPlots : [],

    lastSelectedIndexInStationsPlots : '',
}


var dashboardPlotsView = {

    renderOffByIndexBoxplot : function(){

        $.getJSON(dashboardController.getOffByIndexHref(), null,
            function(res){

                // update plot Model data
                dashboardController.setPlotDataForIndex('cruByIdx', res);

                // render statistics sidbar text
                dashboardStatistics.renderTextStatistics('cruByIdx');

                // create boxplot
                boxplot.createBoxplot('cruByIdx');

                // highlight markers for current year month view
                boxplot.highlightCurrentMarkers('cruByIdx');

            }
        )
    },

    renderOffByStationBoxplot : function(){

        if(typeof plotData === 'undefined'){
            $.getJSON(dashboardController.getOffByStationHref(), null,
                function (res) {

                    // update plot Model data
                    dashboardController.setPlotDataForStation('offByStation', res);

                    // TODO: code this
                    // render statistics sidbar text
//                dashboardStatistics.renderTextStatistics('offByIndex');

                    // create boxplots
                    var byIdxPlot = boxplot.createBoxplot('statByIdx');

                    // save highcharts plot object
                    dashboardController.setHighchartsPlotObj('statByIdx', byIdxPlot);

                    boxplot.highlightCurrentMarkers('statByIdx');

                    var byMonth = boxplot.createBoxplot('statByMonth');

                    // save highcharts plot object
                    dashboardController.setHighchartsPlotObj('statByMonth', byMonth);

                    boxplot.highlightCurrentMarkers('statByMonth');

                    var byloc =  boxplot.createBoxplot('statByLoc');

                    // save highcharts plot object
                    dashboardController.setHighchartsPlotObj('statByLoc', byloc);

                    boxplot.highlightCurrentMarkers('statByLoc');

                    // TODO: change this for dynamic height
                    $('.footer').appendTo('#statByLoc');
                    //byloc.setSize($('#statByLoc').width(),330)

                }
            );
        }
    },


}


var dashboardStatistics = {

    renderTextStatistics : function(type){

        var stats = dashboardController.getPlotStatsByName(type);

        var avgIndex = stats['avgIndex'];
        $('#avg-n3').text(avgIndex[-3]);
        $('#avg-n2').text(avgIndex[-2]);
        $('#avg-n1').text(avgIndex[-1]);
        $('#avg-p1').text(avgIndex[1]);
        $('#avg-p2').text(avgIndex[2]);
        $('#avg-p3').text(avgIndex[3]);

        var avgRange = stats['avgSignedIndex'];
        $('#range-minn').text(avgRange['negative'][0]);
        $('#range-maxn').text(avgRange['negative'][1]);
        $('#range-minp').text(avgRange['positive'][0]);
        $('#range-maxp').text(avgRange['positive'][1]);
    }
}

var boxplot = {

    createBoxplot : function(type) {

        var plotData = dashboardController.getPlotDataByName(type);
        var boxplotData = this.formatBoxplotData(plotData.plots.boxplot);
        var scatter = plotData.plots.scatterplot;
        var tooltipMeta = plotData.plots.tooltipMeta;
        var config = plotData.config;
        var self = this;

        // scatterplot definition
        var options = {

            chart: {
                renderTo: config.domId,
                type: 'boxplot',
                zoomType: 'xy'
            },

            title: {
                text: config.title
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: config.labelX
                },
                endOnTick: true,
                showLastLabel: true,
                type: "category",
            },
            yAxis: {
                title: {
                    text: config.labelY
                }
            },
            legend: {
                enabled: false
            },
            tooltip: {
                shared: false,
                useHTML: true,
                padding: 0,
                formatter: function () {
                    if (this.series.name === 'Series 1') {
                        var data = this.point;
                        return '<em><b>Group: ' + data.category + '</b></em>'
                            + '<br> Maximum: ' + data.high
                            + '<br> Upper quartile: ' + data.q3
                            + '<br> Median: ' + data.median
                            + '<br> Lower quartile: ' + data.q1
                            + '<br> Minimum: ' + data.low;

                    } else if(this.series.name === 'cruByIdx'){

                        if (typeof this.point.index !== 'undefined') {
                            var data = tooltipMeta[this.point.index];
                            boxplot.highlightCurrentMarkers(type);
                            return '<em><b>Thermal Indice: ' + this.x + '</b></em>'
                                + '<br> Location: ' + data.location
                                + '<br> Date: ' + dashboardController.getMonthNameByNumber(data.month) + " " + data.year
                                + '<br> Mean Reanalysis: ' + parseFloat(data.cruMean).toFixed(2) + "&deg;C"
                                + '<br> Mean Event: ' + parseFloat(data.eventMean).toFixed(2) + "&deg;C"
                                + '<br> Differnece: ' + parseFloat(this.y).toFixed(2) + "&deg;C";

                        }
                    }else {

                        if (typeof this.point.index !== 'undefined') {
                            var data = tooltipMeta[this.point.index];
                            boxplot.highlightCurrentMarkers(type);
                            console.log(data)
                            self.highlightSelectedMarkerInRelartedPlots(type, this.point.index);
                            return '<em><b>Group: ' + this.x + '</b></em>'
                                + '<br> Location: ' + data.location
                                + '<br> Date: ' + dashboardController.getMonthNameByNumber(data.month) + " " + data.year
                                + '<br> Index: ' + data.index
                                + '<br> GHCNM: ' + parseFloat(data.TGhcnm).toFixed(2) + "&deg;C"
                                + '<br> Event: ' + parseFloat(data.TEvent).toFixed(2) + "&deg;C"
                                + '<br> Differnece: ' + parseFloat(this.y).toFixed(2) + "&deg;C";
                        }
                    }
                }
            },

            series: [
                {
                    // name: dclass,
                    // ['low', 'q1', 'median', 'q3', 'high']
                    data: boxplotData,
                    color: 'rgba(0, 0, 0, .5)',
                    tooltip: {
                        headerFormat: config.tooltipHeaderBoxp
                    }
                }, {
                    name: type,
                    color: Highcharts.getOptions().colors[0],
                    type: 'scatter',
                    data: scatter,
                    marker: {
                        fillColor: 'white',
                        lineWidth: 1,
                        radius: config.scatterRadius,
                        lineColor: Highcharts.getOptions().colors[0]
                    }

                }],

        }

        if(type === 'statByMonth'){
            options.xAxis['categories'] = ['Null','Jan','Feb','Mar','Apr','Mai','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        }
        if(type === 'statByLoc'){
            options.xAxis['categories'] = plotData.plots.locationLookUp;
        }

        return new Highcharts.Chart(options);

    },

    formatBoxplotData : function(boxplot){
        var boxplotHighcharts = [];
        for(var key in boxplot){
            var elem = boxplot[key];
            boxplotHighcharts.push([parseInt(key), elem.min, elem.q1, elem.median, elem.q3, elem.max]);
        }

        return boxplotHighcharts;
    },

    highlightSelectedMarkerInRelartedPlots : function(type, index){
        var lastIndex = dashboardController.getLastSelectedIndex();
        var hcPlots = dashboardController.getHighchartsPlotObjs();
        var hcNames = Object.keys(hcPlots);
        for(var i = 0; i < hcNames.length; i++){
            var plot = hcNames[i];
            if(lastIndex){
                hcPlots[plot].series[1].data[lastIndex].graphic.attr({ fill: 'white' });
                // set circle line color to black
                hcPlots[plot].series[1].data[lastIndex].graphic.attr({ stroke: '#7cb5ec' });
                // change tooltip border color to red
                hcPlots[plot].series[1].points[lastIndex].color = '#7cb5ec';

            }

            hcPlots[plot].series[1].data[index].select();

            // set fill color to red
            hcPlots[plot].series[1].data[index].graphic.attr({ fill: '#FF0000' });
            // set circle line color to black
            hcPlots[plot].series[1].data[index].graphic.attr({ stroke: '#000000' });
            // change tooltip border color to red
            hcPlots[plot].series[1].points[index].color = '#FF0000';

            hcPlots[plot].series[1].data[index].graphic.toFront();
            hcPlots[plot].series[1].points[index].graphic.toFront();

        }
        dashboardController.setLastSelectedIndex(index);

    },

    highlightCurrentMarkers : function(type){

        // get lookup table
        var tooltipMeta = dashboardController.getPlotMetaByName(type);

        // get config
        var config = dashboardController.getPlotConfigByName(type);

        // get index of current events from meta lookup table
        var idxArray = dashboardUtils.getIndexOfEvents(tooltipMeta);

        // get chart object
        var chart = $('#'+config.domId).highcharts();

        idxArray.forEach(function(index){
            // set fill color to red
            chart.series[1].data[index].graphic.attr({ fill: '#FF0000' });
            // set circle line color to black
            chart.series[1].data[index].graphic.attr({ stroke: '#000000' });
            // change tooltip border color to red
            chart.series[1].points[index].color = '#FF0000';
            // put marker ontop
            chart.series[1].data[index].graphic.toFront();
            // preserveing of highlight after mouseover is hacked directly into render tooltip methos
            // TODO: find better method

        })
    }

}



var dashboardController = {

    init : function(){
        dashboardModel.parseYiiDomDataRoutes();
        dashboardMenuView.addDashbordMenu();
    },

    renderOffByIndex : function(){
        dashboardPlotsView.renderOffByIndexBoxplot();
    },

    renderOffByStation : function(){
        dashboardPlotsView.renderOffByStationBoxplot();
    },

    getOffByIndexHref : function(){
        return dashboardModel.offByIndexHref;
    },

    getMonthNameByNumber : function(month){
        return dashboardModel.monthNames[month];
    },

    setPlotDataForIndex : function(name, data){
        Object.keys(data).forEach(function(key){
            dashboardModel.plotsData[name][key] = data[key];
        });
    },

    setPlotDataForStation : function(name, data){
        Object.keys(data).forEach(function(type){
            if(Object.keys(data[type])[0] === 'plots'){
                dashboardModel.plotsData[name][type]['plots'] = data[type]['plots'];
            } else {
                dashboardModel.plotsData[name][type] = data[type];
            }
        });
    },

    getPlotDataByName : function(plotName){
        return dashboardModel.getPlotsData(plotName);
    },

    getPlotStatsByName : function(plotName){
        return dashboardModel.getPlotsData(plotName)['stats'];
    },

    getPlotConfigByName : function(plotName) {
        return dashboardModel.getPlotsData(plotName)['config'];
    },

    getPlotMetaByName : function(plotName){
        return dashboardModel.getPlotsData(plotName)['plots']['tooltipMeta'];
    },

    getOffByStationHref : function(){
        return dashboardModel.offByStationHref();
    },

    setHighchartsPlotObj : function(name, obj){
        dashboardModel.highchartsPlots[name] = obj;
    },

    getHighchartsPlotObjs : function(){
        return dashboardModel.highchartsPlots;
    },

    setLastSelectedIndex : function(index){
        dashboardModel.lastSelectedIndexInStationsPlots = index;
    },

    getLastSelectedIndex : function(){
        return dashboardModel.lastSelectedIndexInStationsPlots;
    },

}

var dashboardMenuView = {

    addDashbordMenu : function(){

        // add dashboard menu functionality
        $('#dashboard').hide();
        $('#dash-menu').hide();

        $('.navi li a').click(function() {

            if($(this).parent().attr('class') == 'dashboard'){
                $('.offsetByIndex a').click();
            } else if ($(this).parent().attr('class') == 'offsetByStation') {
                $('.dashboard a').first().attr('class','active');
                $('#advancedSelect').hide();
                $('#timeline').hide();
                $('#map').hide();

                dashboardController.renderOffByStation();

                $('#dashboard').show();
                $('#dash-menu').show();
                $('#statByIdx').show();
                $('#statByMonth').show();
                $('#statByLoc').show();
                $('#cruByIdx').hide();
                // toggle text
                $('.byStation-text').show();
                $('.byEvents-text').hide();

            } else if ($(this).parent().attr('class') == 'offsetByIndex') {
                $('.dashboard a').first().attr('class','active');
                $('#advancedSelect').hide();
                $('#timeline').hide();
                $('#map').hide();

                // addCruByIdx();
                dashboardController.renderOffByIndex();
                $('#dashboard').show();
                $('#dash-menu').show();
                $('#cruByIdx').show();
                $('#statByIdx').hide();
                $('#statByMonth').hide();
                $('#statByLoc').hide();
                // toggle text
                $('.byStation-text').hide();
                $('.byEvents-text').show();

            } else {
                $('#dashboard').hide();
                $('#dash-menu').hide();
            }
        });

    }

}

var dashboardUtils = {

    getIndexOfEvents : function(array){
        var year = mapController.getSelectedYear();
        var month = mapController.getSelectedMonth();
        var indices = [];

        for(var i = 0; i < array.length; i++) {
            if(array[i].year === year && array[i].month === month) {
                indices.push(i);
            }
        }
        return indices;
    }

}


$(function(){

    dashboardController.init();

});




























<!-- scatterplot Base function -->
function scatterPlot(data,dclass,xAxLab, evidLookUp, locNameLU){

    // scatterplot tooltip function
    var oldidx = 0;
    function blubbel(parent, idx){
        if(oldidx != idx){
            if(parent == 'statByIdx'){
                if(oldidx != 0){
                    var point = statByMonthChart.series[0].data[oldidx];
                    point.select();
                    var point = statByLocChart.series[0].data[oldidx];
                    point.select();
                }
                var point = statByMonthChart.series[0].data[idx];
                point.select();
                point.graphic.toFront();
                var point = statByLocChart.series[0].data[idx];
                point.select();
                point.graphic.toFront();
            } else if(parent == 'statByMonth'){
                if(oldidx != 0){
                    var point = statByLocChart.series[0].data[oldidx];
                    point.select();
                    var point = statByIdxChart.series[0].data[oldidx];
                    point.select();
                }
                var point = statByLocChart.series[0].data[idx];
                point.select();
                point.graphic.toFront();
                var point = statByIdxChart.series[0].data[idx];
                point.select();
                point.graphic.toFront();
            } else if(parent == 'statByLoc'){
                if(oldidx != 0){
                    var point = statByMonthChart.series[0].data[oldidx];
                    point.select();
                    var point = statByIdxChart.series[0].data[oldidx];
                    point.select();
                }
                var point = statByMonthChart.series[0].data[idx];
                point.select();
                point.graphic.toFront();
                var point = statByIdxChart.series[0].data[idx];
                point.select();
                point.graphic.toFront();
            }
        }
        oldidx = idx;
    };

    // scatterplot definition
    var chart;
    var options = {
        chart: {
            renderTo: dclass,
            type: 'scatter',
            zoomType: 'xy'
        },
        title: {
            text: dclass
        },
        xAxis: {
            title: {
                enabled: true,
                text: xAxLab
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            type: "category"
        },
        yAxis: {
            title: {
                text: 'offset Celsius'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            useHTML: true,
            padding: 0,
            formatter: function () {
                if (dclass != 'cruByIdx') {
                    var chart = this.series.chart,
                        index = this.y;
                    if (typeof this.point.index !== 'undefined') {
                        blubbel(dclass, this.point.index);
                    }
                    if (dclass != 'statByLoc') {
                        this.point.graphic.toFront();
                        return 'X: ' + this.x.toFixed(2) + '<br/>offset<i></i>: ' + this.y.toFixed(2) + '<br/>evid: ' + evidLookUp[this.point.index];
                    } else {
                        return 'location: ' + this.x + '<br/>offset: ' + this.y.toFixed(2) + '<br/>evid: ' + evidLookUp[this.point.index];
                    }

                } else {
                    return false;
                }
            }
        },
        plotOptions: {
            /* spline: {
             turboThreshold: 999999
             },*/
            scatter: {
                marker: {
                    radius: 4,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                }
            }
        },
        series:[{
            name: dclass,
            color: 'rgba(0, 0, 0, .5)',
            data: data
        }]
    };

    if(dclass == 'statByLoc'){
        options.plotOptions.scatter.marker.radius = 3;
    }

    chart = new Highcharts.Chart(options);

    if(dclass == 'statByLoc'){
        chart.xAxis[0].setCategories(locNameLU);
    }

    return chart;
}


function boxplot(data, dclass, xAxLab,scatter) {

    // scatterplot definition
    var chart;
    var options = {

        chart: {
            renderTo: dclass,
            type: 'boxplot',
            zoomType: 'xy'
        },

        title: {
            text: dclass
        },
        xAxis: {
            title: {
                enabled: true,
                text: xAxLab
            },
            endOnTick: true,
            showLastLabel: true,
            type: "category",
            categories : ['-3','-2','-1','0','1','2','3']

        },
        yAxis: {
            title: {
                text: 'offset Celsius'
            }
        },
        legend: {
            enabled: false
        },

        series: [
            {
                name: dclass,
                // ['low', 'q1', 'median', 'q3', 'high']
                data: [
                    [-3, data[-3].min, data[-3].q1, data[-3].median, data[-3].q3, data[-3].max],
                    [-2, data[-2].min, data[-2].q1, data[-2].median, data[-2].q3, data[-2].max],
                    [-1, data[-1].min, data[-1].q1, data[-1].median, data[-1].q3, data[-1].max],
                    [0, data[0].min, data[0].q1, data[0].median, data[0].q3, data[0].max],
                    [1, data[1].min, data[1].q1, data[1].median, data[1].q3, data[1].max],
                    [2, data[2].min, data[2].q1, data[2].median, data[2].q3, data[2].max],
                    [3, data[3].min, data[3].q1, data[3].median, data[3].q3, data[3].max]
                ],
                color: 'rgba(0, 0, 0, .5)',
                tooltip: {
                    headerFormat: '<em>Thermal Indice: {point.key}</em><br/>'
                }
            },{
                name: 'Event',
                color: Highcharts.getOptions().colors[0],
                type: 'scatter',
                data: scatter,
                marker: {
                    fillColor: 'white',
                    lineWidth: 1,
                    lineColor: Highcharts.getOptions().colors[0]
                },
                tooltip: {
                    pointFormat: 'Observation: {point.y}'
                }
            }]
    };

    function scatterTooltip() {
        if (dclass != 'cruByIdx') {
            var chart = this.series.chart,
                index = this.y;
            if (typeof this.point.index !== 'undefined') {
                blubbel(dclass, this.point.index);
            }
            if (dclass != 'statByLoc') {
                this.point.graphic.toFront();
                return 'X: ' + this.x.toFixed(2) + '<br/>offset<i></i>: ' + this.y.toFixed(2) + '<br/>evid: ' + evidLookUp[this.point.index];
            } else {
                return 'location: ' + this.x + '<br/>offset: ' + this.y.toFixed(2) + '<br/>evid: ' + evidLookUp[this.point.index];
            }

        } else {
            return false;
        }
    }


    return new Highcharts.Chart(options);

}



function textStatistics(stats){
    console.log(stats)
    var avgIndex = stats['avgIndex'];
    $('#avg-n3').text(avgIndex[-3]);
    $('#avg-n2').text(avgIndex[-2]);
    $('#avg-n1').text(avgIndex[-1]);
    $('#avg-p1').text(avgIndex[1]);
    $('#avg-p2').text(avgIndex[2]);
    $('#avg-p3').text(avgIndex[3]);

    var avgRange = stats['avgSignedIndex'];
    $('#range-minn').text(avgRange['negative'][0]);
    $('#range-maxn').text(avgRange['negative'][1]);
    $('#range-minp').text(avgRange['positive'][0]);
    $('#range-maxp').text(avgRange['positive'][1]);
}

<!-- INIT CHARTS -->

<!-- crufByIdx -->
function addCruByIdx(){
    var dashboardData = $('#dashboardWidget-content').attr('data-url');
    $.getJSON(dashboardData, null,
        function(res){
            textStatistics(res['stats']);
            boxplot(res['plots']['boxplot'],'cruByIdx','index value', res['plots']['scatterplot']);
            //      scatterPlot(res['plots']['scatterplot'],'cruByIdx','index value');
        }
    );
}


