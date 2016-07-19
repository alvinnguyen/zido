var zip = new JSZip();

chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == "zingmp3");
    port.onMessage.addListener(function(request) {
        if( request.message === "download" ) {
            //var total = request.songs.length;
            var total = 2;
            var requestCounter = 0;
            var returnCounter = 0;
            request.songs.forEach(function(song){
                if (requestCounter < total) {
                    console.log(song.url);
                    requestCounter = requestCounter + 1;
                    JSZipUtils.getBinaryContent(song.url, function(err, data) {
                        if(err) {
                            throw err;
                        }
                        returnCounter = returnCounter + 1;
                        port.postMessage({"message": "progress", "percentage": returnCounter/total});
                        addToZip(song.title+'.mp3', data);
                        if (returnCounter === total) {
                            zip.generateAsync({type:"blob"}).then(function (content) {
                                console.log(content);
                                href = URL.createObjectURL(content);
                                console.log(href);
                                port.postMessage({"message": "blob", "blob": JSON.stringify(content)});

                                // var zipName = 'download.zip';
                                // var dataURL = 'data:application/zip;base64,' + content;
                                // chrome.downloads.download({
                                //     url:      dataURL,
                                //     filename: zipName,
                                //     saveAs: false
                                // });
                            });
                        }
                    });
                }
            });
        }
    });
});

function addToZip(filename, data) {
    zip.file(filename, data);
}

function triggerDownload() {

}
