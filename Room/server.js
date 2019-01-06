const express = require('express');
const router = express.Router();
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
// var mongoose = require('mongoose');
// mongoose.Promise = require('bluebird');
// mongoose.connect('mongodb://localhost/mevn-chat', { promiseLibrary: require('bluebird') })
// 	.then(() =>  console.log('connection succesful'))
// 	.catch((err) => console.error(err));
const mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var database;
MongoClient.connect("mongodb://localhost:27017/grupo2", function (err,db) {
	if (!err) {
		console.log("Connected to the database");
		database = db;
	}
});


const path = require('path');
const bodyParser = require('body-parser');
server.listen(3000, () => console.log('Listening in Port 3000!'));
console.log('Server is running');

const users = [];
const connections = [];


io.on('connection',(socket) => {
    connections.push(socket);
	users.push(socket);
	console.log(' %s sockets connected', connections.length);
	console.log(' %s users connected', users.length);
	socket.username = 'anonymous';

	socket.on('disconnect', () => {
		connections.splice(connections.indexOf(socket), 1);
		users.splice(users.indexOf(socket), 1);
	});

	socket.on('sending message', (message) => {
		console.log('Message is received :', message);
		io.emit('message', {'user': socket.username, 'message': message});
	});

	socket.on('join', (username)=>{
		if (username != null) {
			socket.username = username;
			// socket.password = password;
		}
		socket.broadcast.emit('message', { user: 'Server', 'message': socket.username + " has joined the server!"})
	});

	
});



app.use('/style', express.static(__dirname + '/style'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

