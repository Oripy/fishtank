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

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
    console.log("We have a new client: " + socket.id);

    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);
