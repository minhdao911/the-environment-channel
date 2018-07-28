document.addEventListener("DOMContentLoaded", function(event) {
  const pm10_break_points = [50, 100, 250, 350, 430];
  const pm25_break_points = [30, 60, 90, 120, 250];
  const no2_break_points = [40, 80, 180, 280, 400];
  const so2_break_points = [40, 80, 380, 800, 1600];
  const nh3_break_points = [200, 400, 800, 1200, 1800];
  const o3_break_points = [50, 100, 168, 208, 748];
  const aqi_break_points = [50, 100, 200, 350, 430];

  const dataArr = [
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "0:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 8.9,
      "Particulate matter < 10 µm (ug/m3)": 15.5,
      "Particulate matter < 2.5 µm (ug/m3)": 12.1
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "1:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 7.4,
      "Particulate matter < 10 µm (ug/m3)": 11.3,
      "Particulate matter < 2.5 µm (ug/m3)": 10.6
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "2:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 10.3,
      "Particulate matter < 10 µm (ug/m3)": 11.5,
      "Particulate matter < 2.5 µm (ug/m3)": 10.3
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "3:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 9.5,
      "Particulate matter < 10 µm (ug/m3)": 11,
      "Particulate matter < 2.5 µm (ug/m3)": 9.9
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "4:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 7.5,
      "Particulate matter < 10 µm (ug/m3)": 9.9,
      "Particulate matter < 2.5 µm (ug/m3)": 8.9
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "5:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 8.3,
      "Particulate matter < 10 µm (ug/m3)": 9.3,
      "Particulate matter < 2.5 µm (ug/m3)": 9
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "6:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 8.2,
      "Particulate matter < 10 µm (ug/m3)": 17.4,
      "Particulate matter < 2.5 µm (ug/m3)": 11.2
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "7:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 5.9,
      "Particulate matter < 10 µm (ug/m3)": 18.2,
      "Particulate matter < 2.5 µm (ug/m3)": 12.2
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "8:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 5.8,
      "Particulate matter < 10 µm (ug/m3)": 7.4,
      "Particulate matter < 2.5 µm (ug/m3)": 10.8
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "9:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 8.6,
      "Particulate matter < 10 µm (ug/m3)": 9.4,
      "Particulate matter < 2.5 µm (ug/m3)": 11.2
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "10:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 6.1,
      "Particulate matter < 10 µm (ug/m3)": 10.5,
      "Particulate matter < 2.5 µm (ug/m3)": 11.8
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "11:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 11,
      "Particulate matter < 10 µm (ug/m3)": 7.2,
      "Particulate matter < 2.5 µm (ug/m3)": 12.1
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "12:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 17,
      "Particulate matter < 10 µm (ug/m3)": 6.7,
      "Particulate matter < 2.5 µm (ug/m3)": 12.4
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "13:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 12.8,
      "Particulate matter < 10 µm (ug/m3)": 10,
      "Particulate matter < 2.5 µm (ug/m3)": 13.2
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "14:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 19.3,
      "Particulate matter < 10 µm (ug/m3)": 20.4,
      "Particulate matter < 2.5 µm (ug/m3)": 13.6
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "15:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 11,
      "Particulate matter < 10 µm (ug/m3)": -3.9,
      "Particulate matter < 2.5 µm (ug/m3)": 6
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "16:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 6.2,
      "Particulate matter < 10 µm (ug/m3)": 7.8,
      "Particulate matter < 2.5 µm (ug/m3)": 5.3
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "17:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 3.3,
      "Particulate matter < 10 µm (ug/m3)": 13.3,
      "Particulate matter < 2.5 µm (ug/m3)": 7.5
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "18:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 3.7,
      "Particulate matter < 10 µm (ug/m3)": 5.7,
      "Particulate matter < 2.5 µm (ug/m3)": 9
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "19:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 7,
      "Particulate matter < 10 µm (ug/m3)": 12.8,
      "Particulate matter < 2.5 µm (ug/m3)": 10.2
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "20:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 9.7,
      "Particulate matter < 10 µm (ug/m3)": 13.3,
      "Particulate matter < 2.5 µm (ug/m3)": 11.8
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "21:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 6.7,
      "Particulate matter < 10 µm (ug/m3)": 4.1,
      "Particulate matter < 2.5 µm (ug/m3)": 11.1
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "22:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 4.2,
      "Particulate matter < 10 µm (ug/m3)": 0.6,
      "Particulate matter < 2.5 µm (ug/m3)": 10.4
    },
    {
      Year: 2018,
      m: 7,
      d: 21,
      Time: "23:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 3.9,
      "Particulate matter < 10 µm (ug/m3)": 7.8,
      "Particulate matter < 2.5 µm (ug/m3)": 10.9
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "0:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 2.7,
      "Particulate matter < 10 µm (ug/m3)": 8.9,
      "Particulate matter < 2.5 µm (ug/m3)": 11.3
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "1:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 2.9,
      "Particulate matter < 10 µm (ug/m3)": 7.2,
      "Particulate matter < 2.5 µm (ug/m3)": 11.1
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "2:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 2.2,
      "Particulate matter < 10 µm (ug/m3)": 4.6,
      "Particulate matter < 2.5 µm (ug/m3)": 10.4
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "3:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 2.4,
      "Particulate matter < 10 µm (ug/m3)": 7.8,
      "Particulate matter < 2.5 µm (ug/m3)": 10.3
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "4:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 2.8,
      "Particulate matter < 10 µm (ug/m3)": 9.2,
      "Particulate matter < 2.5 µm (ug/m3)": 9.9
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "5:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 1.5,
      "Particulate matter < 10 µm (ug/m3)": 6.3,
      "Particulate matter < 2.5 µm (ug/m3)": 11
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "6:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 2.2,
      "Particulate matter < 10 µm (ug/m3)": 3.9,
      "Particulate matter < 2.5 µm (ug/m3)": 9.7
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "7:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 1.1,
      "Particulate matter < 10 µm (ug/m3)": 10.9,
      "Particulate matter < 2.5 µm (ug/m3)": 9.2
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "8:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 18.2,
      "Particulate matter < 10 µm (ug/m3)": 27.3,
      "Particulate matter < 2.5 µm (ug/m3)": 11.8
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "9:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 19.6,
      "Particulate matter < 10 µm (ug/m3)": -5.1,
      "Particulate matter < 2.5 µm (ug/m3)": 7
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "10:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 28,
      "Particulate matter < 10 µm (ug/m3)": 12,
      "Particulate matter < 2.5 µm (ug/m3)": 7.5
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "11:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 28.4,
      "Particulate matter < 10 µm (ug/m3)": 6.4,
      "Particulate matter < 2.5 µm (ug/m3)": 9.3
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "12:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 22.1,
      "Particulate matter < 10 µm (ug/m3)": 1,
      "Particulate matter < 2.5 µm (ug/m3)": 8.9
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "13:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 2.3,
      "Particulate matter < 10 µm (ug/m3)": -0.2,
      "Particulate matter < 2.5 µm (ug/m3)": 7.3
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "14:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 3.5,
      "Particulate matter < 10 µm (ug/m3)": 16.4,
      "Particulate matter < 2.5 µm (ug/m3)": 8.7
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "15:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 6,
      "Particulate matter < 10 µm (ug/m3)": 0.5,
      "Particulate matter < 2.5 µm (ug/m3)": 8.4
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "16:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 30.5,
      "Particulate matter < 10 µm (ug/m3)": 34.3,
      "Particulate matter < 2.5 µm (ug/m3)": 11.4
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "17:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 14,
      "Particulate matter < 10 µm (ug/m3)": 17.8,
      "Particulate matter < 2.5 µm (ug/m3)": 10.7
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "18:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 5.1,
      "Particulate matter < 10 µm (ug/m3)": -7,
      "Particulate matter < 2.5 µm (ug/m3)": 7.1
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "19:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 4.3,
      "Particulate matter < 10 µm (ug/m3)": "",
      "Particulate matter < 2.5 µm (ug/m3)": 4.4
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "20:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 4.6,
      "Particulate matter < 10 µm (ug/m3)": 9.1,
      "Particulate matter < 2.5 µm (ug/m3)": 4.6
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "21:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 4.9,
      "Particulate matter < 10 µm (ug/m3)": 23,
      "Particulate matter < 2.5 µm (ug/m3)": 5.6
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "22:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 3.2,
      "Particulate matter < 10 µm (ug/m3)": 2.5,
      "Particulate matter < 2.5 µm (ug/m3)": 4
    },
    {
      Year: 2018,
      m: 7,
      d: 22,
      Time: "23:00",
      "Time zone": "UTC",
      "Nitrogen dioxide (ug/m3)": 3,
      "Particulate matter < 10 µm (ug/m3)": 1.1,
      "Particulate matter < 2.5 µm (ug/m3)": 3.9
    }
  ];

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

      console.log(dataArray);

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

  var ctx = document.getElementById("myChart").getContext("2d");
  var myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dataArr.map(e => {
        return `${e.Time} - ${e.d} - ${e.m}`;
      }),
      datasets: [
        {
          label: "Amount",
          data: dataArr.map(e => e["Nitrogen dioxide (ug/m3)"])
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
});
