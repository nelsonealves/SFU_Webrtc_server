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
}
