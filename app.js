// Dependencies
require('dotenv').config();

var bodyParser = require('body-parser');
const http = require('http');
const express = require('express');
var path = require('path');
const app = express();
const SocketManager = require('./SocketManager'); // Import the SocketManager class
var sessions = require('client-sessions');
var cors = require('cors');

// Check dev flag from .env
const isDev = process.env.dev === 'true';
console.log(`🚀 Running in ${isDev ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
console.log(`📁 Serving from: ${isDev ? 'client/index.html' : 'live_server/index.html'}`);

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

// Conditional static file serving based on dev flag
if (isDev) {
    // Development mode - serve from client folder
    app.use('/client', express.static(path.join(__dirname, '/client')));
    app.use('/client/js', express.static(path.join(__dirname, '/client/js')));
    app.use('/client/js/glb', express.static(path.join(__dirname, '/client/js/glb')));
    app.use('/client/audio', express.static(path.join(__dirname, '/client/audio')));
    // Serve three.js from node_modules for development
    app.use('/three', express.static(path.join(__dirname, 'node_modules/three')));
;
} else {
    // Production mode - serve from live_server folder + client assets
    app.use('/client/js/glb', express.static(path.join(__dirname, '/client/js/glb')));
    app.use('/client/audio', express.static(path.join(__dirname, '/client/audio')));
    app.use('/client/images', express.static(path.join(__dirname, '/client/images')));
    // In production, Three.js is bundled into the HTML file
}

app.use(sessions({
	cookieName: 'session',
	secret: 'djdpq,24a2dd5f8v25s6sa38ss0s8dfsdkfj209u834029ukj3333',
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000
}));


app.use(cookieParser());

app.get('/', function (req, res) {
    if (isDev) {
        res.sendFile(__dirname + '/client/index.html');
    } else {
        res.sendFile(__dirname + '/live_server/index.html');
    }
});

// Debug route to check if server is running
app.get('/api/status', function (req, res) {
	res.json({ status: 'Server is running' });
});

// Add route to check if GLB files are accessible
app.get('/api/check-files', function (req, res) {
	const fs = require('fs');
	const files = [
		'/client/js/glb/flower.glb',
		'/client/js/glb/PineTrees.glb',
		'/client/js/glb/beemodle.glb'
	];
	
	const results = {};
	files.forEach(file => {
		const fullPath = path.join(__dirname, file);
		try {
			const stats = fs.statSync(fullPath);
			results[file] = {
				exists: true,
				size: stats.size,
				path: fullPath
			};
		} catch (error) {
			results[file] = {
				exists: false,
				error: error.message
			};
		}
	});
	
	res.json(results);
});

// Add route to check if audio files are accessible
app.get('/api/check-audio', function (req, res) {
	const fs = require('fs');
	const files = [
		'/client/audio/nature_ambient.mp3',
		'/client/audio/bump.mp3'
	];
	
	const results = {};
	files.forEach(file => {
		const fullPath = path.join(__dirname, file);
		try {
			const stats = fs.statSync(fullPath);
			results[file] = {
				exists: true,
				size: stats.size,
				path: fullPath
			};
		} catch (error) {
			results[file] = {
				exists: false,
				error: error.message
			};
		}
	});
	
	res.json(results);
});

//-----------------------------------------------------------------------------------------------------------------------------------------------------------------

const PORT = process.env.PORT || 8081;
const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
	console.log(`HTTP Server running on port ${PORT}`);
	console.log(`Access the game at http://localhost:${PORT}`);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//set up socket events

const io = require('socket.io')(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const socketManager = new SocketManager(io); // Create an instance

