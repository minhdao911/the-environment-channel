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

app.listen(port, (req, res) => {
	console.log("Server is running at port " + port);
});
