$(document).ready(function () {
    $("article").css("overflow", "hidden");

    $(".navbar-brand").css("text-shadow", "black 0.1em 0.1em 0.2em");
    $(".nav").children("li").css("text-shadow", "black 0.1em 0.1em 0.2em");
});
$(window).scroll(function(){
    if ($(window).scrollTop() == 0) {
        $(".navbar-brand").css("text-shadow", "black 0.1em 0.1em 0.2em");
        $(".nav").children("li").css("text-shadow", "black 0.1em 0.1em 0.2em");
    } else {
        $(".navbar-brand").css("text-shadow", "");
        $(".nav").children("li").css("text-shadow", "");
    }
});