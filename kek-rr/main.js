
//SETUP GLOBALS
var songData = {};
var bufferData = {"analysers": [], "tracks": [], "buffers":{}};
var originArrayBuffer = {};
var kekFileData = {"promiseCount":0, "totalFiles": 1000};
var editorData = {track: "none", "selected":[], "revision": "", "locked": []}
var chatData = "";

var socket = io.connect();
var userSocket;
var roomId;
var recorder
var opts = {peerOpts: {trickle: false}, autoUpgrade: false}
var canvas = document.getElementById('canvaz');
var ctx = canvas.getContext('2d');
var context;
var playing = false;
var playTime = 0;
var slop = .01;

//SETUP LOAD ALL THE AUDIO
window.onload = init;
function init() {
  roomId = window.location.pathname.substring(6)
  var songName = window.location.hash.substring(1)
  socket.emit('create-room', roomId);
  socket.emit('join-room', roomId);
  window.userSocket = socket.io.engine.id;
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();
	loadKek("/data/"+ songName, "url")
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      recorder = new MediaRecorder(stream);
      recorder.addEventListener("dataavailable", event => {
            console.log("its workings")
            kekFileData["record"]=[]
            kekFileData["record"].push(event.data)
            kekFileData["newAudio"] = new Blob(kekFileData["record"])
            //.then(function(){
            //  bufferData(newAudio)
            //});
      });
    });
}


// Loop for Draw and scheduling
function mainLoop(){
  pageDraw();
	setInterval(function(){
		draw()
	}, 60/songData.bpm/4);
}

function recordAudio() {
    // start recording using Recorder.js
    //recorder.clear();
    //recorder.startTime = context.currentTime;
    recorder.start();
}



function recordStop() {
    // stop recording and get the recorded buffer data
    recorder.stop();
}




function exportWAV(type, before, after){
    var rate = 22050;
    if (!before) { before = 0; }
    if (!after) { after = 0; }

    var channel = 0,
        buffers = [];
    for (channel = 0; channel < numChannels; channel++){
        buffers.push(mergeBuffers(recBuffers[channel], recLength));
    }

    var i = 0,
        offset = 0,
        newbuffers = [];

    for (channel = 0; channel < numChannels; channel += 1) {
        offset = 0;
        newbuffers[channel] = new Float32Array(before + recLength + after);
        if (before > 0) {
            for (i = 0; i < before; i += 1) {
                newbuffers[channel].set([0], offset);
                offset += 1;
            }
        }
        newbuffers[channel].set(buffers[channel], offset);
        offset += buffers[channel].length;
        if (after > 0) {
            for (i = 0; i < after; i += 1) {
                newbuffers[channel].set([0], offset);
                offset += 1;
            }
        }
    }

    if (numChannels === 2){
        var interleaved = interleave(newbuffers[0], newbuffers[1]);
    } else {
        var interleaved = newbuffers[0];
    }

    var downsampledBuffer = downsampleBuffer(interleaved, rate);
    var dataview = encodeWAV(downsampledBuffer, rate);
    var audioBlob = new Blob([dataview], { type: type });

    this.postMessage(audioBlob);
}


function newAudio(file, measure, beat){
    kekFileData[file.name] = {}
    kekFileData[file.name].value = file;
    createBuffer(file.name);
  	var rev = editorData.revision
    var track = editorData.track
  	var newtrack = {"file":file.name, "init_formal": [measure,beat,0,0,0]}
  	songData.tracks[track].revisions[rev].audio.push(newtrack)
    reMathTiming()
    start()
    stop()
}

function newTrack(){
  let newtrack = {"trackName":"New","currentRevision":"Master","revisions":{"Master":{"settings":{"volume":100},"effects":[{"effectName":"Reverb","amount":10}],"audio":[]}}}
  songData.tracks.push(newtrack);
  pageDraw();
}
// Selects a track and creates a new audio context off of master.
function trackRaise(track){
  if (editorData.track == "none" && editorData.locked.indexOf(track) == -1){
    socket.emit('lock', roomId, userSocket, track);
    editorData.track = track
    var rev = songData.tracks[track].currentRevision
    let branchName="branch"+Object.keys(songData.tracks[track].revisions).length
    songData.tracks[track].revisions[branchName]= JSON.parse(JSON.stringify(songData.tracks[track].revisions[rev]))
    songData.tracks[track].currentRevision = branchName
    editorData.revision = branchName
    document.getElementById("revisionContext").style.display = "block"
    pageDraw()
  }
}

