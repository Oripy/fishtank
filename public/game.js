var socket;

var users;
var id_num;

function setup() {
  socket = io.connect();
  var canvas = createCanvas(600, 400);
  canvas.parent('sketch-holder');

  users = [];
  socket.on('connected',
    function(data) {
      id_num = data.id;
      console.log(id_num);
    }
  );

  socket.on('update',
    function(data) {
      console.log(data);
      for (var i in data) {
        users[i] = new Fish(createVector(data[i].x, data[i].y));
      }
      socket.emit('move', {m_x: mouseX, m_y: mouseY})
      redraw();
    }
  );

  noLoop();
}

function Fish(pos) {
  this.pos = pos || createVector(random(width), random(height));

  this.show = function() {
    fill(255);
    ellipse(this.pos.x, this.pos.y, 10);
  }
}

function draw() {
  background(210, 90, 61);
  for (var i in users) {
    users[i].show();
  }
}
