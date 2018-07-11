
//SETUP GLOBALS
var songData = {};
var bufferData = {"analysers": [], "tracks": [], "buffers":{}};
var originArrayBuffer = {};
var kekFileData = {"promiseCount":0, "totalFiles": 1000};
var editorData = {track: "none", "selected":[], "revision": ""}
var chatData = "";

var socket = io.connect();
var canvas = document.getElementById('canvaz');
var ctx = canvas.getContext('2d');
var context;
var playing = false;
var playTime = 0;
var slop = .01;

//SETUP LOAD ALL THE AUDIO
window.onload = init;
function init() {
  var roomName = window.location.pathname.substring(6)
  var songName = window.location.hash.substring(1)
  socket.emit('create-room', roomName);
  socket.emit('join-room', roomName);
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();
	loadKek("/data/"+ songName, "url")
}


// Loop for Draw and scheduling
function mainLoop(){
  pageDraw();
	setInterval(function(){
		draw()
	}, 60/songData.bpm/4);
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
  if (editorData.track == "none"){
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
  if (editorData.track == "none"){
    if (songData.tracks[track].currentRevision == "Master"){
      alert("You cannot edit Master, master must be commited to.")
      return
    }
    editorData.track = track
    editorData.revision = songData.tracks[track].currentRevision
    document.getElementById("revisionContext").style.display = "block"
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
  //delete songData.tracks[track].revisions[rev]
  editorData.revision = ""
  editorData.track = "none"
  document.getElementById("revisionContext").style.display = "none"
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