function trackEdit(track){
  if (editorData.track == "none" && editorData.locked.indexOf(track) == -1){
    socket.emit('lock', roomId, userSocket, track);
    if (songData.tracks[track].currentRevision == "Master"){
      alert("You cannot edit Master, master must be commited to.")
      return
    }
    editorData.track = track
    editorData.revision = songData.tracks[track].currentRevision
    document.getElementById("revisionContext").style.display = "block"
    document.getElementById("cancelRevision").style.display = "hidden"
    pageDraw()
  }
}


function deleteAudio(af){
  stop()
  var rev = editorData.revision
  var track = editorData.track
  console.log("removing "+songData.tracks[track].revisions[rev].audio[af].file )
  songData.tracks[track].revisions[rev].audio.splice(af, 1)
}

function cancelRevision(){
  stop()
  socket.emit('unlock', roomId, userSocket, track);
  var rev = editorData.revision
  var track = editorData.track
  songData.tracks[track].currentRevision = "Master"
  delete songData.tracks[track].revisions[rev]
  editorData.revision = ""
  editorData.track = "none"
  document.getElementById("revisionContext").style.display = "none"
  pageDraw();

}


function saveRevision(){
  stop()
  var rev = editorData.revision
  var track = editorData.track
  socket.emit('unlock', roomId, userSocket, track);
  var trackBranchData = songData.tracks[track].revisions[rev]
  var filesToSend={};
  for (var af=0; af<songData.tracks[track].revisions[rev].audio.length; ++af){
    fileName = songData.tracks[track].revisions[rev].audio[af].file
    filesToSend[fileName] = kekFileData[fileName]
  }
  socket.emit('pushTracks', roomId, userSocket, track, rev, trackBranchData, filesToSend );
  //delete songData.tracks[track].revisions[rev]
  editorData.revision = ""
  editorData.track = "none"
  document.getElementById("revisionContext").style.display = "none"
  document.getElementById("cancelRevision").style.display = "show"
  pageDraw();

}

function select(event){
  let xy = getMousePosition(event);
  let measure = xy[0]/songData.uiZoom;
  if (editorData.track == "none"){
    return;
  } else {
    i = editorData.track // Currently Selected Track
  }
	var rev = songData.tracks[i].currentRevision
  var AF = 0
  if (rev !== editorData.revision ){alert("You cannot manipulate audio outside of the opened revision. Re-open "+ editorData.revision+" to continue editing or cancel the revision to return to select tracks."); return}
	for (var af=0; af<songData.tracks[i].revisions[rev].audio.length; ++af){
    audioFile = songData.tracks[i].revisions[rev].audio[af]
    console.log(measure, audioFile.init_formal[0], audioFile.end_formal[0] )
    if (audioFile.end_formal[0] > measure && audioFile.init_formal[0] < measure && xy[1] == i){
      AF = af
      audioFile["selected"] = true
    } else {
      audioFile["selected"] = false
    }
  }
  let html =`
  Measures<input value="${audioFile.init_formal[0]}" id="tm0"/>
  Beats<input value="${audioFile.init_formal[1]}" id="tm1"/>
  <button onclick="deleteAudio(${AF})">Delete Audio Segment</button>
  `
  document.getElementById("afModify").innerHTML= html

}


socket.on('data', function(newdata) {
	data = newdata;
	document.getElementById('chatText').innerHTML=chatData
	document.getElementById('usrmsg').value = "";
});


socket.on("lock", function(track) {
  console.log('locking: ', track)
  editorData.locked.push(track);
  pageDraw();
});
socket.on("unlock", function(track) {
  console.log('unlocking: ', track)
  var thatIndex = editorData.locked.indexOf(track);
  editorData.locked.splice(thatIndex, 1)
  pageDraw();
});
socket.on("newBranch", function(track, rev, trackBranchData, files){
  songData.tracks[track].revisions[rev] = trackBranchData;
  for (file in files){
    console.log(file,files, "_______", trackBranchData)
    originArrayBuffer[file] = files[file].value
    createAudioBufferFromArrayBuffer(file)
  }
  pageDraw();
});
