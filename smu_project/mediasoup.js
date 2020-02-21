let mediasoup = require('mediasoup');

let Workers = [];

let Routers = new Map(); // @type {Map<Number>, Router>}
let Webrtc_transport = new Map();
let DataProducer = new Map();
let DataConsumer = new Map();
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
    console.log("Worker criado: id %s",worker.pid);
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
   // console.log('function webrtc')
   const webrtc = await Routers.get(req.params.id_router).createWebRtcTransport(
    {
        listenIps : [ { ip: "192.168.0.8" } ],
        enableUdp : true,
        enableTcp : true,
        preferUdp : true,
        enableSctp: true
    });
    // //console.log(webrtc._internal.transportId);
    
    // // webrtc.connect({"dtlsParameters": webrtc.dtlsParameters})
    // // console.log('Webrtc criado: id %s', webrtc._internal.transportId);
    
    // webrtc.observer.on("newdataconsumer", (dataConsumer) =>
    // {
    // //   console.log("new data consumer created [id:%s]", dataConsumer.id);
    // //   console.log('dataConsumer')
    // //   console.log(dataConsumer);
    // });
    
    // webrtc.observer.on("newdataconsumer", (dataConsumer) =>
    // {
    //   //console.log("new data consumer created [id:%s]", dataConsumer.id);
    // });
    
    // webrtc.observer.on("connect", ({ dtlsParameters }, callback, errback) =>
    // {
    //   // Signal local DTLS parameters to the server side transport.
    //   try
    //   {
    //     //console.log("transportId:" +transport.id+"dtlsParameters:"+dtlsParameters);
          
    
    //     // Tell the transport that parameters were transmitted.
        
    //   }
    //   catch (error)
    //   {
    //    //console.log('error');
    //   }
    // });
    
    
    Webrtc_transport.set(webrtc._internal.transportId, webrtc);
    console.log("Criado Webrtc id:", webrtc._internal.transportId);
    console.log(webrtc)
    res.send({
        id: webrtc._internal.transportId,
        iceParameters: webrtc.iceParameters,
        iceCandidates: webrtc.iceCandidates,
        dtlsParameters: webrtc.dtlsParameters,
        sctpParameters: webrtc.sctpParameters,
        sctpState: webrtc.sctpState
    });
    
}

module.exports.webrtc_connect = async (req, res) => {
    let webrtc1 = Webrtc_transport.get(req.params.transport_id)
    console.log('Conectando ', req.params.transport_id);
    if(webrtc1) await webrtc1.connect({"dtlsParameters": req.body.dtlsParameters});
    res.send({teste:"ok"});
}

module.exports.data_producer = async (req, res) => {
    let webrtc1 = Webrtc_transport.get(req.params.transport_id);
    const dataProducer = await webrtc1.produceData(req.body);
    DataProducer.set(dataProducer._internal.transportId, dataProducer)
    console.log("DataProducer Criado", dataProducer._internal.dataProducerId);
    res.json(dataProducer._internal.dataProducerId);
} 

module.exports.data_consumer = async (req, res) => {
    // console.log("CHEGOU UM DATA CONSUMER PORRAAA");
    // console.log(req.params.transport_id)
    let transportId;
    let dataProducerId;
    DataProducer.forEach((data, key)=> {
    
        if(key != req.body.send_id){
            console.log("Encontrando dataProducer para consumer");
            
            transportId = key;
            dataProducerId = data._internal.dataProducerId;   
            console.log("transportid", key);
            console.log("dataproducerid", dataProducerId);
        }
    })
    let webrtc1 = Webrtc_transport.get(req.body.recv_id);
    const dataConsumer = await webrtc1.consumeData(
        {
          dataProducerId : dataProducerId
        });
    // let webrtc1 = Webrtc_transport.get(req.params.transport_id);
    
    // const dataConsumer = await webrtc1.consumeData(
    //     {
    //       dataProducerId : req.body.res
    //     });
   
    console.log('dataConsumer criado');
    //console.log(dataConsumer);
    res.json(
        {
            id                   : dataConsumer._data.id,
            producerId           : dataProducerId,
            sctpStreamParameters : dataConsumer._data.sctpStreamParameters,
            label                : dataConsumer._data.label,
            protocol             : dataConsumer._data.protocol
        }
    );
    DataConsumer.set(dataConsumer._internal.dataConsumerId, dataConsumer)
}
module.exports.get_parameters_webrtc_transport = async (req, res) => {
    let webrtc = Webrtc_transport.get(req.params.transport_id);
    //console.log(webrtc);

    res.send({
        id: webrtc._internal.transportId,
        //"iceRole": webrtc.iceRole,
        iceParameters: webrtc.iceParameters,
        iceCandidates: webrtc.iceCandidates,
        dtlsParameters: webrtc.dtlsParameters,
        sctpParameters: webrtc.sctpParameters
        
     })
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
    //mediasoup.observer.on()

}

events();


