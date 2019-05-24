class Attractor {
  constructor(x, y, m) {
    this.location = createVector(x, y);
    this.velocity = createVector(0.1, 0.1);
    this.acceleration = createVector(0, 0);
    this.mass = m;
    this.G = 0.8;
  }

  // mover of type Mover
  attract(mover) {
    var force = this.location.copy();
    force.sub(mover.location);
    var distance = force.mag();
    distance = constrain(distance, 2, 30);
    force.normalize();

    var strength = (this.G * this.mass * mover.mass) / (distance * distance);
    force.mult(strength);

    return force;
  }

  update() {
    this.location.add(this.velocity);
    this.velocity.add(this.acceleration);
    
    this.acceleration.mult(0);
    this.velocity.limit(2);
  }

  updateLocation(location) {
    this.location = createVector(location.x, location.y);
  }

  applyForce(force) {
    var f = force.copy();
    f.mult(1);
    this.acceleration.add(f);
  }
}

class Mover {
  constructor(x, y, m) {
    this.location = createVector(x, y);
    this.velocity = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
    this.acceleration = createVector(0, 0);
    this.history = []; // Array of p5.Vector
    this.mass = m;
    this.G = 0.1;
  }

  update() {
    // if (this.history.length > 10) {
    //   this.history.shift();
    // }

    // this.history.push(createVector(this.location.x, this.location.y));

    this.location.add(this.velocity);
    this.velocity.add(this.acceleration);
    
    this.acceleration.mult(0);
    this.velocity.limit(5);
  }

  display() {
  }

  changeMass(newMass) {
    this.mass = newMass;
  }

  applyForce(force) {
    var f = force.copy();
    f.mult(1);
    this.acceleration.add(f);
  }

  attract(other) {
    var force = this.location.copy();
    force.sub(other.location);
    var distance = force.mag();
    force.normalize();

    var strength = (this.G * this.mass * other.mass) / (distance * distance);
    force.mult(strength);

    return force;
  }

}

var song;
var fft;
var attractor;
var movers;
var amplitude;
var noseX;
var noseY;

var video;
var poseNet;

function preload() {
  soundFormats('mp3');
  song = loadSound('assets/lie.mp3');
}


function setup() {
  var cvs = createCanvas(1000, 1000);
  cvs.parent('canvasContainer');
  background(255);
  cvs.mousePressed(toggle);

  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, () => { console.log('Model ready.'); });
  poseNet.on('pose', (poses) => {
    if (poses.length > 0) {
      noseX = -poses[0].pose.keypoints[0].position.x + width - 200;
      noseY = poses[0].pose.keypoints[0].position.y + 300;
    }
  });

  song.setVolume(0.8);
  song.play();
  amplitude = new p5.Amplitude();

  fft = new p5.FFT(0.8, 256);

  attractor = new Attractor(width/2, height/2, 10);
  movers = [];

  for (var i = 0; i < 120; i++) {
    movers[i] = new Mover(random(width), random(height), random(2, 5));
  }
}

function draw() {
  background(255);
  var spectrum = fft.analyze();
  var level = amplitude.getLevel();

  for (var i = 0; i < movers.length; i++) {
    var energy;

    if (i >= 0 && i <= 64) {
      energy = fft.getEnergy("bass");
    } else if (i <= 128) {
      energy = fft.getEnergy("mid");
    } else if (i <= 256) {
      energy = fft.getEnergy("highMid");
    } else {
      energy = fft.getEnergy("treble");
    }

    attractor.updateLocation(
      createVector(
        noseX,
        noseY
      )
    );
    movers[i].changeMass(map(energy, 0, 255, 1, 20));
    movers[i].applyForce(attractor.attract(movers[i]));
    movers[i].update();

    noStroke();
    fill(level*255, energy, spectrum[i], spectrum[i]);
    ellipse(
      movers[i].location.x, 
      movers[i].location.y, 
      map(spectrum[i], 0, 255, 0, 30), 
      map(spectrum[i], 0, 255, 0, 30)
    );

    fill(255, 0, 0, 100);
  }

}

function toggle() {
  if (song.isPaused()) {
    song.play();
  } else {
    song.pause();
  }
}