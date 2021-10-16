const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Setting up static files
app.use(express.static('public'));

// Creating default route 
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// Players list
let players = {};

// initial variable to determine if a played has been matched
let unmatched = null; 



io.sockets.on("connection", function (socket) {
	console.log("socket connected")
	joinGame(socket);

	if (getOpponent(socket)) {
		socket.emit("game.begin", {
			symbol: players[socket.id].symbol,
    	});
		getOpponent(socket).emit("game.begin", {
			symbol: players[getOpponent(socket).id].symbol,
    	});
  	}

  	socket.on("make.move", function (data) {
    	if (!getOpponent(socket)) {
      		return;
    	}
    	socket.emit("move.made", data);
    	getOpponent(socket).emit("move.made", data);
  	});

  	socket.on("disconnect", function () {
    	if (getOpponent(socket)) {
      		getOpponent(socket).emit("opponent.left");
    	}
  	});
});


// Function to match players
function joinGame(socket) {
	players[socket.id] = {
    	opponent: unmatched,

    	symbol: "X",
   		// The socket that is associated with this player
   		socket: socket,
	};
  	if (unmatched) {
		players[socket.id].symbol = "O";
    	players[unmatched].opponent = socket.id;
   		unmatched = null;
	} else {
		unmatched = socket.id;
  	}
}


function getOpponent(socket) {
  if (!players[socket.id].opponent) {
    return;
  }
  return players[players[socket.id].opponent].socket;
}


http.listen(3000, ()=> {
	console.log('listening on *:3000');
})
