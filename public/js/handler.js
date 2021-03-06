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
