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

var weatherKey = "336cc10d5e71d8310a16b448a229e995",
    weatherUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${weatherKey}&units=metric&q=`;

var countryScale = Math.min(width, height)*5,
    countryZoomedScale = 5,
    centered;

  //begin of air quality config
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

    const displayChart = (airName, days, stationName) => {
      const baseUrl = "http://localhost:3000"
      fetch(`${baseUrl}/data/${stationName}`)
      .then(res => res.json())
      .then(data => {

                const displayData = data.slice(
                data.length - days * 24,
                data.length
               );

               document.querySelector(".close").style.display = "none";

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
      })


   };


var tooltip = d3.select("#tooltip"),
  	countryList = d3.select("#globe").append("select").attr("name", "countries"),
    notiText = d3.select("body").append("p").text("This country is unsupported at the moment")
    	.attr("class", "noti"),
    closeCountry = d3.select("#country").append("p").text("Close").attr("class", "close"),
    closeNoti = d3.select("body").append("p").text("Close").attr("class", "close"),
    options = d3.selectAll(".options").style("display", "none");

$(".noti").css({left: width/2-200, top: height/2});

var tempBtn = $("#tempBtn"),
    windBtn = $("#windBtn"),
    humidBtn = $("#humidBtn");

var svgGlobe = d3.select("#globe").append("svg")
    .attr("width",  width)
    .attr("height", height)
    .style("display", "block");

svgGlobe.append("path")
    .datum({type: "Sphere"})
    .attr("class", "water")
    .attr("d", path)
    .attr("fill", "yellow");

//Set up outerspace

var space = d3.geo.azimuthalEquidistant()
    .translate([width / 2, height / 2]);

var spaceScale = space.scale() * 3;
space.scale(spaceScale);

var spacePath = d3.geo.path()
    .projection(space)
    .pointRadius(1);

var starList = createStars(300);

var stars = svgGlobe.append("g")
    .selectAll("g")
    .data(starList)
    .enter()
    .append("path")
    .attr("class", "star")
    .attr("d", function(d){
      spacePath.pointRadius(d.properties.radius);
      return spacePath(d);
    });

//Set up Earth

var projection = d3.geo.orthographic()
    .scale(scale)
    .rotate([0, 0])
    .translate([width / 2, height / 2])
    .clipAngle(90);

var path = d3.geo.path()
    .projection(projection)
    .pointRadius(2);

/* ======= Country Set Up ======= */

var svgCountry = d3.select("#country").append("svg")
	.attr("width", width)
    .attr("height", height)
    .style("display", "none");

var country = d3.geo.mercator()
    .scale(countryScale*countryZoomedScale)
    .rotate([-26,-64.5,0])
    .translate([width/2, height/2]);

var countryPath = d3.geo.path()
    .projection(country);

var g = svgCountry.append('g');

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

    var backCountry = svgGlobe.selectAll("path.land")
        .data(countries)
        .enter().append("path")
        .attr("class", "back-country")
        .attr("d", path)
        .on("mouseover", d => mouseover(d))
        .on("mouseout", d => mouseout(d))
        .on("mousemove", d => mousemove(d))
        .on("click", d => choose(d.id));

    projection.clipAngle(90);

    var frontCountry = svgGlobe.selectAll("path.land")
        .data(countries)
        .enter().append("path")
        .attr("class", "front-country")
        .attr("d", path)
        .on("mouseover", d => mouseover(d))
        .on("mouseout", d => mouseout(d))
        .on("mousemove", d => mousemove(d))
        .on("dblclick", d => choose(d.id));

    spin(true);

    //Drag event

    d3.select('body').call(d3.behavior.drag()
        .origin(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
        .on("drag", drag));

    //Country focus on option select

    d3.select("select").on("change", function() {
        choose(this.value);
    });

    closeNoti.on('click', function(){
    	notiText.style('display', 'none');
        closeNoti.style('display', 'none');
        svgGlobe.style('display', 'block');
        d3.transition()
        .duration(2000)
        .tween("zoomout", function(){
            let curScale = projection.scale();
            let curSpaceScale = space.scale();
            return function(t){
                let scl = t > 0.9995 ? scale : curScale-t*globeZoomedScale*scale;
                let spaceScl = t > 0.9995 ? spaceScale : curSpaceScale-t*globeZoomedScale*spaceScale;
                projection.scale(scl);
                projection.clipAngle(180);
                svgGlobe.selectAll("path.back-country").attr("d", path);
                projection.clipAngle(90);
                svgGlobe.selectAll("path.front-country").attr("d", path);
                space.scale(spaceScl);
                redrawStars();
                svgGlobe.attr('opacity', t);
                    if(t>=1) {
                        countryList.style('display', 'block');
                    }
                }
        });
    });

    function getCountry(cnt, sel) {
      for(var i = 0; i < cnt.length; i++) {
        if(cnt[i].id == sel) {return cnt[i];}
      }
    };

    function mouseover(d){
        tooltip.select("#name").text(countryById[d.id]);
        tooltip.select("#value").text("");
        setWeatherData("", "", "", "");
        tooltip
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 80) + "px")
        .style("display", "block")
        .style("opacity", 1);
    }

    function mouseout(d){
        tooltip.style("opacity", 0)
        .style("display", "none");
    }

    function mousemove(d){
        tooltip.style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 80) + "px");
    }


    function choose(d){
        countryList.style('display', 'none');
        start = false;
        var rotate = projection.rotate(),
        focusedCountry = getCountry(countries, d),
        p = d3.geo.centroid(focusedCountry);
        svgGlobe.selectAll(".focused").classed("focused", focused = false);
        console.log(rotate);
        console.log(p);
        if(Math.round(rotate[0]) === -Math.round(p[0]) && Math.round(rotate[1]) === -Math.round(p[1])){
            console.log("ffffff");
            rotate = [rotate[0], rotate[1]+360];
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
                svgGlobe.selectAll("path.back-country").attr("d", path)
                .classed("focused", function(d, i) { return d.id == focusedCountry.id ? focused = d : false; });
                projection.rotate(r(t)).clipAngle(90);
                svgGlobe.selectAll("path.front-country").attr("d", path)
                .classed("focused", function(d, i) { return d.id == focusedCountry.id ? focused = d : false; });
                space.rotate(r(t));
                redrawStars();
                };
            })
            .transition()
            .tween("zoomin", function(){
                return function(t){
                projection.scale(t*globeZoomedScale*scale+scale);
                projection.clipAngle(180);
                svgGlobe.selectAll("path.back-country").attr("d", path);
                projection.clipAngle(90);
                svgGlobe.selectAll("path.front-country").attr("d", path);
                space.scale(t*globeZoomedScale*spaceScale+spaceScale);
                redrawStars();
                svgGlobe.attr('opacity', 1-t);
                if(t>=1){
                    svgGlobe.style('display', 'none');
                    if(d == 246){
                        closeCountry.style('display', 'block');
                        svgCountry.style('display', 'block');
                        queue()
                        .defer(d3.json, "../data/countries/finland.json")
                        .defer(d3.csv, "../data/countries/finland.csv")
                        .defer(d3.json, "https://api.waqi.info/search/?token=cc9ba5f6999c729c8b1b36646f4c6f94c4b97ad8&keyword=finland")
                        .await(loadMap);
                    }else{
                        closeNoti.style('display', 'block');
                        notiText.style('display', 'block');
                    }
                }
                }
            })
        })();
    }

    function spin(){
        var timer = d3.timer(function(){
            if(start){
                let dt = Date.now() - t;
                projection.rotate([origin[0] + velocity[0] * dt, origin[1] + velocity[1] * dt]).clipAngle(180);
                svgGlobe.selectAll('path.back-country').attr('d', path);
                projection.rotate([origin[0] + velocity[0] * dt, origin[1] + velocity[1] * dt]).clipAngle(90);
                svgGlobe.selectAll('path.front-country').attr('d', path);
                space.rotate([origin[0] + velocity[0] * dt, origin[1] + velocity[1] * dt]);
                redrawStars();
            }
        });
    }

    function drag(){
        start = false;
        var rotate = projection.rotate();
        projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]).clipAngle(180);
        svgGlobe.selectAll("path.back-country").attr("d", path);
        svgGlobe.selectAll(".focused").classed("focused", focused = false);
        projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]).clipAngle(90);
        svgGlobe.selectAll("path.front-country").attr("d", path);
        svgGlobe.selectAll(".focused").classed("focused", focused = false);
        space.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
        redrawStars();
    }

  };

function redrawStars(){
    stars.attr("d", function(d){
        spacePath.pointRadius(d.properties.radius);
        return spacePath(d);
    });
}

function createStars(number){
    var data = [];
    for(var i = 0; i < number; i++){
        data.push({
            geometry: {
                type: 'Point',
                coordinates: randomLonLat()
            },
            type: 'Feature',
            properties: {
                radius: Math.random() * 1.5
            }
        });
    }
    return data;
}

function randomLonLat(){
    return [Math.random() * 360 - 180, Math.random() * 180 - 90];
}

/* ======= Country Functions ======= */

function loadMap(err, json, csv, stations){

    var tempOn = false, windOn = false, humidOn = false;

    tempBtn.css("display", "block");
    windBtn.css("display", "block");
    humidBtn.css("display", "block");

    tempBtn.prop('disabled', true);
    windBtn.prop('disabled', true);
    humidBtn.prop('disabled', true);

    var landColor = "#272727";

    var tempColor = d3.scale.quantize()
        .range(["#ffbaba", "#ff7b7b", "#ff5252", "#ff0000", "#a70000"])
        .domain([0, 100]);

    let cityCount = 0;
    json.features.forEach(d => {
        let c = d.properties.text;
        fetch(weatherUrl+c)
        .then(res => {
            return res.status === 200 ? res.json() : "no data";
        })
        .then(res => {
            cityCount++;
            d.properties.weather = res
            if(cityCount === json.features.length){
                console.log(json.features);
                tempBtn.prop('disabled', false);
                windBtn.prop('disabled', false);
                humidBtn.prop('disabled', false);
                tempColor.domain([
                    d3.min(json.features, function(d) {
                        if(d.properties.weather !== "no data")
                            return d.properties.weather.main.temp;
                    }),
                    d3.max(json.features, function(d) {
                        if(d.properties.weather !== "no data")
                            return d.properties.weather.main.temp;
                    })
                ]);
            }
        });
    });

  	csv.forEach(d => {
        json.features.forEach(jd => {
            if(jd.properties.text == d.name){
                jd.properties.pop = d.population;
            }
        });
    });

    g.selectAll("path")
        .data(json.features)
        .enter().append("path")
        .attr("class", "land")
        .attr("d", countryPath)
        .on('mouseover', mouseoverCountry)
        .on('mouseout', mouseoutCountry);

    var marker = g.selectAll("g.marker")
        .data(stations.data.filter(d => d && d.aqi!=='-'))
        .enter().append("g")
        .attr("class", "marker")
        .attr("display", "block");

    marker
        .on('mouseover', mouseoverCountry)
        .on('mouseout', mouseoutCountry)
        .on('click', clicked);

    closeCountry.on('click', zoomIn);

    zoomOut();

    tempBtn.on('click', () => {
        tempOn = !tempOn;
        if(tempOn) {
            tempBtn.addClass("chosen");
            addTempLayer();
        }else{
            tempBtn.removeClass("chosen");
            g.selectAll("path").style("fill", landColor);
        }
    });

    humidBtn.on('click', () => {
        humidOn = !humidOn;
        if(humidOn){
            humidBtn.addClass("chosen");
            addHumidLayer();
        }else{
            humidBtn.removeClass("chosen");
            g.selectAll("path").attr("opacity", 1);
        }
    });

    function addTempLayer(){
        g.selectAll("path")
        .style("fill", function(d){
            if(d.properties.weather !== "no data"){
                return tempColor(d.properties.weather.main.temp);
            }else{
                return "#c6c6c6";
            }
        });
    }

    function addHumidLayer(){
        g.selectAll("path")
        .attr("opacity", function(d){
            if(d.properties.weather !== "no data"){
                let h = d.properties.weather.main.humidity;
                if(h < 20) return 0.9;
                else if(h < 50) return 0.7;
                else if(h < 70) return 0.5;
                else if(h < 90) return 0.3;
                else return 0.2;
            }else{
                return 0.1;
            }
        });
    }

    function mouseoverCountry(d){
        let text;
        let c = "", t = "", wi = "", hu = "";
        if(d.aqi){
            d3.select(this).moveToFront();
            d3.select(this).style("stroke", "white").style("stroke-width", 2);
            text = [d.station.name, "AQI: "+d.aqi];
        }else{
            d3.select(this)
            .style("fill", "orange")
            .attr("opacity", 1);
            text = [d.properties.text, "Population: "+d.properties.pop];
            let w = d.properties.weather;
            if(tempOn){
                if(w === "no data") c = "No Data";
                else{
                    c = "Condition: " + w.weather[0].description;
                    t = "Temperature: " + w.main.temp + " C";
                }
            }
            if(humidOn){
                if(w === "no data") c = "No Data";
                else
                    hu = "Humidity: " + w.main.humidity + "%";
            }
        }
        setWeatherData(c, t, wi, hu);
        tooltip.select("#name").text(text[0]);
        tooltip.select("#value").text(text[1]);

        tooltip
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 80) + "px")
            .style("display", "block")
            .style("opacity", 1);
    }

    function mouseoutCountry(d){
        if(d.aqi) {
            d3.select(this).style("stroke", "none").style("stroke-width", 0);
        }else {
            if(tempOn) {
                addTempLayer();
            }else d3.select(this).style("fill", landColor);
            if(humidOn){
                addHumidLayer();
            }else d3.select(this).attr("opacity", 1);
        }
        tooltip.style("opacity", 0)
            .style("display", "none");
    }

    function zoomOut(){
    	d3.transition()
        .duration(2000)
    	.tween("zoomout", function(){
        	let curScale = country.scale();
            return function(t){
                let scl = t > 0.8115 ? countryScale : curScale-t*countryZoomedScale*countryScale;
                country.scale(scl);
                svgCountry.selectAll("path.land").attr("d", countryPath);
                svgCountry.attr('opacity', t);
                if(t>=1){
                    options.style("display", "block");
                    marker.append("circle")
                    .attr("cx", function(d) {
                        let cx = country([d.station.geo[1], d.station.geo[0]]);
                        return cx == null ? 0 : cx[0];
                    })
                    .attr("cy", function(d) {
                        let cy = country([d.station.geo[1], d.station.geo[0]]);
                        return cy == null ? 0 : cy[1];
                    })
                    .attr("r", 12)
                    .style("fill", function(d){
                        let aqi = d.aqi;
                        if(aqi < 51){ //green
                            return "#14a76c";
                        }else if(aqi < 101){ //yellow
                            return "#ffe400";
                        }else if(aqi < 151){ //orange
                            return "#ff652f";
                        }else if(aqi < 201){ //pink
                            return "#c3073f";
                        }else if(aqi < 301){ //purple
                            return "#950740";
                        }else{ //red
                            return "#6f2232";
                        }
                    });
                    g.selectAll("circle").style("display", "block");
                }
            }
        });
    }

    function zoomIn(){
        reset();
        tempBtn.css("display", "none");
        windBtn.css("display", "none");
        humidBtn.css("display", "none");
        g.selectAll("circle").style("display", "none");
        g.attr("transform", "translate(" + width/2 + "," + height/2 + ")scale(" + 1 + ")translate(" + -width/2 + "," + -height/2 + ")");
        g.selectAll("path")
          .classed("active", false);
        d3.transition()
        .duration(2000)
        .tween("zoomin", function(){
            return function(t){
                closeCountry.style('display', 'none');
                let scl = t*countryZoomedScale*countryScale+countryScale;
                country.scale(scl);
                svgCountry.selectAll("path.land").attr("d", countryPath);
                svgCountry.attr('opacity', 1-t);
                if(t>=1){
                    svgCountry.style('display', 'none');
                    svgGlobe.style('display', 'block');
                }
            }
        })
        .transition()
        .tween("zoomout", function(){
            let curScale = projection.scale();
            let curSpaceScale = space.scale();
            return function(t){
                let scl = t > 0.9995 ? scale : curScale-t*globeZoomedScale*scale;
                let spaceScl = t > 0.9995 ? spaceScale : curSpaceScale-t*globeZoomedScale*spaceScale;
                projection.scale(scl);
                projection.clipAngle(180);
                svgGlobe.selectAll("path.back-country").attr("d", path);
                projection.clipAngle(90);
                svgGlobe.selectAll("path.front-country").attr("d", path);
                space.scale(spaceScl);
                redrawStars();
                svgGlobe.attr('opacity', t);
                if(t>=1) {
                    countryList.style('display', 'block');
                }
            }
        });
    }

    function clicked(d) {
        var x, y, k;

        if (d && centered !== d) {
            closeCountry.style("display", "none");
            var p;
            if(d.aqi){
                p = country([d.station.geo[1], d.station.geo[0]]);
            }else{
                p = countryPath.centroid(d);
            }
            x = p[0];
            y = p[1];
            k = 4;
            centered = d;
        } else {
            closeCountry.style("display", "block")
            x = width / 2;
            y = height / 2;
            k = 1;
            centered = null;
        }

        g.selectAll("path")
            .classed("active", centered && function(d) { return d === centered; });
        if(k === 4){
            g.selectAll("path")
            .attr("opacity", d => d === centered ? 1 : 0.3);

            g.selectAll("circle")
            .attr("opacity", d => d === centered ? 1 : 0.3);
        }else{
            if(humidOn){
                addHumidLayer();
            }else{
                g.selectAll("path").attr("opacity", 1);
            }
            g.selectAll("circle").attr("opacity", 1);
        }

        g.transition()
            .duration(750)
            .attr("transform", "translate(" + width/2 + "," + height/2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / k + "px");

        if(k===4){
          const dataLayer = document.getElementById("data");
          const bars = dataLayer.querySelector('.left');
          const graph = dataLayer.querySelector('.right');

          dataLayer.style.display = 'block';
          dataLayer.style.opacity = 1;
          bars.style.visibility='visible';

          graph.classList.add('animated');
          graph.classList.add('bounceInRight');
          setTimeout(function(){
            graph.classList.remove('bounceInRight');
            }, 1000);

          document.querySelector(".close-data").addEventListener("click", e => {
          graph.classList.add('fadeOutRight');
          bars.style.visibility='hidden';
          document.querySelector(".close").style.display = "block";
          setTimeout(function(){
              graph.classList.remove('fadeOutRight');
              dataLayer.style.display = 'none';
              dataLayer.style.opacity = 0;
            }, 1000);
          })

          const infoBars = Array.from(document.querySelectorAll(".info-holder"));

          infoBars.forEach(e=> {
            e.querySelector(".progress-bar").style.width = 0;
            e.querySelector(".progress-number").innerHTML = "No data";
          }) //initialize value

          const {uid,station:{ name}} = d;

          console.log(d);

          const nameArray = name.split(', ');
          const stationName = nameArray[1] + ' ' + nameArray[0];
          const processedName = stationName.split(' ').join('-');

          console.log(processedName);

          const fetchUrl = `https://api.waqi.info/feed/@${uid}/?token=cc9ba5f6999c729c8b1b36646f4c6f94c4b97ad8`

              fetch(fetchUrl)
                .then(res => res.json())
                .then(res => {
                  console.log(res.data);

                  const { aqi, iaqi } = res.data || {};

                  const airRegex = /no2|so2|o3|pm10|pm25/;

                  const dataArray = iaqi ? Object.entries(iaqi).filter(e => {
                    return airRegex.test(e[0]);
                  }): [];

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
                    progressNumber.innerHTML = quality + "(µg/m3)";
                  });
                });

              let airName = "pm25";
              let timePeriod = 2;

              displayChart(airName, timePeriod, processedName);

              var airButtons = document.querySelectorAll("input[name='air-category']");
              var prevAir = null;
              for (var i = 0; i < airButtons.length; i++) {
                airButtons[i].onclick = function() {
                  if (this !== prevAir) {
                    prevAir = this;
                  }
                  airName = this.value.split("-").join("");

                  displayChart(airName, timePeriod, processedName);
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

                  displayChart(airName, timePeriod, processedName);
                };
              }
        }
    }

    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
          this.parentNode.appendChild(this);
        });
    };

    function reset(){
        tempBtn.removeClass("chosen");
        windBtn.removeClass("chosen");
        humidBtn.removeClass("chosen");
        setWeatherData("", "", "", "");
        g.selectAll("path")
        .style("fill", landColor)
        .attr("opacity", 1);
    }

}

function setWeatherData(cond, temp, wind, humid){
    tooltip.select("#cond-value").text(cond);
    tooltip.select("#temp-value").text(temp);
    tooltip.select("#wind-value").text(wind);
    tooltip.select("#humid-value").text(humid);
}
