## Music Visualizer

[Demo Link](https://music-visualizer-private-copy.vercel.app/)

## Prerequisites and Notes

- Please allow for camera access to allow PoseNet to work properly.
- Please wait for around 2-3 seconds for everything to load properly and then click twice on the artboard to play.

## Tech stack

- [p5.js](https://p5js.org/) for drawing objects and playing media file.
- [PoseNet](https://github.com/tensorflow/tfjs-models/tree/master/posenet) for head tracking. In our case, it is tracking the nose.

## Instructions

1. Create an `assets` folder which contains a media file of the song you want to visualize to.
  Example: `assets/jingle-bell.mp3`
2. Edit the `mediaFileType` and `mediaFilePath` variables in `script.js` (on top of the file).
3. Open the `index.html` file on a browser (Preferably Chrome).
4. Enjoy the visuals!

## Known Issues

- There is a little bit of jitter at the beginning of the visualization. The reason is that PoseNet is trying to initialize first to track human face.
- The tracking only works well when we move our head horizontally.