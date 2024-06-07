// Dependencies

var bodyParser = require('body-parser');
const http = require('http');
const express = require('express');
var path = require('path');
const app = express();
const SocketManager = require('./SocketManager'); // Import the SocketManager class
var sessions = require('client-sessions');
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

const io = require('socket.io')(httpServer);
const socketManager = new SocketManager(io); // Create an instance

