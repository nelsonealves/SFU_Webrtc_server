module.exports =  (express) => {

	express.post('/worker/create',(req, res) => {
		express.mediasoup.create_worker(req, res);
	})

	express.post('/worker/close/:pid_worker',(req, res) => {
		express.mediasoup.close_worker(req, res);
	})

	express.get('/worker/all',(req, res) => {
		express.mediasoup.get_all_workers(req, res);
	})

	express.get('/worker/:pid_worker',(req, res) => {
		express.mediasoup.get_worker_by_pid(req, res);
	})

	express.get('/worker/codes',(req, res) => {
		express.mediasoup.get_worker_codecs(req, res);
	})
	
	express.post('/worker/:pid_worker/create_router',(req, res) => {
		express.mediasoup.create_router(req, res);
	})

	express.post('/router/:id_router/webrtc_transport/create',(req, res) => {
		express.mediasoup.create_webrtc_transport(req, res);
	})

	express.get('/router/:id_router',(req, res) => {
		express.mediasoup.get_router_by_id(req, res);
	})
}
