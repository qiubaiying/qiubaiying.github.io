$(document).ready(function() {
    $(".navbar-brand").css("color", "white");
     $(".navbar-brand").change(function (e) { 
         if ($(".navbar-brand").css("color") + "" == "white") {
            $(".navbar-brand").css("text-shadow","black 0.1em 0.1em 0.2em");
            $(".nav").children("li").css("text-shadow","black 0.1em 0.1em 0.2em");
        } else {
            $(".navbar-brand").css("");
            $(".nav").children("li").css("");
        }
    });
});