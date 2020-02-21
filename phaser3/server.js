const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io").listen(server);
const fetch = require('node-fetch');
const port = 3000;


var pid_worker = null,
router_id = null,
transport_id = null;

let user = {user_id: null, send: null, recv: null, player: null, status: false};
var users = [];

app.use("/", express.static(__dirname));

fetch('http://localhost:8081/worker/create', {
    method: 'POST', body: {
        logLevel: "debug",
        logTags: null, 
        rtcMinPort: 10000,
        rtcMaxPort: 20000
    }
}).then(res=>res.json()).then((data)=>{
    console.log('Worker pid %s criado.', data.pid);
    pid_worker = data.pid;
    fetch('http://localhost:8081/worker/'+data.pid+"/create_router",{
      method: 'POST'
    }).then(res => res.json()).then((data) => {
      console.log('Router id %s criado.', data.router_id);
      router_id = data.router_id;
    });

        
        });
console.log('Valores Mediasoup');
console.log('Pid worker: %s', pid_worker);
console.log('Router id: %s', router_id);
console.log('Transport id: %s', transport_id);

io.on("connection", socket => {
  socket.on("notify", id => {
    socket.broadcast.emit("publish", "Novo jogador: " + id);
  });

  socket.on("movement", position => {
    socket.broadcast.emit("renderPlayer", position);
  })

  socket.on('req_transport', req => {
    req.transport_id = {send: null, recv: null};
    if (users.length >= 2){
      socket.emit('res_transport', {data: {status: 400, resp:"length > 2"}});
    } else {
    fetch('http://localhost:8081/router/'+ router_id+"/webrtc_transport/create",{
                method: 'POST'
              }).then(res => res.json()).then((data) => {
                req.transport_id.send = data;
              });

    fetch('http://localhost:8081/router/'+router_id+"/webrtc_transport/create", {
      method: 'POST'
    }).then(res => res.json()).then((data) => {
      console.log("Midia ofertada");
      console.log(data)
      req.transport_id.recv = data;
    });

        req.transport_id.player = users.length;
        setTimeout(()=>{
          users.push(req.transport_id);
          socket.emit('res_transport', {data: {status: 200, resp: req.transport_id}});
        }, 100);
       
      }
  })
  socket.on('player_ok', (data) => {
    users[data].status = true;
    socket.emit("player_ok", users);
    socket.broadcast.emit("player_ok", users);
  })
  
  socket.on("req_params", parameter => {
    fetch('http://localhost:8081/router/'+transport_id+"/webrtc_transport/all_parameters",{
                method: 'GET'
              }).then(res => res.json()).then((data) => {
                parameter = data;
                socket.emit("res_params", data);
              });
      }
  );

  socket.on("connect-webrtc", (data)=> {
    fetch('http://localhost:8081/router/'+data.transport_id+"/webrtc_transport/connect",{
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    }).then(res => res.json()).then((res) => {
      socket.emit("res_connect_webrtc");
    });
  });

  // socket.on("req_dataproducer", data => {
  //   fetch('http://localhost:8081/router/'+data.transport_id+"/webrtc_transport/dataproducer",{
  //     headers: {
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json'
  //     },
  //     method: 'POST',
  //     body: JSON.stringify(data)
  //   }).then((res) => {
  //     socket.emit("res_dataproducer");  
  //   });
    
  // });






  socket.on("req_dataconsumer", (data) => {
    fetch('http://localhost:8081/router/'+data.recv_id+"/webrtc_transport/data_consumer",{
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    }).then(res => res.json()).then((response) => {
      console.log('resposta do dataconsumer');
      console.log(response);
      socket.emit("res_dataconsumer", response); 
    });
    
  });
});

server.listen(port, () => console.log(`Server listening on port ${port}!`));
