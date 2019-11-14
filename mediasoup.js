let mediasoup = require('mediasoup');

let Workers = [];

/*
    Function to create a Worker. A Worker looks like a game environment.
    Parameters:
        @String loglevel
        @Array<String> logTags
        @Number rtcMinPort
        @Number rtcMaxPort
        @Number dtlsCertificateFile
        @Number dtlsPrivateKeyFile
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
            res.send("Found worker");
        }
    });
    
    res.send("Don't found worker! Try again.");
} 


//const rtpCapabilities = mediasoup.getSupportedRtpCapabilities();

    //console.log(rtpCapabilities);
events = () => {

    // Event fire when add a new worker
    mediasoup.observer.on("newworker", (worker) => {
        console.log("new worker created [pid:%d]", worker.pid);
      });

}


