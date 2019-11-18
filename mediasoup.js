let mediasoup = require('mediasoup');

let Workers = [];

let Routers = new Map(); // @type {Map<Number>, Router>}

/*
    Function to create a Worker. A Worker looks like a game environment.
    Parameters:
        @param {String} loglevel
        @param {Array<String>} logTags
        @param {Number} rtcMinPort
        @param {Number} rtcMaxPort
        @param {Number} dtlsCertificateFile
        @param {Number} dtlsPrivateKeyFile
*/
module.exports.create_worker = async (req, res) => {
    const worker = await mediasoup.createWorker({
            logLevel   : req.body.logLevel,
            logTags    : req.body.logTags,
            rtcMinPort : req.body.rtcMinPort,
            rtcMaxPort : req.body.rtcMaxPort
        });

    worker.on('died', () => {
        console.log('mediasoup Worker died, exiting  in 2 seconds... [pid:%d]', worker.pid);
            
    });
    console.log(worker);
    Workers.push(worker);
    res.json({"pid": worker.pid});
}

module.exports.close_worker = async (req, res) => {
    
    Workers.forEach((worker, index) => {
        if (worker.pid == req.params.pid_worker) {
            worker.close();
            if (index > -1) {
                Worker.splice(index, 1);
              }
            res.send(`Worker PID: ${worker.pid}. Closed: ${worker.closed}`);
        }
    });
    
}
module.exports.get_all_workers = async (req, res) => {
    let array_workers = [];
    
    Workers.forEach((worker) => {
        array_workers.push(worker.pid);
    });
        
    res.send(array_workers);
} 

module.exports.get_worker_by_pid = async (req, res) => {
        
    Workers.forEach((worker) => {
        if (worker.pid == req.params.pid_worker) {
            console.log(worker);
            res.send("Found worker");
        }
    });
    
    res.send("Didn't find worker! Try again.");
} 

module.exports.create_router = async (req, res) => {
    const mediaCodecs =
    [
      {
        kind        : "audio",
        mimeType    : "audio/opus",
        clockRate   : 48000,
        channels    : 2
      },
      {
        kind       : "video",
        mimeType   : "video/H264",
        clockRate  : 90000,
        parameters :
        {
          "packetization-mode"      : 1,
          "profile-level-id"        : "42e01f",
          "level-asymmetry-allowed" : 1
        }
      }
    ];
    await Workers.forEach((worker) => {
        console.log(worker.pid);
        if (worker.pid == req.params.pid_worker) {
            const router =  worker.createRouter(mediaCodecs);
            console.log(router);
            router.then((router) => {
                console.log(router._internal.routerId);
                Routers.set(router._internal.routerId, router);
                res.send({"router_id": router._internal.routerId});
            });
            
        }
    });
}

module.exports.get_all_router_of_worker = (req, res) => {

}

module.exports.create_webrtc_transport = async (req, res) => {
   const webrtc = await Routers.get(req.params.id_router).createWebRtcTransport(
    {
        listenIps : [ { ip: "192.168.0.4" } ],
        enableUdp : true,
        enableTcp : true,
        preferUdp : true,
        enableSctp: true
    });
    console.log(webrtc);
    console.log('getStats()');
    console.log(webrtc.getStats());
    res.send("Webrtc Transport created");
}

module.exports.get_router_by_id = (req, res) => {
    console.log(Routers.get(req.params.id_router));
    res.send("Router found");
}
//const rtpCapabilities = mediasoup.getSupportedRtpCapabilities();

    //console.log(rtpCapabilities);
events = () => {

    // Event fire when add a new worker
    mediasoup.observer.on("newworker", (worker) => {
        console.log("New worker created [pid:%d]", worker.pid);
      });

}

events();


