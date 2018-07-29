document.addEventListener("DOMContentLoaded", function(event) {
  const pm10_break_points = [50, 100, 250, 350, 430];
  const pm25_break_points = [30, 60, 90, 120, 250];
  const no2_break_points = [40, 80, 180, 280, 400];
  const so2_break_points = [40, 80, 380, 800, 1600];
  const nh3_break_points = [200, 400, 800, 1200, 1800];
  const o3_break_points = [50, 100, 168, 208, 748];
  const aqi_break_points = [50, 100, 200, 350, 430];

  const htmlDisplay = {
    pm10: "PM 10",
    pm25: "PM 2.5",
    no2: "NO 2",
    nh3: "NH 3",
    o3: "O 3"
  };

  const breakPoints = {
    pm10_break_points,
    pm25_break_points,
    no2_break_points,
    so2_break_points,
    nh3_break_points,
    o3_break_points
  };

  const airNameMap = {
    no2: "Nitrogen dioxide (ug/m3)",
    pm10: "Particulate matter < 10 µm (ug/m3)",
    pm25: "Particulate matter < 2.5 µm (ug/m3)"
  };

  const scoreCount = (arr, value) => {
    return (Math.log(value) / Math.log(arr[4])) * 100 + "%";
  };

  const breakPointCheck = (arr, value) => {
    if (value < arr[0]) {
      return "#32CE00";
    } else if (value < arr[1]) {
      return "#9BFF00";
    } else if (value < arr[2]) {
      return "#FAFF00";
    } else if (value < arr[2]) {
      return "#F4001C";
    } else {
      return "#9D2B30";
    }
  };

  //end of air quality config

  const displayChart = (airName, days) => {
    const displayData = dataArr.slice(
      dataArr.length - days * 24,
      dataArr.length
    );

    const canvasDiv = document.querySelector(".canvas");
    canvasDiv.innerHTML = "";
    const canvas = document.createElement("canvas");
    canvas.id = "myChart";
    canvasDiv.appendChild(canvas);

    var ctx = document.getElementById("myChart").getContext("2d");
    var myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: displayData.map(e => {
          return `${e.Time} - ${e.d}/${e.m}`;
        }),
        datasets: [
          {
            label: "Amount",
            data: displayData.map(e => e[airNameMap[airName]])
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      }
    });
  };

  fetch(
    "https://api.waqi.info/feed/@1451/?token=cc9ba5f6999c729c8b1b36646f4c6f94c4b97ad8"
  )
    .then(res => res.json())
    .then(res => {
      const { aqi, iaqi } = res.data;

      const airRegex = /no2|so2|o3|pm10|pm25/;

      const dataArray = Object.entries(iaqi).filter(e => {
        return airRegex.test(e[0]);
      });

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
          quality
        );

        progressNumber.style.opacity = 1;
        progressNumber.innerHTML = quality + "(μg/m3)";
      });
    });

  let airName = "pm25";
  let timePeriod = 2;

  displayChart(airName, timePeriod);

  var airButtons = document.querySelectorAll("input[name='air-category']");
  var prevAir = null;
  for (var i = 0; i < airButtons.length; i++) {
    airButtons[i].onclick = function() {
      if (this !== prevAir) {
        prevAir = this;
      }
      airName = this.value.split("-").join("");

      displayChart(airName, timePeriod);
    };
  }

  var timeButtons = document.querySelectorAll("input[name='time-period']");
  var prevTime = null;
  for (var i = 0; i < timeButtons.length; i++) {
    timeButtons[i].onclick = function() {
      if (this !== prevTime) {
        prevTime = this;
      }
      timePeriod = parseInt(this.value);

      displayChart(airName, timePeriod);
    };
  }
});
