var lacatorArr = [];
var selectItm = [];
var selNavItms = [];

// preopen full select with default date selected
// default June 1767
var selCentury =1;
var selDecade =7;
var selYear =4;
// month from 0:11 for Jan to Dec
var selMonth =0;

//get data for tile based select and call tile select constructor function
function getAdvancedMenu1(){
    // Populate Select
    createTileSelect1(phpTilesData, 'century', '');
};    

// construct tile based select menu
function createTileSelect1(data, id, name){

    var browser = BrowserDetect;

    if (isOldBrowser(browser)) {
        $('#old_browser_msg').show();
        $('#wtf').hide();
        $('fieldset#state').addClass('ff3');
        $('#ie8_percents').addClass('ff3');
        $('#share2').addClass('ff3');
        $('#poweredby.old_browsers').show();
    }

    // set number of classes
    var buckets = 7,
    colorScheme = 'rbow2'

    /* ************************** */

    // parse data and define hours == amount of tiles for each category
    if (id === 'century'){
        var tileData = createCentArray();
        for(century in data){
            if(century !== 'count'){
                tileData[century]=data[century]['count'];
            }
        }
        days = [
            { name: 'CENTURY', abbr: 'CENTURY' }
        ],                                   
        hours = ['', '', '', '', '', '', '', '', '', '','']  // 12

    }else if(id === 'decade'){
        var century = lacatorArr['century'];
        var tileData = createDecArray(century);
        for(decade in data[century]){
            if(decade !== 'count'){
                tileData[decade]= data[century][decade]['count'];
            }
        }
        days = [
            { name: 'DECADE', abbr: 'DECADE' }
        ],
        hours = ['', '', '', '', '', '', '', '', '', '']  // 10

    }else if(id === 'year'){
        var century = lacatorArr['century'];
        var decade = lacatorArr['decade'];
        var tileData = createYearArray(decade);
        if(typeof data[century] !== 'undefined'){
            for(year in data[century][decade]){
                if(year!=='count'){
                    tileData[year]= data[century][decade][year]['count'];
                }
            }
        }
        days = [
            { name: 'YEAR', abbr: 'YEAR' }
        ],
        hours = ['', '', '', '', '', '', '', '', '', '']  // 10

    }else if(id === 'month'){
        var tileData = createMonthArray();
        var century = lacatorArr['century'];
        var decade = lacatorArr['decade'];
        var year = lacatorArr['year'];
        if(typeof data[century] !== 'undefined'){
            if(typeof data[century][decade] !== 'undefined'){
                for(month in data[century][decade][year]){
                    if(month!=='count'){
                        tileData[month]= data[century][decade][year][month]['count'];
                    }
                }
            }
        }
        days = [
            { name: 'month', abbr: 'MONTH' }
        ],
        hours = ['', '', '', '', '', '', '', '', '', '','',''] // 12
    }


    /* ************************** */                             

    d3.select('#'+id).classed(colorScheme, true);
    createTiles(tileData, id);
    reColorTiles('all', 'all', tileData, buckets, id, browser);

    /* ************************** */                             

    $('#'+id+' #tiles td').click(function(){

        // highlight clicked tile
        $('#'+id+' #tiles td').removeClass('clickSel');
        $(this).addClass('clickSel');

        // get id path of selected element
        selNavItms[id+"cl"] = $(this).context.className.replace('sel','');
        selNavItms[id+"cl"] = selNavItms[id+"cl"].replace('clickSel','');

        // get value of clicked element
        var tmp = $(this).attr('id').split('d').join('').split('h'); 
        var resVal = parseInt(Object.keys(tileData)[tmp[1]]);
        selNavItms[id] =  resVal;
        lacatorArr[id] = resVal;

        if(id === "century"){

            createTileSelect1(data, 'decade', '');

            if ($('#decade').hasClass('rbow2') && typeof selNavItms['decadecl'] != 'undefined'){
                selectItm['decade'] = '#decade #tiles #'+selNavItms['decadecl'].replace(" ","");    
                lacatorArr['decade'] = selNavItms['decade'];
            }
            if ($('#year').hasClass('rbow2') && typeof selNavItms['yearcl'] != 'undefined' && typeof selNavItms['decade'] != 'undefined'){
                lacatorArr['decade'] = selNavItms['decade'];
                selectItm['year'] = '#year #tiles #'+selNavItms['yearcl'].replace(" ","");
                lacatorArr['year'] =  selNavItms['year'];
            }
            if ($('#month').hasClass('rbow2') && typeof selNavItms['monthcl'] != 'undefined'  && typeof selNavItms['year'] != 'undefined'){
                lacatorArr['year'] =  selNavItms['year'];
                selectItm['month'] = '#month #tiles #'+selNavItms['monthcl'].replace(" ","");
                lacatorArr['month'] =  selNavItms['month'];
            }
        } 

        else if(id === "decade"){

            createTileSelect1(data, 'year', '');

            selectItm['decade'] = '#decade #tiles #'+selNavItms['decadecl'].replace(" ","");

            if ($('#year').hasClass('rbow2') && typeof selNavItms['yearcl'] != 'undefined'){
                selectItm['year'] = '#year #tiles #'+selNavItms['yearcl'].replace(" ","");      
            }
            if ($('#month').hasClass('rbow2') && typeof selNavItms['monthcl'] != 'undefined'  && typeof selNavItms['year'] != 'undefined'){
                lacatorArr['year'] = selNavItms['year'];
                selectItm['month'] = '#month #tiles #'+selNavItms['monthcl'].replace(" ","");
            }

        }else if(id === "year"){
            selectItm['year'] = '#year #tiles #'+selNavItms['yearcl'].replace(" ","");
            createTileSelect1(data, 'month', '');   
            $(selectItm['month']).click(); 

        }else if(id === "month"){
            selectItm['month'] = '#month #tiles #'+selNavItms['monthcl'].replace(" ","");

            /**
            * check if this is the initial population of the selectmenu to avoid infinite reload loop
            *       noSelect == 1 => region was defined in select by region => selectmenu
            *       was new created
            *       noSelect == null => normal mode
            *       noSelect == 2 => coming from select by region 
            */
            var noSelect = sessionStorage.getItem('noclick');
            if(noSelect === null){
                mapController.updateApp(lacatorArr['year'], selNavItms[id]);
                // updateApp(lacatorArr['year'], selNavItms[id]);
            } else if(noSelect == 1){
                sessionStorage.setItem('noclick', 2);
            } else if(noSelect == 2){
                sessionStorage.removeItem('noclick');
                mapController.updateApp(lacatorArr['year'], selNavItms[id]);
            }
        }
    })

    /* ************************** */

    // tiles mouseover events
    $('#'+id+' #tiles td').hover(function() {
        $(this).addClass('sel');
        var tmp = $(this).attr('id').split('d').join('').split('h'); 
        var resVal = parseInt(Object.keys(tileData)[tmp[1]]);

        // add tooltip
        var monthArr = new Array('NONE','January','February','March','April','May','June','July','August','September','October','November','December');
        if(id == 'month'){
            $(this).prop('title', monthArr[resVal]);

        }  else {
            $(this).prop('title', resVal);
        }

        }, function() {

            $(this).removeClass('sel');

            var $sel = d3.select('#map path.state.sel');

            if ($sel.empty()) {
                var state = 'all';
            } else {
                var state = $sel.attr('id');
            }

    });


    /* ************************** */

    if(id == 'century'){ 
        $('#'+id+' #d0h'+selCentury).click();

    } else if (id == 'decade'){
        if(typeof selectItm['decade'] !== 'undefined'){
            $(selectItm['decade']).click(); 
        } else {
            $('#'+id+' #d0h'+selDecade).click(); 
            selectItm['decade'] = '#'+id+' #d0h'+selDecade; 
            lacatorArr['decade'] = $('#'+id+' #d0h'+selDecade).attr('title');  
        }
    } else if (id == 'year'){
        if(typeof selectItm['year'] !== 'undefined'){
            $(selectItm['year']).click(); 
        } else {
            $('#'+id+' #d0h'+selYear).click(); 
            selectItm['year'] = '#'+id+' #d0h'+selYear;
            lacatorArr['year'] = $('#'+id+' #d0h'+selYear).attr('title');   
        }
    } else if (id == 'month'){
        if(typeof selectItm['month'] === 'undefined') {
            selectItm['month'] = '#'+id+' #d0h'+selMonth; 
            lacatorArr['month'] = $('#'+id+' #d0h'+selMonth).attr('title');     
        }
    }


}

