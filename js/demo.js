

const ap5 = new APlayer({
    element: document.getElementById('player5'),
    mini: false,
    autoplay: false,
    lrcType: 3,
    mutex: true,
    theme: '#e9e9e9',
    listFolded: false,
    listMaxHeight: 80,
    audio: [
        ]
});





const ap8 = new APlayer({
    element: document.getElementById('player8'),
    mutex: true,
    theme: '#ad7a86',
    order: 'random',
    lrcType: 3,
    fixed: true,
});
$.ajax({
    url: 'https://api.i-meto.com/meting/api?server=netease&type=playlist&id=101952842',
    success: function (list) {
        ap8.list.add(JSON.parse(list));
    }
});