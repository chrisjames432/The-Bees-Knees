// Dependencies

var bodyParser = require('body-parser');
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
var path = require('path');
const app = express();

var sessions = require('client-sessions');


var validation = require('express-validator');
var cors = require('cors');

//enables cors
app.use(cors({
	'allowedHeaders': ['sessionId', 'Content-Type'],
	'exposedHeaders': ['sessionId'],
	'origin': '*',
	'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
	'preflightContinue': false
}));


var cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
//app.use(validator());
app.use('/client', express.static(path.join(__dirname, '/client')));
app.use('/client/js', express.static(path.join(__dirname, '/client/js')));
app.use('/client/js/images', express.static(path.join(__dirname, '/client/js')));

app.use(sessions({
	cookieName: 'session',
	secret: 'djdpq,24a2dd5f8v25s6sa38ss0s8dfsdkfj209u834029ukj3333',
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000


}));


app.use(cookieParser());


app.get('/', function (req, res) {
	res.sendFile(__dirname + '/client/index.html');

});





//-----------------------------------------------------------------------------------------------------------------------------------------------------------------


const httpServer = http.createServer(app);

httpServer.listen(8081, () => {
	console.log('HTTP Server running on port 8081');
});





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//set up socket events



function rint(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

//--------------------------------------------------------------------

var io = require('socket.io')(httpServer, {});
//io.set('origins', '*:*');
var PLAYER_LIST = {};



//================================================================

io.sockets.on('connection', function (socket) {
	zz.p('new socket connection');
	var localplayer = '';

	//================================================================

	socket.on('disconnect', function () {


		delete PLAYER_LIST[localplayer];
		io.sockets.emit('removeplayer', localplayer);
		console.log(PLAYER_LIST);

	});





	//================================================================

	socket.on('keys', function (data) {




		if (PLAYER_LIST[localplayer] != undefined) {

			PLAYER_LIST[localplayer] = data;
			console.log('===========================\n');
			console.log(PLAYER_LIST);


		} else {

			console.log('this player must reconnect');
			//socket.emit('login','YOU MUST LOGIN');

		}

	});


	//================================================================

	socket.on('sendchattoserver', function (data) {

		console.log(data);
		io.sockets.emit('addtochat', data);

	});

	//================================================================

	socket.on('signIn', function (data) {

		var user = PLAYER_LIST[data];

		if (user) {

			socket.emit('signInResponse', 'THIS USER EXISTS<BR>PICK ANOTHER NAME');


		} else {
			socket.emit('signInResponse', 'CREATING USER');
			PLAYER_LIST[data] = [0, 0, 200, 0, 200, 0];
			localplayer = data;
		}

		console.log(PLAYER_LIST);

	});

});



//================================================================


setInterval(function () {

	io.sockets.emit('locations', PLAYER_LIST);



}, 1000 / 60);



