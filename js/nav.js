// $(document).ready(function () {
//     $("article").css("overflow", "hidden");

//     $(".navbar-brand").css("text-shadow", "black 0.1em 0.1em 0.2em");
//     $(".nav").children("li").css("text-shadow", "black 0.1em 0.1em 0.2em");
//     $("nav").on()
//     $("nav").change(function (e) {
//         console.log($(".navbar-brand").css("color") + "");
//         if ($(".navbar-brand").css("color") + "" === "rgb(255, 255, 255)") {
//             $(".navbar-brand").css("text-shadow", "black 0.1em 0.1em 0.2em");
//             $(".nav").children("li").css("text-shadow", "black 0.1em 0.1em 0.2em");
//         } else {
//             $(".navbar-brand").css("text-shadow", "");
//             $(".nav").children("li").css("text-shadow", "");
//         }
//     });
// });
$(window).scroll(function(){
    if ($(window).scrollTop() == 0) {
        $(".navbar-brand").css("text-shadow", "black 0.1em 0.1em 0.2em");
        $(".nav").children("li").css("text-shadow", "black 0.1em 0.1em 0.2em");
    } else {
        $(".navbar-brand").css("text-shadow", "");
        $(".nav").children("li").css("text-shadow", "");
    }
});