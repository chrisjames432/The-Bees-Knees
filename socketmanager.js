// SocketManager.js

var count = 1;


class SocketManager {
        constructor(io) {
          this.io = io;
          this.PLAYER_LIST = {};
          this.initializeSocketEvents();
          var d = this
          setInterval(function(){
            console.log(d.PLAYER_LIST)
          },500)
        }
      
    initializeSocketEvents() {
          this.io.sockets.on('connection', (socket) => {

              const playername = 'Player'+count;
              this.PLAYER_LIST[playername]={};
              count=count+1

              socket.emit('message',{playername:playername,loc:[0,10,10]} );
              //socket.emit('message',String(this.PLAYER_LIST));


              //////////////////////////

              socket.on('disconnect', () => {
              delete this.PLAYER_LIST[playername];
              console.log(playername, ' left the game');
              });


              //////////////////////
          
              var pl =this
              setInterval(() => {
               
                socket.emit('playerlist',pl.PLAYER_LIST)

              }, 1000/60);

              socket.on('playerData',(data)=>{


                if(this.PLAYER_LIST[playername] != undefined){
                  this.PLAYER_LIST[playername]=data

                }
                
                
              //  console.log(data)


              })
              /////////////////////////////

          });
          //end of on connection



        }
        //end of init sockets
    


   
    //end of class
  }
  
  module.exports = SocketManager;
  