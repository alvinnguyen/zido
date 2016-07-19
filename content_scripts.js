var button = '<a id="tabDownload" href="#null" class="button-style-1 pull-left fn-tab" data-group=".fn-tab-panel" data-panel=".fn-tab-panel-share"><i class="zicon icon-download"></i><span>Tải playlist</span></a><span id="playlist-download-process" style="font-size:18px;line-height:30px;"></span>';
var $ = jQuery;
var playlistReady = false;
var gettingLinksDone = false;
var downloadUrls = new Array();
var playlist = $('.playlist');
var port = chrome.runtime.connect({name: "zingmp3"});

function getLinks() {
    if ($('.download').length === 0) {
        return;
    }
    $('.download').each(function(){
        $(this).children('a').click();
    });
}

function getPlayList() {
    var playListEle = playlist.children('li');
    var numberOfSong = playListEle.length;
    playListEle.each(function(current){
        var song = $(this);
        var songId = song.attr('data-id');
        var songCode = song.attr('data-code');
        var songDownloadInfoURL = 'http://mp3.zing.vn/xhr/song/get-download?type=song&id='+songId+'&code='+songCode;
        var songFile = song.find('.fn-name').attr('title');
        var songName = song.find('.fn-name').html();
        var songArtist = song.find('h4').children('a').html();
        $.ajax({
            'url': songDownloadInfoURL
        }).done(function(data) {
            try {
                var songDownloadURL = 'http://mp3.zing.vn'+data['data']['128']['link'];
                downloadUrls.push({
                    'title': songFile,
                    'url': songDownloadURL
                });
            } catch (err) {
                console.log(err.message);
            }

            if (current === (numberOfSong - 1)) {
                gettingLinksDone = true;
            }
        });
    });

}

$(document).ready(function() {
    if (playlist.length > 0) {
        $('#tabShare').after(button);
    }

    $(this).ajaxComplete(function(){
        if (gettingLinksDone) {
            port.postMessage({"message": "download", "songs": downloadUrls});
        }
    });

    port.onMessage.addListener(function(request) {
        if (request.message === "progress") {
            jQuery('#playlist-download-process').html(parseInt(request.percentage*100)+'%');
            if (request.percentage == 1) {
                $('#tabDownload').removeClass('disabled');
            }
        }
        if (request.message === "blob") {
            console.log(request.blob);
            var saveData = (function () {
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                return function (data, fileName) {
                    var json = data,
                    blob = new Blob([json], {type: "octet/stream"}),
                    url = window.URL.createObjectURL(blob);
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    window.URL.revokeObjectURL(url);
                };
            }());

            var data = request.blob,
            fileName = "my-download.zip";

            saveData(data, fileName);

        }
    });

    $('#tabDownload').on('click', function(){
        if ($(this).hasClass('disabled')) {
            return;
        }
        $('#tabDownload').addClass('disabled');
        jQuery('#playlist-download-process').html('0%');
        getPlayList();
    });
});
