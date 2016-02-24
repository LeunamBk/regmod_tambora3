function setMapSize(id, size){
    var mapheight = size; 
    var height = $(window).height();
    mapheight = (height/100) * mapheight;
    $('#'+id).css({'height':mapheight})
    $('#top').css({'height':mapheight}) 
    return(mapheight);  
}

// copy array to new array variable cause a = b is just a reference (pointer) 
// therefore a and b affect each other
// source: http://james.padolsey.com/javascript/deep-copying-of-objects-and-arrays/
function deepCopy(o) {
    var copy = o,k;
    if (o && typeof o === 'object') {
        copy = Object.prototype.toString.call(o) === '[object Array]' ? [] : {};
        for (k in o) {
            copy[k] = deepCopy(o[k]);
        }
    }
    return copy;
}

// declare avarage and stddev function
function stddev(values){
    var avg = average(values);

    var squareDiffs = values.map(function(value){
        var diff = value - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
    });

    var avgSquareDiff = average(squareDiffs);
    var stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
}

function average(data){
    var sum = data.reduce(function(a, b) { return a + b; });
    var avg = (sum / data.length);
    return avg;            
}

//replaces all search with replacement
function replaceAll(str, search, replacement) {
    return str.split(search).join(replacement);
}

function checkBoundingBox(){
    var bbox = sessionStorage.getItem('bbox');
    var bboxJson = JSON.parse(bbox);
    bbox = typeof bbox !== 'undefined' ? bbox : 1;
    bbox =  bbox !== null ? bbox : 1;
    bboxJson =  bboxJson !== null ? bboxJson : 1;
    return [bbox, bboxJson];
}
/*
// this functions waitrs till a variable is found and than executes the callback
function waitForElement(element, time, callback){
    if(typeof element !== "undefined"){
        callback();
    } else{
        setTimeout(function(){
            waitForElement(element, time, callback);
        },time);
    }
};
*/
