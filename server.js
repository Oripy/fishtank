// Based off of Shawn Van Every's Live Web
// http://itp.nyu.edu/~sve204/liveweb_fall2013/week3.html

// Using express: http://expressjs.com/
var express = require('express');
// Create the app
var app = express();

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(server_port, listen);

// This call back just tells us that the server has started
function listen() {
  //var host = server.address().address;
  //var port = server.address().port;
  console.log('Fishtank app listening at http://' + server_ip_address + ':' + server_port);
}

app.use(express.static('public'));

// WebSocket Portion
// WebSockets work with the HTTP server
var socket = require('socket.io')
var io = socket(server);

var users = [];


function Fish(x, y) {
  this.x = x || Math.random()*600;
  this.y = y || Math.random()*400;
  this.v_x = 1;
  this.v_y = 1;
  this.a_x = 0;
  this.a_y = 0;

  this.applyForce = function(f_x, f_y) {
    this.a_x += f_x;
    this.a_y += f_y;
    // this.acc.add(force.limit(this.maxForce).mult(1/(this.mass*.5)));
  }

  this.seek = function(t_x, t_y) {
    var desired_x = t_x - this.x;
    var desired_y = t_y - this.y;

    var mag = Math.sqrt(desired_x*desired_x + desired_y*desired_y);
    desired_x = desired_x/mag;
    desired_y = desired_y/mag;

    desired_x *= 2;
    desired_y *= 2;
    // desired.setMag(this.maxVel);
    var steer_x = desired_x - this.v_x;
    var steer_y = desired_y - this.v_y;

    this.applyForce(steer_x, steer_y);
  }

  this.update = function() {
    this.v_x += this.a_x;
    this.v_y += this.a_y;
    this.x += this.v_x;
    this.y += this.v_y;
    this.a_x = 0;
    this.a_y = 0;
  }
}

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
    console.log("We have a new client: " + socket.id);
    socket.emit('connected', {id: socket.id});

    users[socket.id] = new Fish();

    // socket.on('new', function (data) {
    //     console.log('new user ' + data.id);
    //     users.push(data);
    // }

    socket.on('move',
      function (data) {
        users[socket.id].seek(data.m_x, data.m_y);
      }
    );

    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);

var interval = setInterval(function () {
  // console.log('tick');
  data = {};
  for (var i in users) {
    users[i].update();
    data[i] = {};
    data[i].x = users[i].x;
    data[i].y = users[i].y;
  }
  io.sockets.emit('update', data);
}, 50);
