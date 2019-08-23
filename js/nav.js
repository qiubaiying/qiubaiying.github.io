$(document).ready(function () {
    $("article").css("overflow", "hidden");
    var str = $(".navbar-brand").css("color") + "";
    console.log(str);

    $(".navbar-brand").css("text-shadow", "black 0.1em 0.1em 0.2em");
    $(".nav").children("li").css("text-shadow", "black 0.1em 0.1em 0.2em");

    $("nav").change(function (e) {
        if (str === "rgb(255, 255, 255)") {
            $(".navbar-brand").css("text-shadow", "black 0.1em 0.1em 0.2em");
            $(".nav").children("li").css("text-shadow", "black 0.1em 0.1em 0.2em");
        } else {
            $(".navbar-brand").css("text-shadow", "");
            $(".nav").children("li").css("text-shadow", "");
        }
    });
});