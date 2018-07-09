function getMousePosition() {
 var x = new Number();
 var y = new Number();

 if (event.pageX != undefined && event.pageY != undefined) {
    x = event.pageX;
    y = event.pageY;
 } else
 {
    x = event.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft;
    y = event.clientY + document.body.scrollTop
            + document.documentElement.scrollTop;
 }

 x -= canvas.offsetLeft;
 y -= canvas.offsetTop;
 document.getElementById('xcoord').innerHTML = x;
 document.getElementById('ycoord').innerHTML = y;

return [x,y];
}

function pageDraw(){
  console.log("DrawTracks")
  let htmlData = ""
  for (var track=0; track<songData.tracks.length; ++track) {
    let trackName = songData.tracks[track].trackName
    let mark1 = `
        <div class="track-header">
          <div contenteditable="true">${trackName}</div>
          <select onchange="changeRev(this, ${track})">
        `
    let mark2 = ""
    for (var revision in songData.tracks[track].revisions){
      mark2 +=`<option value="${revision}">${revision}</option>`
    }
    let mark3 =`
          </select>
        </div>
        `
    htmlData = htmlData + mark1 + mark2 + mark3
  }
  document.getElementById('trackHeaders').innerHTML = htmlData

}


function changeRev(revValue, track){
    stop()
    var value = revValue.value;
    songData.tracks[track].currentRevision = value
}

function draw(){
	var uiZoom = songData.uiZoom
	canvas.width = songData.end * uiZoom
	canvas.height = songData.tracks.length * 82
	for (var i=0; i<songData.tracks.length; ++i) {
		var rev = songData.tracks[i].currentRevision
		for (var af=0; af<songData.tracks[i].revisions[rev].audio.length; ++af){
			var timeTotal = songData.tracks[i].revisions[rev].audio[af].init_formal
			var tlen = globalTime("time", bufferData.buffers[songData.tracks[i].revisions[rev].audio[af].file].duration, "formal")
			var my_gradient = ctx.createLinearGradient(0, 0, 0, 170+(100*i));
			my_gradient.addColorStop(0, "#2ff3f3");
			my_gradient.addColorStop(1, "#b400e1");
      //my_gradient.addColorStop(0, "#eee");
			//my_gradient.addColorStop(1, "#fff");
			ctx.fillStyle = my_gradient;
			ctx.fillRect(timeTotal[0]*uiZoom,i*82,tlen[0]*uiZoom,80);
			ctx.fillStyle = "Black"
			var newtime = globalTime("time",(context.currentTime - playTime),"formal")
			ctx.fillRect((newtime[0]*uiZoom)+parseInt(newtime[1]*(uiZoom/4))+parseInt(newtime[2]*(uiZoom/16)),0,1,82*songData.tracks.length)
			document.getElementById('currentTime').innerHTML = "Measure: " + newtime[0] + " , Quarter: " + newtime[1] + " , 16th: " + newtime[2]
		}
	}
}
