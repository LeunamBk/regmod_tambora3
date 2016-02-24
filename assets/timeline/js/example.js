$(document).ready(function() {
    $('div.example p').append(' <br/> JavaScript in Example working! - JQuery Version: ' + $().jquery + '<br/>');
    initLeafletMap();
    initD3();
});

{
    var map = null;
    function initLeafletMap() {
        map = L.map('leafletExample').setView([47.983, 7.85], 12);

        map.addLayer(new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 1,
            maxZoom: 20,
            attribution: 'UB Freiburg'
        }));
    }
}

function initD3() {
    var dataset = [],
            i = 0;

    for (i = 0; i < 5; i++) {
        dataset.push(Math.round(Math.random() * 100));
    }

    var sampleSVG = d3.select("#d3Example")
            .append("svg")
            .attr("width", 800)
            .attr("height", 80);

    sampleSVG.selectAll("circle")
            .data(dataset)
            .enter().append("circle")
            .style("stroke", "black")
            .style("fill", "white")
            .attr("r", 30)
            .attr("cx", function(d, i) {
                return 100 + i * 100
            })
            .attr("cy", 40)
            .on("mouseover", function() {
                d3.select(this).style("fill", "orange");
            })
            .on("mouseout", function() {
                d3.select(this).style("fill", "cyan");
            })
            .on("mousedown", animateFirstStep)
            ;

    function animateFirstStep() {
        d3.select(this)
                .transition()
                .delay(0)
                .duration(350)
                .attr("r", 10)
                .each("end", animateSecondStep);
    }
    ;

    function animateSecondStep() {
        d3.select(this)
                .transition()
                .duration(3500)
                .attr("r", 30);
    }
    ;

}

