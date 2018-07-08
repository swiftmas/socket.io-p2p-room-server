/////////////// Load Zip file //////////////////////////////////
function loadKek(file, type){
  if (type == "url"){
    var request = new XMLHttpRequest();
    console.log("Retreiving Kek file: " + file)
    request.open("GET", file, true);
    request.responseType = "arraybuffer";
    request.onload = function() {
        //Promise1 - Load Zipfile-----------------
        var zip = JSZip.loadAsync(request.response)
        zip.then(function(value) {
          //Promise2.0 - Load Context from zip file and ipmort to global context---------------
          console.log("Reading Song Data")
          var contextFile = value.file("context.json").async("string");
          contextFile.then(function(value){
            //write songdata json to global var
            songData = JSON.parse(value);
            console.log("Song Data Gathered")
          });
          //Promise2.1 - Begin unpacking the audio files ----------------
          kekFileData["totalFiles"] = Object.keys(value.files).length
          console.log("Unpacking Files")
          for (var fileName in value.files){
            if (fileName != "context.json"){
              kekFileData[fileName] = {}
              kekFileData[fileName].promise = value.file(fileName).async("blob");
              //Promise3 - write files to blob format and send them to the buffer initiator function below.
              kekFileData[fileName].promise.then(assignFileDataBlob.bind(value, fileName)) // the bind is out of order . . . but it works so whatever.
            }
          }
        });
    }
    request.onerror = function() {
      alert('BufferLoader: XHR error');
    }
    request.send();
  };
}
//Last step of the promises. Assigns the kekFileData value to the blob and passes things onto create buffers
function assignFileDataBlob(fileName, value) {
  kekFileData[fileName].value = value
  console.log(kekFileData);
  kekFileData["promiseCount"] += 1
  createBuffer(fileName);
  if (kekFileData["promiseCount"] == kekFileData["totalFiles"] - 1){
    console.log("Buffering Finished");
    finishedLoading();
  }
}
/////////////////////////////////////////////////////////////


////////// Create Buffers ///////////////////////////////////
function createBuffer(fileName) {
  console.log('Creating Buffer for: ' + fileName)
  var fileReader = new FileReader()
  fileReader.onloadend = function (e) {
    originArrayBuffer[fileName] = e.target.result
    context.decodeAudioData(originArrayBuffer[fileName]).then(function (audioBuffer) {
      bufferData.buffers[fileName] = audioBuffer;
      console.log("Buffer Created for: "+ fileName + " at: originArrayBuffer."+fileName)
    })
  }
  fileReader.readAsArrayBuffer(kekFileData[fileName].value)
}

/////////////////////////////////////////////////////////////

// Sets up some math I dont wanna do right now and starts main loop. NEEDS REMOVED
// THE ONLY ESSENTIAL PART OF THIS is creating the sources object per bufferData.tracks
function finishedLoading() {
  for (var track=0; track<songData.tracks.length; ++track) {
    bufferData.tracks[track]={"sources": []};
    for (var rev in songData.tracks[track].revisions){
    	for (var s=0; s<songData.tracks[track].revisions[rev].audio.length; ++s){
    		// This will setup our timers so that we use real time instead of calling the function every time
    		songData.tracks[track].revisions[rev].audio[s].init_time = globalTime("formal", songData.tracks[track].revisions[rev].audio[s].init_formal, "time")
        songData.tracks[track].revisions[rev].audio[s].init_128 = globalTime("formal", songData.tracks[track].revisions[rev].audio[s].init_formal, "128")
    	}
    }
  }
  mainLoop();
}
