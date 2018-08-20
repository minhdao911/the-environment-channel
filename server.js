const express = require("express"),
	path = require("path"),
	app = express();

const port = process.env.PORT || 3000;

const homePath = path.join(__dirname, "./public/other/home.html");
const projectPath = path.join(__dirname, "./public");
const learnMorePath = path.join(__dirname, "./public/other/learn-more.html");

app.get("/", function(req, res) {
	res.sendFile(homePath);
});

app.use("/more", express.static(learnMorePath));
app.use("/demo", express.static(projectPath));

app.get("/data/:stationName", function(req, res) {
	const stationName = req.params.stationName;
	const data = require(`./data/historical-data/${stationName}`);

	res.send(data);
});

app.listen(port, (req, res) => {
	console.log("Server is running at port " + port);
});
