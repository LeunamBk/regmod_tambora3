var chart = new Highcharts.Chart({

    chart: {
        renderTo: 'container1',
        type: 'column'
    },

    yAxis: {
        title: {
            enabled: false,
        },
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
    },
    legend: {
        enabled: false
    },
    title: {
        text: ''
    },
    plotOptions: {
        column: {
            groupPadding: 0,
            pointPadding: 0,
            borderWidth: 1
        }
    },

    series: [{
        data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4]
    }]

});

var chart = new Highcharts.Chart({

    chart: {
        renderTo: 'container2',
        type: 'column'
    },
    yAxis: {
        title: {
            enabled: false,
        }
    },

    xAxis: { title: {
        enabled: false,
    },
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    legend: {
        enabled: false
    },
    title: {
        text: ''
    },
    plotOptions: {
        column: {
            groupPadding: 0,
            pointPadding: 0,
            borderWidth: 1
        }
    },

    series: [{
        data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
    }]

});


var chart = new Highcharts.Chart({

    chart: {
        renderTo: 'container3',
        type: 'column',

    },
    yAxis: {
        title: {
            enabled: false,
        }
    },

    xAxis: { title: {
        enabled: false,
    },
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec','Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec','Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec','Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    legend: {
        enabled: false
    },
    title: {
        text: ''
    },
    plotOptions: {
        column: {
            groupPadding: 0,
            pointPadding: 0,
            borderWidth: 1
        }
    },

    series: [{
        data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4,29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4,29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4,29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
    }]

});

var chart = new Highcharts.Chart({

    chart: {
        renderTo: 'container4',
        type: 'column',

    },
    yAxis: {
        title: {
            enabled: false,
        }
    },
    xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
    },
    legend: {
        enabled: false
    },
    title: {
        text: ''
    },
    plotOptions: {
        hight:200,
        column: {
            groupPadding: 0,
            pointPadding: 0,
            borderWidth: 1
        }
    },

    series: [{
        data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6]
    }]

});
