$(function(){

    $('.dash-menu').mouseover(function(){
        if($('.sidebar-image').is(':visible')) {
            $(this).css({"border": "1px solid black"});
        }
    });
    $('.dash-menu').mouseout(function(){
        if($('.sidebar-image:visible').is(':visible')) {
            $(this).css({"border": "1px solid #f5f5f5"});
        }
    });
    $('.sidebar-image img').click(function(){
        var $bigPic = $(this).clone();
        $bigPic.css({"position":"absolute","width":"70%","z-index":"9999","top":"10%","left":"15%","border":"1px solid #f5f5f5","border-radius":"10px"});
        $('body').append($bigPic);
        $bigPic.click(function(){
            $(this).remove();
            $('.greyoutoverlay').remove();
        });
        $('body').append("<div class='greyoutoverlay'></div>");
    })


})