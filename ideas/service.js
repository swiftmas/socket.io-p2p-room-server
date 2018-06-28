// //These are the functions I might want to save for the full project


// /**
//  *  - initMixer - aka Initialize the mixer. 
//  * @ Inputs Void
//  * @ Returns Void
//  * I guess you have to load the audio as a buffer this way
//  * It would be a security risk for the File Reader API to 
//  * be able to access local files. It makes sense but now we
//  * need this seperate code for the inital startup. 
//  */
// function initMixer(){

// if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
//     alert('use chrome pls.')
// }
// window.AudioContext = window.AudioContext || window.webkitAudioContext;
// context = new AudioContext();
// analyser = context.createAnalyser();
// source1 = context.createBufferSource();
// source2 = context.createBufferSource();
// source1.connect(analyser);
// source2.connect(analyser);
// analyser.connect(context.destination);

// bufferLoader = new BufferLoader(
//     context,
//     [
//     '/data/drum.mp3',
//     '/data/synth.mp3'
//     ],
//     finishedLoading
//     );

// bufferLoader.load();

// }



//Will need to do something better with the switch statement

// /**
//  * - newTrack - 
//  * This is for creating new tracks after initializing. 
//  * Just needs a track number and can figure the rest out. 
//  * @param {1,2} trackNo 
//  */
// function newTrack(trackNo, track) {
//     console.log('new track inc' + trackNo)
//     var fileReader = new FileReader()
//     fileReader.onloadend = function (e) {
//       var arrayBuffer = e.target.result
//       context.decodeAudioData(arrayBuffer).then(function (audioBuffer) {
//         if (trackNo === 1) {
//           source1 = new BuffAudio(context, audioBuffer)
//         } else if (trackNo === 2) {
//           source2 = new BuffAudio(context, audioBuffer)
//         } else {
//           console.error("this, shouldn't happen ever.. use 1 or two for your track number...")
//         }
//       })
//     }
//     fileReader.readAsArrayBuffer(track)
//   }
  