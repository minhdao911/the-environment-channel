(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
//begin of air quality config
const pm10_break_points = [50, 100, 250, 350, 430];
const pm25_break_points = [30, 60, 90, 120, 250];
const no2_break_points = [40, 80, 180, 280, 400];
const so2_break_points = [40, 80, 380, 800, 1600];
const nh3_break_points = [200, 400, 800, 1200, 1800];
const o3_break_points = [50, 100, 168, 208, 748];
const aqi_break_points = [50, 100, 150, 200, 300];

const htmlDisplay = {
	pm10: "PM<sub>10</sub>",
	pm25: "PM<sub>2.5</sub>",
	no2: "NO<sub>2</sub>",
	nh3: "NH<sub>3</sub>",
	o3: "O<sub>3</sub>",
};

const breakPoints = {
	pm10_break_points,
	pm25_break_points,
	no2_break_points,
	so2_break_points,
	nh3_break_points,
	o3_break_points,
	aqi_break_points,
};

const airNameMap = {
	no2: "Nitrogen dioxide (ug/m3)",
	pm10: "Particulate matter < 10 µm (ug/m3)",
	pm25: "Particulate matter < 2.5 µm (ug/m3)",
	o3: "Ozone (ug/m3)",
	so2: "Sulphur dioxide (ug/m3)",
};

const scoreCount = (arr, value) => {
	return Math.log(value) / Math.log(arr[4]) * 100 + "%";
};

const breakPointCheck = (arr, value) => {
	if (value <= arr[0]) {
		//green
		return "#14a76c";
	} else if (value <= arr[1]) {
		//yellow
		return "#ffe400";
	} else if (value <= arr[2]) {
		//orange
		return "#ff652f";
	} else if (value <= arr[3]) {
		//pink
		return "#c3073f";
	} else if (value <= arr[4]) {
		//purple
		return "#950740";
	} else {
		//red
		return "#950740";
	}
};

const qualityCheck = (arr, value) => {
	if (value <= arr[0]) {
		return "Good";
	} else if (value <= arr[1]) {
		return "Moderate";
	} else if (value <= arr[2]) {
		return "Unhealthy";
	} else if (value <= arr[3]) {
		return "Very Unhealthy";
	} else {
		return "Hazardous";
	}
};
//end of air quality config

//set up functions
const displayChart = (airName, days, historicalData) => {
	if (historicalData) {
		const displayData = historicalData.slice(
			historicalData.length - days * 24,
			historicalData.length,
		);

		const canvasDiv = document.querySelector(".canvas");
		canvasDiv.innerHTML = "";
		const canvas = document.createElement("canvas");
		canvas.id = "myChart";
		canvasDiv.appendChild(canvas);

		const ctx = document.getElementById("myChart").getContext("2d");
		const myChart = new Chart(ctx, {
			type: "line",
			data: {
				labels: displayData.map(e => {
					return `${e.d}/${e.m} - ${e.Time}`;
				}),
				datasets: [
					{
						label: "Amount (ug/m3)",
						data: displayData
							.map(e => e[airNameMap[airName]])
							.map(e => Math.abs(e)),
					},
				],
			},
			options: {
				scales: {
					yAxes: [
						{
							ticks: {
								beginAtZero: true,
							},
						},
					],
				},
				title: {
					display: true,
					text: `Air quality data last ${days} days`,
				},
			},
		});
	} else {
		canvasDiv.innerHTML = "Historical data of this station is not available!";
	}
};

const dataCategories = [
	"Nitrogen dioxide (ug/m3)",
	"Ozone (ug/m3)",
	"Particulate matter < 10 µm (ug/m3)",
	"Particulate matter < 2.5 µm (ug/m3)",
	"Sulphur dioxide (ug/m3)",
];

const analyzeHourlyData = (hourlyData, dangerLevel) => {
	let result = 1; //clean air

	Object.entries(airNameMap).forEach(element => {
		const airShortName = element[0];
		const airFullName = element[1];

		if (dangerLevel === 0 ){
			if (
				hourlyData[airFullName] >
				breakPoints[`${airShortName}_break_points`][dangerLevel]
			) {
				result = 0; //bad air
			}
		} else {
			if (
				hourlyData[airFullName] >
				breakPoints[`${airShortName}_break_points`][dangerLevel - 1]
			) {
				result = 0; //bad air
			}
		}
	});

	return result;
};

const analyzeData = (historicalData, dangerLevel) => {
	const numberOfDays = historicalData.length / 24;
	const processDataArray = [...new Array(24)].map(() => 0);

	historicalData.forEach((hourlyData, index) => {
		const hour = index % 24;
		processDataArray[hour] += analyzeHourlyData(hourlyData, dangerLevel);
	});

	const resultArray = processDataArray.map(e => {
		const rate = e / numberOfDays * 100;
		const processRate = dangerLevel === 0 ? rate : 100 - rate; //level 0 has different formula
		return parseFloat(processRate.toFixed(2));
	});

	return resultArray;
};

const displayStatChart = (historicalData, dangerLevel) => {
	const hourArray = [...new Array(24)].map((e, i) => `${i}:00`);

	const canvasDiv = document.querySelector(".stat-canvas");
	canvasDiv.innerHTML = "";
	const canvas = document.createElement("canvas");
	canvas.id = "stat-canvas";
	canvasDiv.appendChild(canvas);

	const ctx = document.getElementById("stat-canvas").getContext("2d");
	const myChart = new Chart(ctx, {
		type: "line",
		data: {
			labels: hourArray,
			datasets: [
				{
					label: "Percentage (%)",
					data: analyzeData(historicalData, dangerLevel),
				},
			],
		},
		options: {
			scales: {
				yAxes: [
					{
						ticks: {
							beginAtZero: true,
							max: 100,
						},
					},
				],
			},
			title: {
				display: true,
				text: `Air quality stats`,
			},
		},
	});
};

const doRecursiveRequest = (url, limit) => {
	return fetch(url)
		.then(res => res.json())
		.then(res => {
			if (res.status === "nug" && --limit) {
				return doRecursiveRequest(url, limit);
			}
			return res;
		});
};

module.exports = {
	htmlDisplay,
	breakPoints,
	airNameMap,
	scoreCount,
	breakPointCheck,
	qualityCheck,
	displayChart,
	doRecursiveRequest,
	analyzeHourlyData,
	analyzeData,
	displayStatChart,
};

},{}],2:[function(require,module,exports){
var {
	htmlDisplay,
	breakPoints,
	airNameMap,
	scoreCount,
	breakPointCheck,
	qualityCheck,
	displayChart,
	doRecursiveRequest,
	analyzeHourlyData,
	analyzeData,
	displayStatChart,
} = require("./handler");

var width = window.innerWidth,
	height = window.innerHeight,
	scale = Math.min(width, height) * 0.35,
	globeZoomedScale = 35,
	sens = 0.25,
	origin = [0, 0],
	velocity = [0.0015, -0.0003],
	t = Date.now(),
	start = true,
	focused;

const weatherKeyArray = [
	// "d7dfe147284d7ec8e4a5f8e1a7bb2812",
	"afaa0e32c277554df53bc840221a792d",
	"47f39f44428b8de9e62ab25171587f69",
	"7257c0ef6e1cf3d7b539d9d24ef1b052",
	"aa5f83559f473e3819da097970e22fef",
	"6c3bcae594cfbfaf61177ee366398aad",
	"6bcd4d8208862c56e49824c1f8897f53",
];

const randomNumber = Math.floor(Math.random() * weatherKeyArray.length); //temporary solution to avoid over quota

var weatherKey = weatherKeyArray[randomNumber],
	weatherUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${weatherKey}&units=metric&q=`;

console.log(weatherKey);

var countryScale = Math.min(width, height) * 5,
	countryZoomedScale = 5,
	centered;

//set up helper
const optionButtons = document.querySelector(".options");

const instructionsDiv = document.querySelector("#instructions");
const toggleInstructions = instructionsDiv.querySelector(".helper");
const helperInfo = instructionsDiv.querySelector(".helper-info");
const toggleIndicator = instructionsDiv.querySelector(".helper-toggle");

toggleInstructions.addEventListener("click", e => {
	const height = helperInfo.clientHeight;

	if (
		instructionsDiv.style.transform === "" ||
		instructionsDiv.style.transform === "translateY(0px)"
	) {
		instructionsDiv.style.transform = `translateY(${height}px)`;
		toggleIndicator.innerHTML = "+";
	} else {
		instructionsDiv.style.transform = "translateY(0px)";
		toggleIndicator.innerHTML = "-";
	}
});

const colorLegends = document.querySelector("#color-legends");
const colorHelper = colorLegends.querySelector(".color-helper");
const colorInfo = colorLegends.querySelector(".color-info");
const colorToggleIndicator = colorLegends.querySelector(".color-toggle");

colorHelper.addEventListener("click", e => {
	const height = colorInfo.clientHeight;

	if (
		colorLegends.style.transform === "" ||
		colorLegends.style.transform === "translateY(0px)"
	) {
		colorLegends.style.transform = `translateY(${height}px)`;
		colorToggleIndicator.innerHTML = "+";
	} else {
		colorLegends.style.transform = "translateY(0px)";
		colorToggleIndicator.innerHTML = "-";
	}
});

//----
var tooltip = d3.select("#tooltip"),
	countryList = d3
		.select("#globe")
		.append("select")
		.attr("name", "countries"),
	notiText = d3
		.select("body")
		.append("p")
		.text("This country is unsupported at the moment")
		.attr("class", "noti"),
	closeCountry = d3
		.select("#country")
		.append("p")
		.text("Close")
		.attr("class", "close"),
	closeNoti = d3
		.select("body")
		.append("p")
		.text("Close")
		.attr("class", "close"),
	options = d3.selectAll(".options").style("display", "none");

$(".noti").css({
	left: width / 2 - 200,
	top: height / 2,
});

var tempBtn = $("#tempBtn"),
	windBtn = $("#windBtn"),
	humidBtn = $("#humidBtn"),
	timeBtn = $("#timeBtn"),
	formBtn = $("#formBtn"),
	timeSeriesFrom = $("#timeseries-form"),
	timeSeriesInfoDiv = $("#timeseries-info-div"),
	timeSeriesTime = $("#timeseries-time"),
	timeSeriesInfo = $("#timeseries-info");

var svgGlobe = d3
	.select("#globe")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
	.style("display", "block");

svgGlobe
	.append("path")
	.datum({ type: "Sphere" })
	.attr("class", "water")
	.attr("d", path)
	.attr("fill", "yellow");

//Set up outerspace

var space = d3.geo.azimuthalEquidistant().translate([width / 2, height / 2]);

var spaceScale = space.scale() * 3;
space.scale(spaceScale);

var spacePath = d3.geo
	.path()
	.projection(space)
	.pointRadius(1);

var starList = createStars(300);

var stars = svgGlobe
	.append("g")
	.selectAll("g")
	.data(starList)
	.enter()
	.append("path")
	.attr("class", "star")
	.attr("d", function(d) {
		spacePath.pointRadius(d.properties.radius);
		return spacePath(d);
	});

//Set up Earth

var projection = d3.geo
	.orthographic()
	.scale(scale)
	.rotate([0, 0])
	.translate([width / 2, height / 2])
	.clipAngle(90);

var path = d3.geo
	.path()
	.projection(projection)
	.pointRadius(2);

/* ======= Country Set Up ======= */

var svgCountry = d3
	.select("#country")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
	.style("display", "none");

var country = d3.geo
	.mercator()
	.scale(countryScale * countryZoomedScale)
	.rotate([-26, -64.5, 0])
	.translate([width / 2, height / 2]);

var countryPath = d3.geo.path().projection(country);

var g = svgCountry.append("g");

/* =========================== */

queue()
	.defer(d3.json, "../data/world-110m.json")
	.defer(d3.tsv, "../data/world-110m-country-names.tsv")
	.await(ready);

//Main function

function ready(error, world, countryData) {
	var countryById = {},
		countries = topojson.feature(world, world.objects.countries).features;

	//Adding countries to select

	countryData.forEach(function(d) {
		countryById[d.id] = d.name;
		option = countryList.append("option");
		option.text(d.name);
		option.property("value", d.id);
	});

	//Drawing countries on the globe

	projection.clipAngle(180);

	var backCountry = svgGlobe
		.selectAll("path.land")
		.data(countries)
		.enter()
		.append("path")
		.attr("class", "back-country")
		.attr("d", path)
		.on("mouseover", d => mouseover(d))
		.on("mouseout", d => mouseout(d))
		.on("mousemove", d => mousemove(d))
		.on("click", d => choose(d.id));

	projection.clipAngle(90);

	var frontCountry = svgGlobe
		.selectAll("path.land")
		.data(countries)
		.enter()
		.append("path")
		.attr("class", "front-country")
		.attr("d", path)
		.on("mouseover", d => mouseover(d))
		.on("mouseout", d => mouseout(d))
		.on("mousemove", d => mousemove(d))
		.on("dblclick", d => choose(d.id));

	spin(true);

	//Drag event

	d3.select("body").call(
		d3.behavior
			.drag()
			.origin(function() {
				var r = projection.rotate();
				return {
					x: r[0] / sens,
					y: -r[1] / sens,
				};
			})
			.on("drag", drag),
	);

	//Country focus on option select

	d3.select("select").on("change", function() {
		choose(this.value);
	});

	closeNoti.on("click", function() {
		notiText.style("display", "none");
		closeNoti.style("display", "none");
		svgGlobe.style("display", "block");
		d3
			.transition()
			.duration(2000)
			.tween("zoomout", function() {
				let curScale = projection.scale();
				let curSpaceScale = space.scale();
				return function(t) {
					let scl =
						t > 0.9995 ? scale : curScale - t * globeZoomedScale * scale;
					let spaceScl =
						t > 0.9995
							? spaceScale
							: curSpaceScale - t * globeZoomedScale * spaceScale;
					projection.scale(scl);
					projection.clipAngle(180);
					svgGlobe.selectAll("path.back-country").attr("d", path);
					projection.clipAngle(90);
					svgGlobe.selectAll("path.front-country").attr("d", path);
					space.scale(spaceScl);
					redrawStars();
					svgGlobe.attr("opacity", t);
					if (t >= 1) {
						countryList.style("display", "block");
					}
				};
			});
	});

	function getCountry(cnt, sel) {
		for (var i = 0; i < cnt.length; i++) {
			if (cnt[i].id == sel) {
				return cnt[i];
			}
		}
	}

	function mouseover(d) {
		tooltip.select("#name").text(countryById[d.id]);
		tooltip.select("#value").text("");
		setWeatherData("", "", "", "");
		tooltip
			.style("left", d3.event.pageX + "px")
			.style("top", d3.event.pageY - 80 + "px")
			.style("display", "block")
			.style("opacity", 1);
	}

	function mouseout(d) {
		tooltip.style("opacity", 0).style("display", "none");
	}

	function mousemove(d) {
		tooltip
			.style("left", d3.event.pageX + "px")
			.style("top", d3.event.pageY - 80 + "px");
	}

	function choose(d) {
		countryList.style("display", "none");
		start = false;
		var rotate = projection.rotate(),
			focusedCountry = getCountry(countries, d),
			p = d3.geo.centroid(focusedCountry);
		svgGlobe.selectAll(".focused").classed("focused", (focused = false));
		if (
			Math.round(rotate[0]) === -Math.round(p[0]) &&
			Math.round(rotate[1]) === -Math.round(p[1])
		) {
			rotate = [rotate[0], rotate[1] + 360];
		}

		//Globe movement

		(function transition() {
			d3
				.transition()
				.duration(2500)
				.tween("rotate", function() {
					var r = d3.interpolate(rotate, [-p[0], -p[1]]);
					return function(t) {
						projection.rotate(r(t)).clipAngle(180);
						svgGlobe
							.selectAll("path.back-country")
							.attr("d", path)
							.classed("focused", function(d, i) {
								return d.id == focusedCountry.id ? (focused = d) : false;
							});
						projection.rotate(r(t)).clipAngle(90);
						svgGlobe
							.selectAll("path.front-country")
							.attr("d", path)
							.classed("focused", function(d, i) {
								return d.id == focusedCountry.id ? (focused = d) : false;
							});
						space.rotate(r(t));
						redrawStars();
					};
				})
				.transition()
				.tween("zoomin", function() {
					return function(t) {
						projection.scale(t * globeZoomedScale * scale + scale);
						projection.clipAngle(180);
						svgGlobe.selectAll("path.back-country").attr("d", path);
						projection.clipAngle(90);
						svgGlobe.selectAll("path.front-country").attr("d", path);
						space.scale(t * globeZoomedScale * spaceScale + spaceScale);
						redrawStars();
						svgGlobe.attr("opacity", 1 - t);
						if (t >= 1) {
							svgGlobe.style("display", "none");
							helperInfo.innerHTML = `
              <div>
                You can click/hover on a city or a station.
              </div>
              <div>
                You can see environmental data by clicking </br>on the buttons on the top-right corner.
              </div>
              `;
							if (d == 246) {
								closeCountry.style("display", "block");
								svgCountry.style("display", "block");
								queue()
									.defer(d3.json, "../data/countries/finland.json")
									.defer(d3.csv, "../data/countries/finland.csv")
									.defer(
										d3.json,
										"https://api.waqi.info/search/?token=cc9ba5f6999c729c8b1b36646f4c6f94c4b97ad8&keyword=finland",
									)
									.await(loadMap);
							} else {
								closeNoti.style("display", "block");
								notiText.style("display", "block");
							}
						}
					};
				});
		})();
	}

	function spin() {
		var timer = d3.timer(function() {
			if (start) {
				let dt = Date.now() - t;
				projection
					.rotate([origin[0] + velocity[0] * dt, origin[1] + velocity[1] * dt])
					.clipAngle(180);
				svgGlobe.selectAll("path.back-country").attr("d", path);
				projection
					.rotate([origin[0] + velocity[0] * dt, origin[1] + velocity[1] * dt])
					.clipAngle(90);
				svgGlobe.selectAll("path.front-country").attr("d", path);
				space.rotate([
					origin[0] + velocity[0] * dt,
					origin[1] + velocity[1] * dt,
				]);
				redrawStars();
			}
		});
	}

	function drag() {
		start = false;
		var rotate = projection.rotate();
		projection
			.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]])
			.clipAngle(180);
		svgGlobe.selectAll("path.back-country").attr("d", path);
		svgGlobe.selectAll(".focused").classed("focused", (focused = false));
		projection
			.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]])
			.clipAngle(90);
		svgGlobe.selectAll("path.front-country").attr("d", path);
		svgGlobe.selectAll(".focused").classed("focused", (focused = false));
		space.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
		redrawStars();
	}
}

function redrawStars() {
	stars.attr("d", function(d) {
		spacePath.pointRadius(d.properties.radius);
		return spacePath(d);
	});
}

function createStars(number) {
	var data = [];
	for (var i = 0; i < number; i++) {
		data.push({
			geometry: {
				type: "Point",
				coordinates: randomLonLat(),
			},
			type: "Feature",
			properties: {
				radius: Math.random() * 1.5,
			},
		});
	}
	return data;
}

function randomLonLat() {
	return [Math.random() * 360 - 180, Math.random() * 180 - 90];
}

/* ======= Country Functions ======= */

function loadMap(err, json, csv, stations) {
	var tempOn = false,
		windOn = false,
		humidOn = false;

	tempBtn.css("display", "block");
	windBtn.css("display", "block");
	humidBtn.css("display", "block");
	timeBtn.css("display", "block");

	tempBtn.prop("disabled", true);
	windBtn.prop("disabled", true);
	humidBtn.prop("disabled", true);
	timeBtn.prop("disabled", true);

	var landColor = "#636363";

	var tempColor = d3.scale
		.quantize()
		.range(["#ffbaba", "#ff7b7b", "#ff5252", "#ff0000", "#a70000"])
		.domain([0, 100]);

	var lines = [];

	let cityCount = 0;
	json.features.forEach(d => {
		let c = d.properties.text;
		fetch(weatherUrl + c)
			.then(res => {
				return res.status === 200 ? res.json() : "no data";
			})
			.then(res => {
				cityCount++;

				if (res !== "no data") {
					d.properties.weather = [];
					d.properties.weather[0] = res;
					createLines(lines, res);
				}

				if (cityCount === json.features.length) {
					tempBtn.prop("disabled", false);
					windBtn.prop("disabled", false);
					humidBtn.prop("disabled", false);
					timeBtn.prop("disabled", false);
					tempColor.domain([
						d3.min(json.features, function(d) {
							if (d.properties.weather && d.properties.weather[0])
								return d.properties.weather[0].main.temp;
						}),
						d3.max(json.features, function(d) {
							if (d.properties.weather && d.properties.weather[0])
								return d.properties.weather[0].main.temp;
						}),
					]);
				}
			});
	});

	function createLines(arr, data) {
		let speed = data.wind.speed;
		let deg = data.wind.deg;
		for (let i = 0; i < 5; i++) {
			let coord = [
				data.coord.lon + Math.random() * 100 / 100,
				data.coord.lat + Math.random() * 100 / 100,
			];
			let x0y0 = country(coord);
			let x1y1 = country(getDestinationPoint(coord, 15 * speed, deg));
			if (
				!isNaN(x0y0[0]) &&
				!isNaN(x0y0[1]) &&
				!isNaN(x1y1[0]) &&
				!isNaN(x1y1[1])
			) {
				arr.push({
					x0: x0y0[0],
					y0: x0y0[1],
					x1: x1y1[0],
					y1: x1y1[1],
					s: speed,
					duration: 8000 / speed,
					delay: Math.random() * 1000,
				});
			}
		}
	}

	csv.forEach(d => {
		json.features.forEach(jd => {
			if (jd.properties.text == d.name) {
				jd.properties.pop = d.population;
			}
		});
	});

	g
		.selectAll("path")
		.data(json.features)
		.enter()
		.append("path")
		.attr("class", "land")
		.attr("d", countryPath)
		.style("stroke-dasharray", "3, 3")
		.on("mouseover", mouseoverCountry)
		.on("mouseout", mouseoutCountry);

	var marker;

	function fetchStation(arr, callback) {
		let count = 0;
		let stationData = [];

		arr.forEach(d => {
			const fetchUrl = `https://api.waqi.info/feed/@${
				d.uid
			}/?token=cc9ba5f6999c729c8b1b36646f4c6f94c4b97ad8`;
			doRecursiveRequest(fetchUrl, 10)
				.then(data => {
					count++;
					stationData.push(data);
					if (count === arr.length - 1) {
						callback(null, stationData);
					}
				})
				.catch(err => callback(err));
		});
	}

	// marker = g
	// 	.selectAll("g.marker")
	// 	.data(data)
	// 	.enter()
	// 	.append("g")
	// 	.attr("class", "marker")
	// 	.attr("display", "block");
	//
	// marker
	// 	.on("mouseover", mouseoverCountry)
	// 	.on("mouseout", mouseoutCountry)
	// 	.on("click", clicked);

	// var marker = g
	// 	.selectAll("g.marker")
	// 	.data(
	// 		stations.data.filter(
	// 			d => {
	// 				// return 	d &&
	// 				// 	d.aqi !== "-" &&
	// 				// 	d.uid !== 4911 &&
	// 				// 	d.uid !== 4917 &&
	// 				// 	d.uid !== 4938 &&
	// 				// 	d.uid !== 4919;
	// 				const fetchUrl = `https://api.waqi.info/feed/@${d.uid}/?token=cc9ba5f6999c729c8b1b36646f4c6f94c4b97ad8`;
	//
	// 				fetch(fetchUrl)
	// 				.then(res => res.json())
	// 				.then()
	// 			}
	// 		),
	// 	) //filter a station without historical data
	// 	.enter()
	// 	.append("g")
	// 	.attr("class", "marker")
	// 	.attr("display", "block");

	// marker
	// 	.on("mouseover", mouseoverCountry)
	// 	.on("mouseout", mouseoutCountry)
	// 	.on("click", clicked);

	closeCountry.on("click", zoomIn);

	zoomOut();

	tempBtn.on("click", () => {
		tempOn = !tempOn;
		if (tempOn) {
			tempBtn.addClass("chosen");
			addTempLayer("weather", 0, 0);
		} else {
			tempBtn.removeClass("chosen");
			removeTempLayer(100);
		}
	});

	humidBtn.on("click", () => {
		humidOn = !humidOn;
		if (humidOn) {
			humidBtn.addClass("chosen");
			addHumidLayer("weather", 0, 0);
		} else {
			humidBtn.removeClass("chosen");
			removeHumidLayer(100);
		}
	});

	windBtn.on("click", () => {
		windOn = !windOn;
		if (windOn) {
			windBtn.addClass("chosen");
			addWindLayer(lines);
		} else {
			windBtn.removeClass("chosen");
			removeWindLayer();
		}
	});

	timeBtn.on("click", () => {
		timeBtn.toggleClass("chosen");
		timeSeriesFrom.toggleClass("hide");
	});

	var tsAvg = [];

	formBtn.on("click", () => {
		let date = $("#date").val();
		let start = $("#start").val();
		let end = $("#end").val();
		let condition = $("input[name='condition']:checked").val();

		tempBtn.prop("disabled", true);
		windBtn.prop("disabled", true);
		humidBtn.prop("disabled", true);

		if (Number(start) < Number(end)) {
			fetch(`/data?date=${date}&start=${start}&end=${end}`)
				.then(res => res.json())
				.then(res => {
					res.result.forEach(d => {
						if (d !== null) {
							json.features.forEach(jd => {
								if (jd.properties.text == d.name) {
									jd.properties.timeseries = d.timeseries;
								}
							});
						}
					});
					tsAvg = res.average;
					showChanges(condition, Number(start), Number(end));
				});
		}
	});

	var timeDuration = [2500, 2200, 2000, 1800, 1500, 1000];

	function showChanges(condition, start, end) {
		tempBtn.removeClass("chosen");
		humidBtn.removeClass("chosen");
		windBtn.removeClass("chosen");
		tempOn = false;
		humidOn = false;
		windOn = false;
		g.selectAll("path").style("fill", landColor);
		g.selectAll("path").attr("opacity", 1);
		g.selectAll("line").remove();

		timeSeriesInfoDiv.css("display", "block");
		let timeRange = end - start + 1;
		let duration = 0;
		let i = 0;

		if (timeRange <= 4) duration = timeDuration[0];
		else if (timeRange <= 8) duration = timeDuration[1];
		else if (timeRange <= 12) duration = timeDuration[2];
		else if (timeRange <= 16) duration = timeDuration[3];
		else if (timeRange <= 18) duration = timeDuration[4];
		else if (timeRange <= 24) duration = timeDuration[5];

		let interval = setInterval(function() {
			timeSeriesTime.text(start + ":00:00");
			timeSeriesInfo.text("Average: " + getInfo(condition, tsAvg[i]));
			getWeatherFunction(condition, false)("timeseries", i, duration);
			i++;
			start++;
			setTimeout(function() {
				if (i === timeRange) {
					clearInterval(interval);
					getWeatherFunction(condition, true)(duration);
					timeSeriesInfoDiv.css("display", "none");
					setTimeout(function() {
						tempBtn.prop("disabled", false);
						windBtn.prop("disabled", false);
						humidBtn.prop("disabled", false);
					}, duration);
				}
			}, duration - 100);
		}, duration);
		timeSeriesTime.text(start + ":00:00");
		timeSeriesInfo.text("Average: " + getInfo(condition, tsAvg[i]));
		getWeatherFunction(condition, false)("timeseries", i, duration);
		i++;
		start++;
	}

	function getWeatherFunction(condition, removed) {
		switch (condition) {
			case "temp":
				return removed ? removeTempLayer : addTempLayer;
			case "humid":
				return removed ? removeHumidLayer : addHumidLayer;
		}
	}

	function getInfo(condition, data) {
		switch (condition) {
			case "temp":
				return data.temp + "°C";
			case "humid":
				return data.humid + "%";
		}
	}

	function addTempLayer(entity, i, duration) {
		g
			.selectAll("path")
			.transition()
			.duration(duration)
			.style("fill", function(d) {
				return getTempColor(d, entity, i);
			});
	}

	function getTempColor(d, entity, i) {
		if (d.properties[entity] && d.properties[entity][i]) {
			return tempColor(d.properties[entity][i].main.temp);
		} else {
			return "#c6c6c6";
		}
	}

	function removeTempLayer(duration) {
		g
			.selectAll("path")
			.transition()
			.duration(duration)
			.style("fill", landColor);
	}

	function addHumidLayer(entity, i, duration) {
		g
			.selectAll("path")
			.transition()
			.duration(duration)
			.attr("opacity", function(d) {
				return getHumidColor(d, entity, i);
			});
	}

	function getHumidColor(d, entity, i) {
		if (d.properties[entity] && d.properties[entity][i]) {
			let h = d.properties[entity][i].main.humidity;
			if (h < 20) return 0.9;
			else if (h < 50) return 0.7;
			else if (h < 70) return 0.5;
			else if (h < 90) return 0.3;
			else return 0.2;
		} else {
			return 0.1;
		}
	}

	function removeHumidLayer(duration) {
		g
			.selectAll("path")
			.transition()
			.duration(duration)
			.attr("opacity", 1);
	}

	function addWindLayer(arr) {
		g
			.selectAll("line")
			.data(arr)
			.enter()
			.append("line")
			.attr("class", "line")
			.attr({
				x1: function(d) {
					return d.x0;
				},
				y1: function(d) {
					return d.y0;
				},
			})
			.call(lineAnimate);
	}

	function removeWindLayer() {
		g.selectAll("line").remove();
	}

	function lineAnimate(selection) {
		selection
			.attr({
				x2: function(d) {
					return d.x0;
				},
				y2: function(d) {
					return d.y0;
				},
			})
			.style("opacity", 0)
			.transition()
			.ease("linear")
			.duration(function(d) {
				return d.duration;
			})
			.delay(function(d) {
				return d.delay;
			})
			.attr({
				x2: function(d) {
					return d.x1;
				},
				y2: function(d) {
					return d.y1;
				},
			})
			.style("opacity", 0.8)
			.transition()
			.duration(1000)
			.style("opacity", 0.1)
			.each("end", function() {
				d3.select(this).call(lineAnimate);
			});
	}

	function mouseoverCountry(d) {
		let text;
		let c = "",
			t = "",
			wi = "",
			hu = "";
		if (d.data && d.data.aqi) {
			d3.select(this).moveToFront();
			d3
				.select(this)
				.style("stroke", "white")
				.style("stroke-width", 2);
			text = [d.data.city.name, "AQI: " + d.data.aqi];
		} else {
			d3
				.select(this)
				.style("fill", "orange")
				.attr("opacity", 1);
			text = [d.properties.text, "Population: " + d.properties.pop];
			if (d.properties.weather && d.properties.weather[0]) {
				let w = d.properties.weather[0];
				if (tempOn) {
					c = "Condition: " + w.weather[0].description;
					t = "Temperature: " + w.main.temp + "°C";
				}
				if (humidOn) {
					hu = "Humidity: " + w.main.humidity + "%";
				}
				if (windOn) {
					wi = "Wind: " + w.wind.speed + " m/s";
				}
			}
		}
		setWeatherData(c, t, wi, hu);
		tooltip.select("#name").text(text[0]);
		tooltip.select("#value").text(text[1]);

		tooltip
			.style("left", d3.event.pageX + "px")
			.style("top", d3.event.pageY - 80 + "px")
			.style("display", "block")
			.style("opacity", 1);
	}

	function mouseoutCountry(d) {
		if (d.data && d.data.aqi) {
			d3
				.select(this)
				.style("stroke", "none")
				.style("stroke-width", 0);
		} else {
			if (tempOn) {
				d3.select(this).style("fill", function(d) {
					return getTempColor(d, "weather", 0);
				});
			} else d3.select(this).style("fill", landColor);
			if (humidOn) {
				d3.select(this).style("opacity", function(d) {
					return getHumidColor(d, "weather", 0);
				});
			} else d3.select(this).attr("opacity", 1);
		}
		tooltip.style("opacity", 0).style("display", "none");
	}

	function zoomOut() {
		d3
			.transition()
			.duration(2500)
			.tween("zoomout", function() {
				let curScale = country.scale();
				return function(t) {
					let scl =
						t > 0.8115
							? countryScale
							: curScale - t * countryZoomedScale * countryScale;
					country.scale(scl);
					svgCountry.selectAll("path.land").attr("d", countryPath);
					svgCountry.attr("opacity", t);
					if (t >= 1) {
						options.style("display", "block");
						fetchStation(stations.data, (err, data) => {
							console.log(data);
							if (!err) {
								marker = g
									.selectAll("g.marker")
									.data(
										data.filter(
											d => 
												d &&
												d.status !== "nug" &&
												d.data.aqi !== "-" &&
												d.data.idx !== 4911 &&
												d.data.idx !== 4917 &&
												d.data.idx !== 4938 &&
												d.data.idx !== 4919 &&
												d.data.idx !== 9997 &&
												d.data.idx !== 4937 &&
												d.data.idx !== 4932 &&
												d.data.idx !== 10006 ,
										),
									)
									.enter()
									.append("g")
									.attr("class", "marker")
									.attr("display", "block")
									// marker
									.append("circle")
									.attr("cx", function(d) {
										let cx = country([d.data.city.geo[1], d.data.city.geo[0]]);
										return cx == null ? 0 : cx[0];
									})
									.attr("cy", function(d) {
										let cy = country([d.data.city.geo[1], d.data.city.geo[0]]);
										return cy == null ? 0 : cy[1];
									})
									.attr("r", 12)
									.style("fill", function(d) {
										let aqi = d.data.aqi;
										return breakPointCheck(
											breakPoints["aqi_break_points"],
											aqi,
										);
									});
								g.selectAll("circle").style("display", "block");
								marker
									.on("mouseover", mouseoverCountry)
									.on("mouseout", mouseoutCountry)
									.on("click", clicked);
							}
						});
					}
				};
			});
	}

	function zoomIn() {
		reset();
		tempBtn.css("display", "none");
		windBtn.css("display", "none");
		humidBtn.css("display", "none");
		timeBtn.css("display", "none");
		timeSeriesFrom.addClass("hide");
		g.selectAll("circle").style("display", "none");
		g.attr(
			"transform",
			"translate(" +
				width / 2 +
				"," +
				height / 2 +
				")scale(" +
				1 +
				")translate(" +
				-width / 2 +
				"," +
				-height / 2 +
				")",
		);
		g.selectAll("path").classed("active", false);
		d3
			.transition()
			.duration(2000)
			.tween("zoomin", function() {
				return function(t) {
					closeCountry.style("display", "none");
					let scl = t * countryZoomedScale * countryScale + countryScale;
					country.scale(scl);
					svgCountry.selectAll("path.land").attr("d", countryPath);
					svgCountry.attr("opacity", 1 - t);
					if (t >= 1) {
						helperInfo.innerHTML = `
            <div>
                Freely spin around the globe by dragging it.
            </div>
            <div>
                Double click a country to view what's inside </br>(only available in Finland currently).
            </div>
            `;
						svgCountry.style("display", "none");
						svgGlobe.style("display", "block");
					}
				};
			})
			.transition()
			.tween("zoomout", function() {
				let curScale = projection.scale();
				let curSpaceScale = space.scale();
				return function(t) {
					let scl =
						t > 0.9995 ? scale : curScale - t * globeZoomedScale * scale;
					let spaceScl =
						t > 0.9995
							? spaceScale
							: curSpaceScale - t * globeZoomedScale * spaceScale;
					projection.scale(scl);
					projection.clipAngle(180);
					svgGlobe.selectAll("path.back-country").attr("d", path);
					projection.clipAngle(90);
					svgGlobe.selectAll("path.front-country").attr("d", path);
					space.scale(spaceScl);
					redrawStars();
					svgGlobe.attr("opacity", t);
					if (t >= 1) {
						countryList.style("display", "block");
					}
				};
			});
	}

	//----- get elements ----------------------
	const dataLayer = document.getElementById("data");
	const bars = dataLayer.querySelector(".left");
	const graph = dataLayer.querySelector(".right");
	const userTooltip = document.querySelector(".user-tooltip");
	const absoluteCircle = dataLayer.querySelector(".absolute-circle");
	const closeButton = document.querySelector(".close");

	absoluteCircle.addEventListener("click", e => {
		absoluteCircle.style.display = "none";
		graph.classList.add("fadeOutRight");
		bars.style.visibility = "hidden";
		closeButton.style.display = "block";
		setTimeout(function() {
			graph.classList.remove("fadeOutRight");
			dataLayer.style.display = "none";
			dataLayer.style.opacity = 0;
		}, 1000);
		animateOnClick();
	});

	function animateOnClick(d) {
		var x, y, k;

		if (d && centered !== d) {
			closeCountry.style("display", "none");
			var p;
			if (d.data.aqi) {
				p = country([d.data.city.geo[1], d.data.city.geo[0]]);
			} else {
				p = countryPath.centroid(d);
			}
			x = p[0];
			y = p[1];
			k = 4;
			centered = d;
		} else {
			closeCountry.style("display", "block");
			x = width / 2;
			y = height / 2;
			k = 1;
			centered = null;
		}

		g.selectAll("path").classed(
			"active",
			centered &&
				function(d) {
					return d === centered;
				},
		);
		if (k === 4) {
			optionButtons.style.display = "none";
			absoluteCircle.innerHTML = "";
			closeButton.style.display = "none";

			g.selectAll("path").attr("opacity", d => (d === centered ? 1 : 0.3));
			g.selectAll("circle").attr("opacity", d => (d === centered ? 1 : 0.3));
		} else {
			userTooltip.style.display = "none";
			optionButtons.style.display = "block";

			if (humidOn) {
				addHumidLayer("weather", 0, 0);
			} else {
				g.selectAll("path").attr("opacity", 1);
			}
			g.selectAll("circle").attr("opacity", 1);
		}

		g
			.transition()
			.duration(750)
			.attr(
				"transform",
				"translate(" +
					width / 2 +
					"," +
					height / 2 +
					")scale(" +
					k +
					")translate(" +
					-x +
					"," +
					-y +
					")",
			)
			.style("stroke-width", 1.5 / k + "px");
		return [x, y, k];
	}

	function clicked(d) {
		let a = animateOnClick(d);
		var x = a[0],
			y = a[1],
			k = a[2];
		//work on data
		const { idx, aqi, iaqi, dominentpol, city: { name } } = d.data;
		console.log(idx);
		const aqiText = aqi
			? qualityCheck(breakPoints["aqi_break_points"], aqi)
			: "unknown";
		const pollutantText = htmlDisplay[dominentpol] || "unknown";

		//display general data information
		document.querySelector(
			"#tooltip-station-name",
		).innerHTML = `<b>Station</b>: ${name}`;
		document.querySelector(
			"#tooltip-air-quality",
		).innerHTML = `<b>Air quality index</b>: ${aqiText}`;
		document.querySelector(
			"#tooltip-pol-dominant",
		).innerHTML = `<b>Dominent pollutant</b>: ${pollutantText}`;

		const nameArray = name.split(", ");
		const stationName = nameArray[1] + " " + nameArray[0];
		const processedName = stationName.split(" ").join("-");

		//handle animation and display/hide layer
		dataLayer.style.display = "block";
		dataLayer.style.opacity = 1;
		bars.style.visibility = "visible";

		graph.classList.add("animated");
		graph.classList.add("bounceInRight");

		absoluteCircle.style.background = breakPointCheck(
			breakPoints["aqi_break_points"],
			aqi,
		); //config circle color

		setTimeout(function() {
			graph.classList.remove("bounceInRight");
			absoluteCircle.style.display = "flex"; //display circle after 1 sec
			absoluteCircle.innerHTML = aqi || "unknown";
			userTooltip.style.display = "block";
		}, 1000);

		//initialize real time air quality components
		const infoBars = Array.from(document.querySelectorAll(".info-holder"));

		infoBars.forEach(e => {
			e.querySelector(".progress-bar").style.width = 0;
			e.querySelector(".progress-number").innerHTML = "No data";
		});

		const airRegex = /no2|so2|o3|pm10|pm25/;
		//filter response with regex
		const dataArray = iaqi
			? Object.entries(iaqi).filter(e => {
					return airRegex.test(e[0]);
			  })
			: [];

		//update real time air quality components
		setTimeout(function() {
			dataArray.forEach(e => {
				const name = e[0];
				const quality = e[1].v;

				const breakPointsArray = breakPoints[`${name}_break_points`];

				const dataDiv = document.getElementById(name);
				const progressBar = dataDiv.querySelector(".progress-bar");
				const progressNumber = dataDiv.querySelector(".progress-number");

				progressBar.style.width = scoreCount(breakPointsArray, quality);
				progressBar.style.background = breakPointCheck(
					breakPointsArray,
					quality,
				);

				progressNumber.style.opacity = 1;
				progressNumber.innerHTML = quality + "(µg/m3)";
			});
		}, 10);

		//initialize default checked button for historical data
		let airName = "pm25";
		let timePeriod = 2;
		let dangerLevel = 0;
		const defaultAirButton = document.querySelector("#pm-25");
		const defaultDaysButton = document.querySelector("#last-2-days");
		const defaultDangerButton = document.querySelector("#quality-good");
		const defaultCategoryButton = document.querySelector("#historical-data");

		defaultAirButton.checked = true;
		defaultDaysButton.checked = true;
		defaultDangerButton.checked = true;
		defaultCategoryButton.checked = true;

		let historicalData = [];
		//this function fetch historical data
		fetch(`/data/${processedName}`)
			.then(res => {
				if (res.status === 500) {
					console.log("Historical data not available");
					return undefined;
				}
				return res.json();
			})
			.then(res => {
				historicalData = res;
				displayChart(airName, timePeriod, historicalData);
				displayStatChart(historicalData, dangerLevel);
			});

		//handle graph category
		var categoryButtons = document.querySelectorAll(
			"input[name='category-button']",
		);
		const historicalGraph = document.querySelector(".historical-data");
		const statisticGraph = document.querySelector(".statistic-data");

		historicalGraph.style.display = "block";
		statisticGraph.style.display = "none";

		for (var i = 0; i < categoryButtons.length; i++) {
			categoryButtons[i].onclick = function() {
				if (this.id === "historical-data") {
					historicalGraph.style.display = "block";
					statisticGraph.style.display = "none";
				} else {
					historicalGraph.style.display = "none";
					statisticGraph.style.display = "block";
				}
			};
		}

		//handle display in historical with different air catogories
		var airButtons = document.querySelectorAll("input[name='air-category']");
		var prevAir = defaultAirButton;
		for (var i = 0; i < airButtons.length; i++) {
			airButtons[i].onclick = function() {
				if (this !== prevAir) {
					prevAir = this;
					airName = this.value.split("-").join(""); //process air name
					displayChart(airName, timePeriod, historicalData);
				}
			};
		}

		//handle display in historical data with different time period
		var timeButtons = document.querySelectorAll("input[name='time-period']");
		var prevTime = defaultDaysButton;
		for (var i = 0; i < timeButtons.length; i++) {
			timeButtons[i].onclick = function() {
				if (this !== prevTime) {
					prevTime = this;
					timePeriod = parseInt(this.value); //process time period
					displayChart(airName, timePeriod, historicalData);
				}
			};
		}

		//handle display in statistical data
		var statButtons = document.querySelectorAll("input[name='stat-buttons']");
		var prevDangerLevel = defaultDangerButton;
		for (var i = 0; i < statButtons.length; i++) {
			statButtons[i].onclick = function() {
				if (this !== prevDangerLevel) {
					prevDangerLevel = this;
					dangerLevel = parseInt(this.value); //process danger level
					displayStatChart(historicalData, dangerLevel);
				}
			};
		}
	}

	d3.selection.prototype.moveToFront = function() {
		return this.each(function() {
			this.parentNode.appendChild(this);
		});
	};

	function reset() {
		tempBtn.removeClass("chosen");
		windBtn.removeClass("chosen");
		humidBtn.removeClass("chosen");
		timeBtn.removeClass("chosen");
		setWeatherData("", "", "", "");
		g
			.selectAll("path")
			.style("fill", landColor)
			.attr("opacity", 1);
	}
}

function setWeatherData(cond, temp, wind, humid) {
	tooltip.select("#cond-value").text(cond);
	tooltip.select("#temp-value").text(temp);
	tooltip.select("#wind-value").text(wind);
	tooltip.select("#humid-value").text(humid);
}

// MATH FUNCTIONS
function toRad(deg) {
	return deg * Math.PI / 180;
}

function toDeg(rad) {
	return rad * 180 / Math.PI;
}

function getDestinationPoint(lonLat, d, brng) {
	// Formulae from http://www.movable-type.co.uk/scripts/latlong.html
	// brg in degree, d in km
	brng = toRad(brng);
	var R = 6371; // Earth's radius in km
	var lon1 = toRad(lonLat[0]),
		lat1 = toRad(lonLat[1]);
	var lat2 = Math.asin(
		Math.sin(lat1) * Math.cos(d / R) +
			Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng),
	);
	var lon2 =
		lon1 +
		Math.atan2(
			Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1),
			Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2),
		);
	return [toDeg(lon2), toDeg(lat2)];
}

},{"./handler":1}]},{},[2]);
