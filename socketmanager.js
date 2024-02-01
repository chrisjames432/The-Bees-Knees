// SocketManager.js

var count = 1;


class SocketManager {
    constructor(io) {
      this.io = io;
      this.PLAYER_LIST = {};
      this.initializeSocketEvents();
    }
  
    initializeSocketEvents() {
        this.io.sockets.on('connection', (socket) => {

            const playername = 'Player'+count;
            const player = this.PLAYER_LIST[playername];
            count=count+1

            socket.emit('message', "Welcome "+playername);
            //socket.emit('message',String(this.PLAYER_LIST));



            socket.on('disconnect', () => {
            delete this.PLAYER_LIST[playername];
            console.log(playername, ' left the game');
            });



            socket.on('keys', (data) => {
            this.handleKeys(socket, localplayer, data);
            });


        });
    }
  
    


 
    handleKeys(socket, playername, data) {
     
        if (this.PLAYER_LIST[localplayer] != undefined) {
        this.PLAYER_LIST[playername] = data;
        console.log(this.PLAYER_LIST);
        } 
        else {
        console.log('this player not found');
         }
    }
  
   
    
  }
  
  module.exports = SocketManager;
  