/* ************************** */ 

function isOldBrowser(browser) {

    var result = false;
    if (browser.browser === 'Explorer' && browser.version < 9) {
        result = true;
    } else if (browser.browser === 'Firefox' && browser.version < 4) {
        result = true;
    }

    return result;
}

/* ************************** */

function selectedType() {

    //return d3.select('input[name="type"]:checked').property('value'); // IE8 doesn't like this
    return $('input[name="type"]:checked').val();
}

/* ************************** */

function getCalcs(state, view, tileData) {

    Array.prototype.max = function() {
        return Math.max.apply(null, this);
    };

    Array.prototype.min = function() {
        return Math.min.apply(null, this);
    };

    var dArray = [];
    for (variable in tileData) {
        dArray.push(tileData[variable]);
    }

    var min = Math.min.apply(null, dArray),
    max = Math.max.apply(null, dArray);

    return {'min': min, 'max': max};
};

/* ************************** */

function reColorTiles(state, view, tileData, buckets, id, browser) {

    var calcs = getCalcs(state, view, tileData),
    range = [];

    for (var i = 1; i <= buckets; i++) {
        range.push(i);
    }

    var bucket = d3.scale.quantize().domain([0, calcs.max > 0 ? calcs.max : 1]).range(range),
    side = d3.select('#'+id+' #tiles').attr('class');


    if (side === 'front') {
        side = 'back';
    } else {
        side = 'front';
    }

    var d=0;
    var h=0;
    for (variable in tileData) {
        var sel = '#'+id+' #d' + d + 'h' + h + ' .tile .' + side;
        val = tileData[variable];

        // erase all previous bucket designations on this cell
        for (var i = 1; i <= buckets; i++) {
            var cls = 'q' + i + '-' + buckets;
            d3.select(sel).classed(cls , false);
        }

        // set new bucket designation for this cell
        var cls = 'q' + (val > 0 ? bucket(val) : 0) + '-' + buckets;
        d3.select(sel).classed(cls, true);

        ++h;
    }

    flipTiles(id, browser);
}

