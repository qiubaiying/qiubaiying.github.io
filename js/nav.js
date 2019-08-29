$(document).ready(function () {
    $("article").css("overflow", "hidden");

    $(".navbar-brand").css("text-shadow", "black 0.1em 0.1em 0.2em");
    $("#huxblog_navbar").find("li").css("text-shadow", "black 0.1em 0.1em 0.2em");
});
$(window).scroll(function(){
    if (screen && screen.width > 480) {
        if ($(window).scrollTop() == 0) {
            $(".navbar-brand").css("text-shadow", "black 0.1em 0.1em 0.2em");
            $(".nav").children("li").css("text-shadow", "black 0.1em 0.1em 0.2em");
        } else {
            $(".navbar-brand").css("text-shadow", "");
            $(".nav").children("li").css("text-shadow", "");
        }
    } else {
        if ($(window).scrollTop() <= 60) {
            $(".navbar-brand").css("text-shadow", "black 0.1em 0.1em 0.2em");
        } else {
            $(".navbar-brand").css("text-shadow", "")
        }
    }
    $(".catalog-body").find("a").each(function(){
        // 判断是否在区域内                
        var str = $(this).text().replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?]/g,"");
        console.log(str);
        if ($("#" + str).offset().top > 0 && $("#" + str).offset().top <= $(window).height()) {
            $("#" + str).parent().addClass("active");
        } else {
            $("#" + str).parent().removeClass("active");
        }
    });

});
