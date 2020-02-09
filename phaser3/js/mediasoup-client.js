

class Mediasoup_client {
  constructor (){
    
  }

  new_device(){
    return new Device();
  }

  
}
     
export {Mediasoup_client}
//     }

    // createRouter = (pidWorker) => {}

    // get_version = () => {
    //     return version;
    // };

    // create_device = () => {
    //     return new Device();
    // };
    
    // load = (device) => {
    //     const routerRtpCapabilities =
    //       [
    //         {
    //           kind: "audio",
    //           mimeType: "audio/opus",
    //           clockRate: 48000,
    //           channels: 2
    //         },
    //         {
    //           kind: "video",
    //           mimeType: "video/H264",
    //           clockRate: 90000,
    //           parameters:
    //           {
    //             "packetization-mode": 1,
    //             "profile-level-id": "42e01f",
    //             "level-asymmetry-allowed": 1
    //           }
    //         }
    //       ];
    //     await device.load({ routerRtpCapabilities });
    //     console.log(device);
    //     if (!device.canProduce('video')) {
    //       console.warn('cannot produce video');
      
    //       // Abort next steps.
    //     }
    //   };
}

  

  

  

  

  
  
  
  
  // const { 
  //   id, 
  //   iceParameters, 
  //   iceCandidates, 
  //   dtlsParameters,
  //   sctpParameters
  // } = await mySignaling.request(
  //   'createTransport',
  //   {
  //     sctpCapabilities : device.sctpCapabilities
  //   });
  
  // // Create the local representation of our server-side transport.
  // const sendTransport = device.createSendTransport(
  //   {
  //     id, 
  //     iceParameters, 
  //     iceCandidates, 
  //     dtlsParameters,
  //     sctpParameters
  


