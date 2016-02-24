$(function(){
    //if(mapController.getAppSettings().timeline){
    if(mapModel.showTimeline){
        // get timeline data
        var timelineHref = $('#timelineData-content').attr('data-url');
        // get Timeline Data and preselect (brush) century
        $.getJSON(timelineHref,
            function(res){
                // register default timeline data e.g. for rerendering 
                // of timeline for select by region
                defaultTimelineData = res;
                drawBarPlot(res, 0, function(){
                    drawBrush(1000, 1899);
                });
            });
    }
});

function drawBarPlot(timelineData, barWidth){

    // make deep copy for reusable data
    data = deepCopy(timelineData);

    // get window height to scale timeline appropriate
    var chartHeight = 25;
    var chartWidth = 320;

    // scale timeline
    var height = $(window).height();
    chartHeight = (height/100) * chartHeight;

    var height = (chartHeight/4)*3,
        margin2 = {top: height+35, right: 10, bottom: 40, left: 35},
        width = chartWidth,
        height2 = chartHeight/4,
        margin = {top: 10, right: 10, bottom:height2+55 , left: 35};

    if(barWidth === 0){
        var svg = d3.select("#timeline").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
    } else {
        var svg = d3.select(".twoThird").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
    }


    // line color
    var color = "#525252";

    // define axis
    var x = d3.time.scale().range([0, width]),
        x2 = d3.time.scale().range([0, width]),
        y = d3.scale.linear().range([height, 0]),
        y2 = d3.scale.linear().range([height2, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom"),
        xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
        yAxis = d3.svg.axis().scale(y).orient("left");

    var brush = d3.svg.brush()
        .x(x2)
        .on("brush", brushed)
        .on("brushend", brushend);

    var area = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return x(d.date); })
        .y0(height)
        .y1(function(d) { return y(d.mean); });

    var area2 = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return x2(d.date); })
        .y0(height2)
        .y1(function(d) { return y2(d.mean); });

    // define data lines
    var line = line2 = d3.svg.line()
        .interpolate("linear")
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.mean); });

    var line2 = d3.svg.line()
        .interpolate("linear")
        .x(function(d) { return x2(d.date); })
        .y(function(d) { return y2(d.mean); });

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    var parseDate = d3.time.format("%Y-%m-%d").parse;

    data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.mean = d.mean;
    });

    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(date.getDate() + days);
        return result;
    }

    // set offset for axies
    var paddingX = [-3650,3650];  // 10 years
    var paddingY = [5,5];   // 5 degree
    var extentX = d3.extent(data.map(function(d) { return d.date; }))
    var extentY = d3.extent(data, function(d) { return d.mean; });
    extentY[0] = extentY[0]-paddingY[0]
    extentY[1] = extentY[1]+paddingY[1]
    extentX[1]=addDays(extentX[1],paddingX[1])
    extentX[0]=addDays(extentX[0],paddingX[0])

    // define axis extent
    x.domain(extentX);
    y.domain(extentY);
    x2.domain(extentX);
    y2.domain(extentY);

    // show datapoints top
    var dot = focus.append('g')
    dot.attr("clip-path", "url(#clip)");
    dot.selectAll(".dots")
        .data(data)
        .enter()
        .append("circle")
        .attr('class','dots')
        .attr("r", 2.0)
        .style("fill", "#fff8ee")
        .style("opacity", .8)      // set the element opacity
        .style("stroke", "#000000")    // set the line colour
        .style("stroke-width", 1.5)
        .attr("cx", function(d) { return x(d.date) })
        .attr("cy", function(d) { return y(d.mean) })

    // show datapoints bottom 
    var dot1 = svg.append('g').attr('class','dots1').selectAll(".dots1")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", 1.0)
        .style("fill", "#fff8ee")
        .style("opacity", .8)      // set the element opacity
        .style("stroke", "#000000")    // set the line colour
        .style("stroke-width", 0.5)
        .attr("cx", function(d) { return x2(d.date) })
        .attr("cy", function(d) { return y2(d.mean) })

    svg.select(".dots1")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    var monthArr = new Array('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');

    // add tipsy tooltips
    $('svg circle').tipsy({
        gravity: 'w',
        html: true,

        title: function() {
            return this.__data__.date.getUTCFullYear() +' '+monthArr[this.__data__.date.getMonth()];
        }
    });

    focus.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("stroke", color)
        .attr("d", line);

    focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    focus.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("\u00B0C");

    context.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("stroke", color)
        .attr("d", line2);

    context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", height2 + 7);

    // Statistic lines and labels
    var statisticData = calcMeanSdVar(data);
    var meanData = [{date: data[0].date, mean: statisticData.mean},
        {date: data[data.length - 1].date, mean: statisticData.mean}];

    var lineStatistic = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.mean); });

    focus.append('path')
        .datum(meanData)
        .attr("class", "meanline")
        .attr("d", lineStatistic );

    focus.append("text")
        .attr("x", 10)
        .attr("y", height - margin.top)
        .attr("dy", ".35em")
        .attr("class", "meanline-label")
        .text("Mean: " + statisticData.mean.toFixed(2) );

    var sdMinData = [{date: data[0].date, mean: statisticData.mean - statisticData.deviation},
        {date: data[data.length - 1].date, mean: statisticData.mean - statisticData.deviation}];

    focus.append('path')
        .datum(sdMinData)
        .attr("class", "sdline min")
        .attr("d", lineStatistic );

    var sdMaxData = [{date: data[0].date, mean: statisticData.mean + statisticData.deviation},
        {date: data[data.length - 1].date, mean: statisticData.mean + statisticData.deviation}];

    focus.append('path')
        .datum(sdMaxData)
        .attr("class", "sdline max")
        .attr("d", lineStatistic );

    focus.append("text")
        .attr("x", (width/4)+55)
        .attr("y", height - margin.top)
        .attr("dy", ".35em")
        .attr("class", "sdline-label")
        .text("Std.: " + statisticData.deviation.toFixed(2) );

    // More statistic labels
    focus.append("text")
        .attr("x", ((width/3)*2)+40)
        .attr("y", height - margin.top)
        .attr("dy", ".35em")
        .attr("class", "count-label")
    //.text("Count: " + eventCount );

    function drawBrush(start, end) {
        // our year will this.innerText
        // define our brush extent to be begin and end of the year

        if(end){
            brush.extent([new Date(start + '-01-01'), new Date(end + '-12-31')])
        } else {
            brush.extent(start)
        }

        // draw the brush to match extent
        brush(d3.select(".brush").transition());

        // fire the brushstart, brushmove, and brushend events
        brush.event(d3.select(".brush").transition())
    }

    // scale timeline according to selected decade or century from select menu 
    var century = 0;
    $(document).on('click', '#decade', function() {
        var startYear = parseInt($("#decade #tiles td[class*='clickSel']").attr('title'));

        if(century != startYear){
            var endYear = startYear + 10;
            drawBrush(startYear, endYear);
            century = startYear;
            decade = 0
        }
    });
    var decade = 0;
    $(document).on('click', '#century', function() {
        var startYear = parseInt($("#century #tiles td[class*='clickSel']").attr('title'));
        if(decade != startYear){
            var endYear = startYear + 99;
            drawBrush(startYear, endYear);
            decade = startYear;
            century = 0
        }
    });


    function brushend() {
        var extent = brush.extent();

        // update coverage headmap for selected timeframe
        coverageController.renderUpdateCoverageHeatmap();

        // Retrieve brushed data
        var extentData = data.filter(function(d) { return extent[0] <= d.date && d.date <= extent[1] });

        // calc statistics for brushed region
        statisticData = calcMeanSdVar(extentData);

        // set mean for brushed region
        meanData = [{date: extentData[0].date, mean: statisticData.mean},
            {date: extentData[extentData.length - 1].date, mean: statisticData.mean}];
        focus.select(".meanline").data([meanData]).attr("d", lineStatistic);
        focus.select(".meanline-label").text("Mean: " + statisticData.mean.toFixed(2)+'\u00B0C ' );

        // set std lable from brushed region
        focus.select(".sdline-label").text("Std.: " + statisticData.deviation.toFixed(2)+'\u00B0C' );

        // get number of events in brush
        eventCount = extentData.length;

        // set count lable for brushed region
        focus.select(".count-label").text("Count: " + eventCount );

        /*
         // set max for brushed region
         var sdMaxData = [{date: extentData[0].date, mean: statisticData.mean + statisticData.deviation},
         {date: extentData[extentData.length - 1].date, mean: statisticData.mean + statisticData.deviation}];
         focus.select(".max").data([sdMaxData]).attr("d", lineStatistic);

         // set min lable for brushed region
         var sdMinData = [{date: extentData[0].date, mean: statisticData.mean - statisticData.deviation},
         {date: extentData[extentData.length - 1].date, mean: statisticData.mean - statisticData.deviation}];
         focus.select(".min").data([sdMinData]).attr("d", lineStatistic);
         */
    }


    function calcMeanSdVar(values) {
        var r = {mean: 0, variance: 0, deviation: 0}, t = values.length;
        for(var m, s = 0, l = t; l--; s += parseInt(values[l].mean));
        for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(parseInt(values[l].mean) - m, 2));
        return r.deviation = Math.sqrt(r.variance = s / t), r;
    }

    function brushed() {
        // add coverage time based selection based on brushed timeline section
        coverageController.filterByTimeframe(brush.extent());

        x.domain(brush.empty() ? x2.domain() : brush.extent());
        focus.select(".area").attr("d", area);
        focus.select(".line").attr("d", line);
        focus.select(".x.axis").call(xAxis);
        dot.selectAll(".dots").attr("cx",function(d){ return x(d.date);}).attr("cy", function(d){ return y(d.mean);});
    }

    // bring all circles in top plot to front
    var circles = d3.selectAll('circle.dots');
    circles.each(function () {
        this.parentNode.parentNode.appendChild(this.parentNode);
    })

    // default brush position
    drawBrush(x.domain());

}