$(document).ready(function () {
    var time1 = 0;
    var show = false;
    var names = new Array(); //文章名字等
    var urls = new Array(); //文章地址
    $(document).keyup(function (e) {
        var time2 = new Date().getTime();
        if (e.keyCode == 17) {
            var gap = time2 - time1;
            time1 = time2;
            if (gap < 500) {
                if (show) {
                    $(".cb-search-tool").css("display", "none");
                    show = false;
                } else {
                    $(".cb-search-tool").css("display", "block");
                    show = true;
                    $("#cb-search-content").val("");
                    $("#cb-search-content").focus();
                }
                time1 = 0;
            }
        } else if (e.keyCode == 27) {
            $(".cb-search-tool").css("display", "none");
            show = false;
            time1 = 0;
        }
    });

    $("#cb-search-content").keyup(function (e) {
        var time2 = new Date().getTime();
        if (e.keyCode == 17) {
            var gap = time2 - time1;
            time1 = time2;
            if (gap < 500) {
                if (show) {
                    $(".cb-search-tool").css("display", "none");
                    show = false;
                } else {
                    $(".cb-search-tool").css("display", "block");
                    show = true;
                    $("#cb-search-content").val("");
                    $("#cb-search-content").focus();
                }
                time1 = 0;
            }
        }
    });

    $("#cb-close-btn").click(function () {
        $(".cb-search-tool").css("display", "none");
        show = false;
        time1 = 0;
    });

    $("#cb-search-btn").click(function () {
        $(".cb-search-tool").css("display", "block");
        show = true;
        $("#cb-search-content").val("");
        $("#cb-search-content").focus();
        time1 = 0;
    });

    $.getJSON("/search/cb-search.json").done(function (data) {
        if (data.code == 0) {
            for (var index in data.data) {
                var item = data.data[index];
                names.push(item.title);
                urls.push(item.url);
            }

            $("#cb-search-content").typeahead({
                source: names,

                afterSelect: function (item) {
                    $(".cb-search-tool").css("display", "none");
                    show = false;
                    window.location.href = (urls[names.indexOf(item)]);
                    return item;
                }
            });
        }
    }).error(function (data, b) {
        console.log("json解析错误，搜索功能暂不可用，请检查文章title，确保不含有换行等特殊符号");
    });

});
