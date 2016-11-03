var branches = [];
var parts = [];

function setup() {
  var canvas = createCanvas(600, 400);
  canvas.parent('sketch-holder');

  noStroke();

  branches.push(new Branch(createVector(random(width), random(height))));
  branches[0].stopped = true;
}

function draw() {
  background(87, 216, 242);
  for (var i in branches) {
    branches[i].show();
  }

  if (parts.length <= 50) {
    parts.push(new Branch());
  }

  for (var i = parts.length-1; i >= 0; i--) {
    parts[i].update();
    if (parts[i].stopped) {
      branches.push(parts[i]);
      parts.splice(i, 1);
    } else {
      parts[i].show();
    }
  }
}

function Branch(pos) {
  var n1 = floor(random(2));
  var n2 = floor(random(2));
  if (n1 < 1) {
    if (n2 < 1) {
      var new_pos = createVector(0, random(height));
    } else {
      var new_pos = createVector(width, random(height));
    }
  } else {
    if (n2 < 1) {
      var new_pos = createVector(random(width), 0);
    } else {
      var new_pos = createVector(random(width), height);
    }
  }
  this.pos = pos || new_pos;
  this.stopped = false;
  this.radius = 10;

  this.update = function() {
    this.pos.add(createVector(random(-10, 10), random(-10, 10)));
    for (var i in branches) {
      if (this.pos.dist(branches[i].pos) <= this.radius + branches[i].radius) {
        branches.push(this);
        this.stopped = true;
      }
    }
    if (this.pos.x < 0) {
      this.pos.x = 0;
    } else if (this.pos.x > width) {
      this.pos.x = width;
    }
    if (this.pos.y < 0) {
      this.pos.y = 0;
    } else if (this.pos.y > height) {
      this.pos.y = height;
    }
  }

  this.show = function() {
    if (this.stopped) {
      fill(56, 193, 69);
    } else {
      fill(216, 239, 67);
    }
    ellipse(this.pos.x, this.pos.y, this.radius*2);
  }
}
