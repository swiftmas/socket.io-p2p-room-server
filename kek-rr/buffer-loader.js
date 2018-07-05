function loadKek(file, type){
  if (type == "url"){
    var request = new XMLHttpRequest();
    request.open("GET", file, true);
    request.responseType = "arraybuffer";
    request.onload = function() {
        var zip = JSZip.loadAsync(request.response)
        zip.then(function(value) {
          for (file in value.files){
            var zipfile = value.file(file).async("blob");
            zipfile.then(function(value){
              kekFileData[file] = value
              console.log(kekFileData);
              createBuffer(file)
            })
          }
        });
    }
    request.onerror = function() {
      alert('BufferLoader: XHR error');
    }
    request.send();
  };
}

function createBuffer(fileName) {
  console.log('Creating Buffer for: ' + fileName)
  var fileReader = new FileReader()
  fileReader.onloadend = function (e) {
    originArrayBuffer[fileName] = e.target.result
    context.decodeAudioData(originArrayBuffer[fileName]).then(function (audioBuffer) {
      console.log("Buffer Created for: "+ fileName + " at: originArrayBuffer."+fileName)
    })
  }
  fileReader.readAsArrayBuffer(kekFileData[fileName])
}

function bufferTracks(a){
  //----- This part lets us define an optional param to only reload one of the tracks. ------
  // So a doesnt have to be passed, we can call just init() unless we want a specific track /
  a = a || "all";
  if ( a == "all"){
  var i = 0;
    upperBound=songData.tracks.length
  } else {
    var i = a;
    upperBound = a + 1;
  }
  //---- --- --  ----------------------------------------------------------------------------
  for (var i=0; i<songData.tracks.length; ++i) {
    bufferData.tracks[i]={"sources": []};
    for (var af=0; af<songData.tracks[i].audio.length; ++af){
      var fileName=songData.tracks[i].audio[af].file
      if (!originArrayBuffer.hasOwnProperty(fileName)){
        createBuffer(fileName);
      };
    };
  }
}


// RELEASES THE PROMISE FOR THE BUFFERS AND SIGNALS THAT PLAYBACK CAN STSART. Plays through once to alleviate need of if/thens to make sure the buffers exist.
function finishedLoading(bufferList, track) {
	console.log(track, "has loaded")
	for (var s=0; s<bufferList.length; ++s){
		// This will setup our timers so that we use real time instead of calling the function every time
		songData.tracks[track].audio[s].init_time = globalTime("formal", songData.tracks[track].audio[s].init_formal, "time")
    songData.tracks[track].audio[s].init_128 = globalTime("formal", songData.tracks[track].audio[s].init_formal, "128")
		if (songData.tracks.length == bufferData.tracks.length){
					mainLoop();
		};
	}
}
