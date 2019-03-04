var song;
var fft;
var video;
var poseNet;
var targetX = 0;
var targetY = 0;

class Attractor {
  constructor(x, y, m) {
    this.location = createVector(x, y);
    this.mass = m;
    this.G = 0.4;
  }

  // mover of type Mover
  attract(mover) {
    var force = this.location.copy();
    force.sub(mover.location);
    var distance = force.mag();
    distance = constrain(distance, 5, 20);
    force.normalize();

    var strength = (this.G * this.mass * mover.mass) / (distance * distance);
    force.mult(strength);

    return force;
  }

  changeLocation(x, y) {
    this.location = createVector(x, y);
  }
}

class Mover {
  constructor(x, y, m) {
    this.location = createVector(x, y);
    this.velocity = createVector(0.1, 0);
    this.acceleration = createVector(0, 0);
    this.history = []; // Array of p5.Vector
    this.mass = m;
    this.G = 0.1;
  }

  update() {
    if (this.history.length > 10) {
      this.history.shift();
    }

    this.history.push(createVector(this.location.x, this.location.y));

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

function preload() {
  soundFormats('mp3');
  song = loadSound('assets/dna.mp3');
}

var attractor;
var movers;

function setup() {
  var cvs = createCanvas(1200, 800);
  // video = createCapture(VIDEO);
  frameRate(30);

  targetX = width / 2;
  targetY = height / 2;

  // poseNet = ml5.poseNet(video, 'single', () => {
  //   console.log('Model ready');
  // });
  // poseNet.on('pose', (results) => {
  //   if (results.length > 0) {
  //     targetX = results[0].pose.keypoints[10].position.x;
  //     targetY = results[0].pose.keypoints[10].position.y;
  //     // console.log(`${targetX} / ${targetY}`);
  //   }
  // });
  // video.hide();

  cvs.parent('canvasContainer');
  background(220);
  cvs.mousePressed(toggle);

  song.setVolume(0.2);
  song.play();

  fft = new p5.FFT(0.8, 256);

  attractor = new Attractor(width/2, height/2, 10);
  movers = [];

  for (var i = 0; i < 24; i++) {
    movers[i] = new Mover(random(width), random(height), 2);
  }
}

function draw() {
  background(255);
  var spectrum = fft.analyze();

  // attractor.changeLocation(
    // map(targetX, -100, 400, width, 0),
    // map(targetY, -100, 400, 0, height)
  // );

  for (var i = 0; i < movers.length; i++) {
    var energy;

    if (i >= 0 && i <= 64) {
      energy = fft.getEnergy("bass");
    } else if (i <= 128) {
      energy = fft.getEnergy("mid");
    } else if (i <= 192) {
      energy = fft.getEnergy("highMid");
    } else {
      energy = fft.getEnergy("treble");
    }

    movers[i].changeMass(map(energy, 0, 255, 2, 12));
    movers[i].applyForce(attractor.attract(movers[i]));
    movers[i].update();

    noStroke();
    fill(energy, 0, spectrum[i], 90);
    ellipse(
      movers[i].location.x, 
      movers[i].location.y, 
      map(spectrum[i], 0, 255, 0, 50), 
      map(spectrum[i], 0, 255, 0, 50)
    );
  }

}

function toggle() {
  if (song.isPaused()) {
    song.play();
  } else {
    song.pause();
  }
}