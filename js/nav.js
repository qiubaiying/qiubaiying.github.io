// $(document).ready(function() {
//     if ($(".navbar-brand").css("color") == "#fff") {
//         $(".navbar-brand").css("text-shadow","black 0.1em 0.1em 0.2em");
//         $(".nav").children("li").css("text-shadow","black 0.1em 0.1em 0.2em");
//     }
// });

Window.onload=function(){
    if(document.getElementsByClassName("navbar-brand").style.color == "#fff") {
        document.getElementsByClassName("navbar-brand").style['text-shadow'] = "black 0.1em 0.1em 0.2em";
        document.getElementsByClassName(".nav").getElementsByTagName("li").style['text-shadow'] = "black 0.1em 0.1em 0.2em";
    }
}