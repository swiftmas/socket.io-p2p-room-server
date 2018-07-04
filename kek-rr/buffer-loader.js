function BufferLoader(context, urlList, track, callback) {
  this.context = context;
  this.track = track;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList, loader.track);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
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
    bufferData.tracks[i]={"sources": [], "buffer": [] };
    var audioToBuffer = [];
    for (var af=0; af<songData.tracks[i].audio.length; ++af){
      audioToBuffer.push(songData.tracks[i].audio[af].file);
      songData.tracks[i].audio[af].index = af;
    }
    bufferData.tracks[i].buffer = new BufferLoader(
      context,
      audioToBuffer,
      i, //track number
      finishedLoading
    );
    bufferData.tracks[i].buffer.load();
  }
}

function newTrack(trackNo, track) {
  console.log('new track inc' + trackNo)
  var fileReader = new FileReader()
  fileReader.onloadend = function (e) {
    var arrayBuffer = e.target.result
    context.decodeAudioData(arrayBuffer).then(function (audioBuffer) {
      if (trackNo === 1) {
        source1 = new BuffAudio(context, audioBuffer)
      } else if (trackNo === 2) {
        source2 = new BuffAudio(context, audioBuffer)
      } else {
        console.error("this, shouldn't happen ever.. use 1 or two for your track number...")
      }
    })
  }
  fileReader.readAsArrayBuffer(track)
}

// RELEASES THE PROMISE FOR THE BUFFERS AND SIGNALS THAT PLAYBACK CAN STSART. Plays through once to alleviate need of if/thens to make sure the buffers exist.
function finishedLoading(bufferList, track) {
	console.log(track, "has loaded")
	for (var s=0; s<bufferList.length; ++s){
		bufferData.tracks[track].sources[s] = context.createBufferSource();
		bufferData.tracks[track].sources[s].buffer = bufferList[s]
		bufferData.tracks[track].sources[s].connect(bufferData.tracks[track].sources[s].context.destination)
		// This will setup our timers so that we use real time instead of calling the function every time
		songData.tracks[track].audio[s].init_time = globalTime("formal", songData.tracks[track].audio[s].init_formal, "time")
    songData.tracks[track].audio[s].init_128 = globalTime("formal", songData.tracks[track].audio[s].init_formal, "128")
		if (songData.tracks.length == bufferData.tracks.length){
					mainLoop();
		};
	}
}
