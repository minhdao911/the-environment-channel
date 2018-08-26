const express = require("express"),
	path = require("path"),
	app = express();

const port = process.env.PORT || 3000;

const homePath = path.join(__dirname, "./public/other/home.html");
const projectPath = path.join(__dirname, "./public/demo.html");
const learnMorePath = path.join(__dirname, "./public/other/learn-more.html");

const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

app.get("/", function(req, res) {
	res.sendFile(homePath);
});

app.get("/demo", function(req, res) {
	res.sendFile(projectPath)
});

app.get("/more", function(req, res) {
	res.sendFile(learnMorePath);
});

app.get("/data/:stationName", function(req, res) {
	const stationName = req.params.stationName;
	const data = require(`./data/historical-data/${stationName}`);

	res.send(data);
});

app.get("/data", function(req, res) {
	let date = req.query.date;
	let start = req.query.start;
	let end = req.query.end;
	let result = [];
	let avg = [];
	for(i = Number(start); i<=Number(end); i++){
		let t = i<10 ? "0"+i : i;
		let data = require(`./data/timeseries-data/${date}(${t}).json`);
		let tempCount = 0;
		let humidCount = 0;
		let total = 0;
		for(k=0; k<data.length; k++){
			if(data[k].cod === 200){
				tempCount+=data[k].main.temp;
				humidCount+=data[k].main.humidity;
				total++;
				let timeseries = result[k] == undefined ? [] : result[k].timeseries;
				timeseries.push({
					weather: data[k].weather,
					main: data[k].main,
					wind: data[k].wind,
					coord: data[k].coord
				});
				result[k] = {
					name: data[k].name,
					timeseries: timeseries
				};
			}
			if(k === data.length-1){
				let avgTemp = Math.round(tempCount/total * 100) / 100;
				let avgHumid = Math.round(humidCount/total * 100) / 100;
				avg.push({
					temp: avgTemp,
					humid: avgHumid
				})
			}
		}
	}
	res.send({
		result: result,
		average: avg
	});
});

app.listen(port, (req, res) => {
	console.log("Server is running at port " + port);
});
