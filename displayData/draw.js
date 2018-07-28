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

const scoreCount = (arr, value) => {
  return (value / arr[4]) * 100;
};

const breakPointCheck = (arr, value) => {
  if (value < arr[0]) {
    return "#32CE00";
  } else if (value < arr[1]) {
    return "#6BCE00";
  } else if (value < arr[2]) {
    return "#FAFF00";
  } else if (value < arr[2]) {
    return "#F4001C";
  } else {
    return "#9D2B30";
  }
};
//end of air quality config

var width = 500,
  height = 500,
  radius = Math.min(width, height) / 2,
  innerRadius = 0.3 * radius;

var pie = d3.layout
  .pie()
  .sort(null)
  .value(function(d) {
    return d.width;
  });

var tip = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([0, 0])
  .html(function(d) {
    const label = htmlDisplay[d.data.label].split(" ");
    const text = label[0];
    const subText = label[1];

    return `${text}<sub>${subText}</sub>: <span> ${d.data.score} </span>`;
  });

var arc = d3.svg
  .arc()
  .innerRadius(innerRadius)
  .outerRadius(function(d) {
    return (radius - innerRadius) * (d.data.score / 100.0) + innerRadius;
  });

var outlineArc = d3.svg
  .arc()
  .innerRadius(innerRadius)
  .outerRadius(radius);

var svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

svg.call(tip);

d3.json(
  "https://api.waqi.info/feed/@1451/?token=cc9ba5f6999c729c8b1b36646f4c6f94c4b97ad8",
  function(error, data) {
    const airRegex = /no2|so2|o3|pm10|pm25/;

    const dataArray = Object.entries(data.data.iaqi).filter(e => {
      return airRegex.test(e[0]);
    });

    dataArray.forEach(function(d) {
      const name = d[0];
      const quality = d[1].v;
      const qualityBreakPointsArray = breakPoints[`${name}_break_points`];
      const score = scoreCount(qualityBreakPointsArray, quality);

      d.id = name;
      d.order = 1;
      d.color = breakPointCheck(qualityBreakPointsArray, quality);
      d.weight = 1;
      d.score = Math.round(score * 100) / 100;
      d.width = +d.weight;
      d.label = name;
    });

    var path = svg
      .selectAll(".solidArc")
      .data(pie(dataArray))
      .enter()
      .append("path")
      .attr("fill", function(d) {
        return d.data.color;
      })
      .attr("class", "solidArc")
      .attr("stroke", "gray")
      .attr("d", arc)
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide);

    var outerPath = svg
      .selectAll(".outlineArc")
      .data(pie(dataArray))
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "gray")
      .attr("class", "outlineArc")
      .attr("d", outlineArc);

    // calculate the weighted mean score
    var score = data.data.aqi;
    const aqiColor = breakPointCheck(aqi_break_points, score);

    svg
      .append("svg:text")
      .attr("class", "aster-score")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle") // text-align: right
      .style("fill", aqiColor)
      .style(
        "text-shadow",
        "1px 0 0 #AFAFAF, -1px 0 0 #AFAFAF, 0 1px 0 #AFAFAF, 0 -1px 0 #AFAFAF, 1px 1px #AFAFAF, -1px -1px 0 #AFAFAF, 1px -1px 0 #AFAFAF, -1px 1px 0 #AFAFAF"
      )
      .text(Math.round(score));
  }
);
