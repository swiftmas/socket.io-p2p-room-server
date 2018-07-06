/////////////// Load Zip file //////////////////////////////////
function loadKek(file, type){
  if (type == "url"){
    var request = new XMLHttpRequest();
    console.log("Retreiving Kek file: " + file)
    console.log("Memory Pressure: "+ (window.performance.memory.usedJSHeapSize/window.performance.memory.jsHeapSizeLimit) + "%")
    request.open("GET", file, true);
    request.responseType = "arraybuffer";
    request.onload = function() {
        //Promise1 -----------------
        var zip = JSZip.loadAsync(request.response)
        zip.then(function(value) {
          //Promise2.0 ---------------
          var contextFile = value.file("context.json").async("string");
          contextFile.then(function(value){
            //write songdata json to global var
            console.log("Reading Song Data")
            console.log("Memory Pressure: "+ (window.performance.memory.usedJSHeapSize/window.performance.memory.jsHeapSizeLimit) + "%")
            songData = JSON.parse(value);
          });
          //Promise2.1 ----------------
          kekFileData["totalFiles"] = Object.keys(value.files).length
          console.log("Unpacking Files")
          for (var fileName in value.files){
            if (fileName != "context.json"){
              kekFileData[fileName] = {}
              kekFileData[fileName].promise = value.file(fileName).async("blob");
              kekFileData[fileName].promise.then(assignFileDataBlob.bind(value, fileName))
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
//
function assignFileDataBlob(fileName, value) {
  kekFileData[fileName].value = value
  console.log(kekFileData);
  console.log("Memory Pressure: "+ (window.performance.memory.usedJSHeapSize/window.performance.memory.jsHeapSizeLimit) + "%")
  kekFileData["promiseCount"] += 1
  if (kekFileData["promiseCount"] == kekFileData["totalFiles"] - 1){
    console.log("BeginBufferTracks");
    bufferTracks();
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
      console.log("Memory Pressure: "+ (window.performance.memory.usedJSHeapSize/window.performance.memory.jsHeapSizeLimit) + "%")
    })
  }
  fileReader.readAsArrayBuffer(kekFileData[fileName].value)
}

/////////////////////////////////////////////////////////////



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
    var rev = songData.tracks[i].currentRevision
    for (var af=0; af<songData.tracks[i].revisions[rev].audio.length; ++af){
      var fileName=songData.tracks[i].revisions[rev].audio[af].file
      if (!originArrayBuffer.hasOwnProperty(fileName)){
        createBuffer(fileName);
      };
    };
  }
  finishedLoading();
}


// Sets up some math I dont wanna do right now and starts main loop. NEEDS REMOVED
function finishedLoading() {
  for (var track=0; track<songData.tracks.length; ++track) {
    var rev = songData.tracks[track].currentRevision
  	for (var s=0; s<songData.tracks[track].revisions[rev].audio.length; ++s){
  		// This will setup our timers so that we use real time instead of calling the function every time
  		songData.tracks[track].revisions[rev].audio[s].init_time = globalTime("formal", songData.tracks[track].revisions[rev].audio[s].init_formal, "time")
      songData.tracks[track].revisions[rev].audio[s].init_128 = globalTime("formal", songData.tracks[track].revisions[rev].audio[s].init_formal, "128")
  					mainLoop();
  	}
  }
}