/* ************************** */

function flipTiles(id, browser) {

    var oldSide = d3.select('#'+id+' #tiles').attr('class'),
    newSide = '';

    if (oldSide == 'front') {
        newSide = 'back';
    } else {
        newSide = 'front';
    }

    var flipper = function(h, d, side) {
        return function() {
            var sel = '#'+id+' #d' + d + 'h' + h + ' .tile',
            rotateY = 'rotateY(180deg)';

            if (side === 'back') {
                rotateY = 'rotateY(0deg)';    
            }
            if (browser.browser === 'Safari' || browser.browser === 'Chrome') {
                d3.select(sel).style('-webkit-transform', rotateY);
            } else {
                d3.select(sel).select('.' + oldSide).classed('hidden', true);
                d3.select(sel).select('.' + newSide).classed('hidden', false);
            }
        };
    };

    for (var h = 0; h < hours.length; h++) {
        for (var d = 0; d < days.length; d++) {
            var side = d3.select('#'+id+' #tiles').attr('class');
            setTimeout(flipper(h, d, side), (h * 20) + (d * 20) + (Math.random() * 100));
        }
    }
    d3.select('#'+id+' #tiles').attr('class', newSide);
}

/* ************************** */

function updateIE8percents(state) {

    var rawMobPercent = 100 / (tileData[state].pc2mob + 1);

    if (rawMobPercent < 1) {
        var mobPercent = '< 1',
        pcPercent = '> 99';
    } else {
        var mobPercent = Math.round(rawMobPercent),
        pcPercent = 100 - mobPercent;
    }

    d3.select('#pc2mob .pc span').html(pcPercent + '%');
    d3.select('#pc2mob .mob span').html(mobPercent + '%');

    var html = d3.select('#pc2mob ul').html();
    d3.select('#ie8_percents').html(html);
}

/* ************************** */

function createTiles(tileData, id) {
    var dArray = [];

    var dataKeys  = $.map(tileData, function(v, i){
        return i;
    });

    var html = '<table id="tiles" class="front">';

    /*  html += '<tr><th><div>&nbsp;</div></th>';

    for (var h = 0; h < hours.length; h++) {
    html += '<th class="h' + h + '">' + hours[h] + '</th>';
    }

    html += '</tr>';
    */
    for (var d = 0; d < days.length; d++) {
        html += '<tr class="d' + d + '">';
        for (var h = 0; h < hours.length; h++) {
            html += '<td id="d' + d + 'h' + h + '" class="d' + d + ' h' + h + ' "title="'+dataKeys[h]+'"><div class="tile"><div class="face front"></div><div class="face back"></div></div></td>';
        }
        html += '<th>' + days[d].abbr + '</th>';

        html += '</tr>';
    }

    html += '</table>';
    d3.select('#'+id).html(html);

    // select prevous selected items
    /*
    if($('#decade').hasClass('rbow2') && typeof selectItm['decade'] != 'undefined'){
    /*
    // check if selected item will be empty and change selection to non empty slot
    String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
    }
    var checkSel = selectItm['decade'].replace('clickSel','')
    if($(checkSel+" .tile div:nth-child(2)").attr("class").split(' ')[2].split('-')[0] == 'q0'){
    console.log('ghghg') 
    var sel = checkSel.split(' ')[2];
    var newSel = sel[2]+1
    newSel = sel.replaceAt(2,newSel)   
    checkSel.replace(sel, newSel)    
    }


    $(selectItm['decade']).addClass('clickSel'); 
    }
    */


    if($('#year').hasClass('rbow2') && typeof selectItm['year'] != 'undefined'){
        $(selectItm['year']).addClass('clickSel');
    }
    if($('#month').hasClass('rbow2') && typeof selectItm['month'] != 'undefined'){
        $(selectItm['month']).addClass('clickSel');
    }    
}

function createCentArray(){
    return {1000:0,1100:0,1200:0,1300:0,1400:0,1500:0,1600:0,1700:0,1800:0};
}

function createDecArray(century){
    var decade = {};
    decade[century] = 0;
    for(var i=1; i < 10; i++){
        century = parseInt(century) + 10;   
        decade[century] = 0;    
    }
    return decade;

}

function createYearArray(decade){
    var year = {};
    year[decade] = 0;
    for(var i=1; i < 10; i++){
        decade = parseInt(decade) + 1;    
        year[decade] = 0;    
    }
    return year;
}

function createMonthArray(){
    return {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0};
}
