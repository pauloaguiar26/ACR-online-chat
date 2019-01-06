const express = require('express');
const router = express.Router();
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
var mongoConfigs = require('./mongoConfigs');
const path = require('path');
const bodyParser = require('body-parser');
var database;

app.use(bodyParser.urlencoded({extended:true}));


mongoConfigs.connect(function(err){
    if(!err){
        server.listen(3000,function(){
			console.log("listening on port 3000");
			database = mongoConfigs.getDB();
        });
    }
});

console.log('Server is running');

const users = [];
const connections = [];


io.on('connection',(socket) => {
    connections.push(socket);
	users.push(socket);
	console.log(' %s sockets connected', connections.length);
	console.log(' %s users connected', users.length);

	//Work
	socket.on('disconnect', () => {
		connections.splice(connections.indexOf(socket), 1);
		users.splice(users.indexOf(socket), 1);
	});


	socket.on('sending message', (message) => {
		console.log('Message is received :', message);
		database.collection('chats').insertOne({msg: message , email: socket.email}); 
		io.emit('message', {'user': socket.username, 'message': message});
	});

	//Work
	socket.on('regist',(data) =>{
		console.log('User tried to regist :', data);
		database.collection('users').find(data).count().then( function (result) {
			console.log(result);
			if (result > 0) {
				console.log("User already Exists");
			}	
			else{
				console.log("Creating new User");
				database.collection('users').insertOne(data); 
			}
		});

	});

	//Work
	socket.on('login',(user) =>{
		console.log('User tried to login :', user);
		if (user['username'] != null) {
			socket.username = user['username'];
			socket.email = user['email'];
			console.log(user['email'])
			database.collection('users').find({email: socket.email, password: user['password']}).count().then( function (result) {
				console.log(result);
				if (result > 0) {
					console.log("Logging in");				
					socket.emit('joining', { 'user': socket.username, 'email': socket.email}); //join chat
				}	
				else{
					console.log("Bad data");
				}
		
			});
		}
		socket.broadcast.emit('message', { user: 'Server', 'message': socket.username + " has joined the server!"});
		
	});


	
});



app.use('/style', express.static(__dirname + '/style'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

