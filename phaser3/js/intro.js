import { cena1 } from "./cena1.js";
import {
    types,
    version,
    detectDevice,
    Device,
    parseScalabilityMode
  } from "mediasoup-client";
  

var intro = new Phaser.Scene("Intro");

intro.user = {user_id: null, send: null, recv: null, status: false};

intro.preload = function() {
    this.load.image("sky", "assets/sky.png");
    this.load.spritesheet("green", "assets/green.png", {
        frameWidth: 64,
        frameHeight: 64
    });

    this.load.spritesheet("red", "assets/red.png", {
        frameWidth: 64,
        frameHeight: 64
    });

    this.device = new Device();

    const routerRtpCapabilities =
    [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2
      },
      {
        kind: "video",
        mimeType: "video/H264",
        clockRate: 90000,
        parameters:
        {
          "packetization-mode": 1,
          "profile-level-id": "42e01f",
          "level-asymmetry-allowed": 1
        }
      }
    ];

    this.device.load({routerRtpCapabilities});
    console.log('this.device');
    console.log(this.device);
    
}


intro.create = function() {
    this.add.image(400, 300, "sky");
    this.socket = io();
    
    this.socket.on("connect", () => {
        console.log("Jogador %s conectado ao servidor.", this.socket.id);
        intro.user.user_id = this.socket.id;
        this.socket.emit("notify", this.socket.id);
      });
   
      

      
    
    this.status1 = this.add.sprite(200, 100 , "red");
    this.status2 = this.add.sprite(500, 100 , "red");
    this.text1 = this.add.text(150, 150, "Estabelecendo conexão...", {
        fontSize: "18px",
        fill: "#000"
      }); 
    this.text2 = this.add.text(450, 150, "Estabelecendo conexão...", {
        fontSize: "18px",
        fill: "#000"
      });

        // Listen response server with ice parameters
    
    
    this.socket.on("res_params", (data)=>{
        state = state[1];
        if (data == '404') {
            this.socket.emit('req_params');
        } else {
            console.log('res_params');
            console.log(data);
            
            
            // const receive = this.device.createRecvTransport(data);
            //console.log(transport);
            // console.log(receive);

        }
            
    });

    this.socket.on('res_transport', data => {
        this.user.player = data.data.resp.player;
        this.send = this.device.createSendTransport(data.data.resp.send);
        console.log('webrtc transport');
        this.user.send = data.data.resp.send;
        console.log(this.send);
        this.recv = this.device.createRecvTransport(data.data.resp.recv);
        console.log('webrtc recv');
        this.user.recv = data.data.resp.recv;
        console.log(this.recv);
        
        this.user.status = true;
        this.socket.emit('player_ok', data.data.resp.player);


        this.send.on("connect", ({ dtlsParameters }, callback, errback) => {
          console.log("CONNNNECCT");
          intro.socket.emit("connect-webrtc", {dtlsParameters: dtlsParameters, transport_id: intro.send.id});
          intro.socket.on("res_connect_webrtc",()=>{
            callback();
          });
          
        })
        this.send.on("producedata", (parameters, callback, errback) => {
          try{  
            console.log("PRODUCE DATAAAA");
            fetch('http://localhost:8081/router/'+intro.send.id+"/webrtc_transport/data_producer",{
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              method: 'POST',
              body: JSON.stringify({sctpStreamParameters : parameters.sctpStreamParameters})
            }).then(res => res.json()).then((res) => {
              const {id} = res;
              console.log("esse é o res")
              console.log(res);
              callback({id});
            });
          }
          catch (error) {
            errback(error);
          }
        });

        this.sendProduce = this.send.produceData();

    })

    this.socket.on("transport-connect", (data)=> {
      console.log('transport-connect');
      console.log(data);
    })




    this.socket.on('player_ok', (data) => {
      console.log('Recebeu ok do player %s', data);
      for (let i = 0; i < data.length; i++) {
        console.log('usuario', data[i].player);
        if (data[i].status){
          if(data[i].player == 0) {
            this.status1.setTexture('green');
            this.text1.setText("Player1 preparado...");
          } else {
            this.status2.setTexture('green');
            this.text2.setText("Player2 preparado...");
          }
          if(data.length == 2) {
            console.log("DESCOBRIR ID DO DATA PRODUCER");
            console.log(this.send);
            
            
            let button = this.add
              .image(800 - 16, 16, "fullscreen", 0)
              .setOrigin(1, 0)
              .setInteractive()
              .on('pointerdown', () => this.scene.start(cena1) );;
          }
          
        }
        
        
      }
        
    });

    
    this.socket.emit('req_transport', intro.user);
    
    
}


intro.update = function() {
    
    // switch (state) {
    //     case 'req_ice': 
            
    //         break;
    //     case 'connect':
    // }
}

export {intro}