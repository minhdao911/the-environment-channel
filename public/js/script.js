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

var countryScale = Math.min(width, height)*5,
    countryZoomedScale = 5,
    centered;
    
var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip"),
  	countryList = d3.select("#globe").append("select").attr("name", "countries"),
    notiText = d3.select("body").append("p").text("This country is unsupported at the moment")
    	.attr("class", "noti"),
    close = d3.select("body").append("p").text("Close").attr("class", "close");    

$(".noti").css({left: width/2-200, top: height/2});
    
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
    
    close.on('click', function(){
    	notiText.style('display', 'none');
        close.style('display', 'none');
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

    function country(cnt, sel) { 
      for(var i = 0; i < cnt.length; i++) {
        if(cnt[i].id == sel) {return cnt[i];}
      }
    };
    
    function mouseover(d){
        countryTooltip.text(countryById[d.id])
        .style("left", (d3.event.pageX + 7) + "px")
        .style("top", (d3.event.pageY - 15) + "px")
        .style("display", "block")
        .style("opacity", 1);
    }
    
    function mouseout(d){
        countryTooltip.style("opacity", 0)
        .style("display", "none");
    }
    
    function mousemove(d){
        countryTooltip.style("left", (d3.event.pageX + 7) + "px")
        .style("top", (d3.event.pageY - 15) + "px");
    }
    
    
    function choose(d){
        countryList.style('display', 'none');
        start = false;
        var rotate = projection.rotate(),
        focusedCountry = country(countries, d),
        p = d3.geo.centroid(focusedCountry);
        svgGlobe.selectAll(".focused").classed("focused", focused = false);
        if(rotate[0] === -p[0] && rotate[1] === -p[1]){
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
                    close.style('display', 'block');
                    svgGlobe.style('display', 'none');
                    if(d == 246){
                        svgCountry.style('display', 'block');
                        queue()
                        .defer(d3.json, "../data/countries/finland.json")
                        .defer(d3.csv, "../data/countries/finland.csv")
                        .await(loadMap);
                    }else{
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

function loadMap(err, json, csv){
  	csv.forEach(d => {
        json.features.forEach(jd => {
            if(jd.properties.text == d.name){
                jd.properties.pop = d.population;
            }
        });
    });

    var features = json.features;
    
    g.selectAll("path")
        .data(features)
        .enter().append("path")
        .attr("class", "land")
        .attr("d", countryPath)
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
        .on('click', clicked);
        
    close.on('click', zoomIn);
        
    zoomOut();
  
    function mouseover(d){
      countryTooltip.text(d.properties.text + ': ' + d.properties.pop)
            .style("left", (d3.event.pageX + 7) + "px")
            .style("top", (d3.event.pageY - 15) + "px")
            .style("display", "block")
            .style("opacity", 1);
    }

    function mouseout(d){
        countryTooltip.style("opacity", 0)
            .style("display", "none");
    }
    
    function zoomOut(){
    	d3.transition()
        .duration(2000)
    	.tween("zoomout", function(){
        	let curScale = country.scale();
            return function(t){
                /* console.log(t); */
                let scl = t > 0.8115 ? countryScale : curScale-t*countryZoomedScale*countryScale;
                /* console.log(scl); */
                country.scale(scl); 
                svgCountry.selectAll("path.land").attr("d", countryPath);
                svgCountry.attr('opacity', t);
            }
        });
    }
    
    function zoomIn(){
        g.attr("transform", "translate(" + width/2 + "," + height/2 + ")scale(" + 1 + ")translate(" + -width/2 + "," + -height/2 + ")");
        g.selectAll("path")
          .classed("active", false);
        d3.transition()
        .duration(2000)
        .tween("zoomin", function(){
            return function(t){
                close.style('display', 'none');
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
            var centroid = countryPath.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 4;
            centered = d;
        } else {
            x = width / 2;
            y = height / 2;
            k = 1;
            centered = null;
        }

        g.selectAll("path")
            .classed("active", centered && function(d) { return d === centered; });

        g.transition()
            .duration(750)
            .attr("transform", "translate(" + width/2 + "," + height/2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / k + "px");
    }
}