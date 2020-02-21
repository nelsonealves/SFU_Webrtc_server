let mediasoup = require('../mediasoup');
module.exports.create_worker = async function (req, res) {
    console.log(mediasoup);
    let worker = await mediasoup.createWorker({logLevel: "warn"});
}