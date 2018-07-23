var width = window.innerWidth,
  height = window.innerHeight,
  scale = Math.min(width, height) * 0.35,
  zoomedScale = 8,
  sens = 0.25,
  origin = [0, 0],
  velocity = [0.015, -0.0005],
  t = Date.now(),
  start = true,
  focused;

//Set up outerspace

var space = d3.geo.azimuthalEquidistant()
    .translate([width / 2, height / 2]);

var spaceScale = space.scale() * 3;
space.scale(spaceScale);

var spacePath = d3.geo.path()
    .projection(space)
    .pointRadius(1);

//Set up Earth

var projection = d3.geo.orthographic()
    .scale(scale)
    .rotate([0, 0])
    .translate([width / 2, height / 2])
    .clipAngle(90);

var path = d3.geo.path()
    .projection(projection)
    .pointRadius(2);

var svg = d3.select("body").append("svg")
    .attr("width",  width)
    .attr("height", height);

var starList = createStars(300);
                
var stars = svg.append("g")
    .selectAll("g")
    .data(starList)
    .enter()
    .append("path")
    .attr("class", "star")
    .attr("d", function(d){
      spacePath.pointRadius(d.properties.radius);
      return spacePath(d);
    });

svg.append("path")
  .datum({type: "Sphere"})
  .attr("class", "water")
  .attr("d", path)
  .attr("fill", "yellow");

var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip"),
  countryList = d3.select("body").append("select").attr("name", "countries");

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

    var backCountry = svg.selectAll("path.land")
      .data(countries)
      .enter().append("path")
      .attr("class", "back-country")
      .attr("d", path)
      .on("mouseover", d => mouseover(d))
      .on("mouseout", d => mouseout(d))
      .on("mousemove", d => mousemove(d))
      .on("click", d => choose(d.id));
    
    projection.clipAngle(90);
    
    var frontCountry = svg.selectAll("path.land")
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
    
    function redrawStars(){
      stars.attr("d", function(d){
        spacePath.pointRadius(d.properties.radius);
        return spacePath(d);
      });
    }
    
    function choose(d){
      start = false;
      var rotate = projection.rotate(),
      focusedCountry = country(countries, d),
      p = d3.geo.centroid(focusedCountry);
      svg.selectAll(".focused").classed("focused", focused = false);

    //Globe movement

    (function transition() {
      d3
        .transition()
          .duration(2500)
          .tween("rotate", function() {
            var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
            return function(t) {
              projection.rotate(r(t)).clipAngle(180);
              svg.selectAll("path.back-country").attr("d", path)
              .classed("focused", function(d, i) { return d.id == focusedCountry.id ? focused = d : false; });
              projection.rotate(r(t)).clipAngle(90);
              svg.selectAll("path.front-country").attr("d", path)
              .classed("focused", function(d, i) { return d.id == focusedCountry.id ? focused = d : false; });
              space.rotate(r(t));
              redrawStars();
            };
          })
        .transition()
          .tween("zoomin", function(){
            return function(t){
              projection.scale(t*zoomedScale*scale+scale);
              projection.clipAngle(180);
              svg.selectAll("path.back-country").attr("d", path);
              projection.clipAngle(90);
              svg.selectAll("path.front-country").attr("d", path);
              space.scale(t*zoomedScale*spaceScale+spaceScale);
              redrawStars();
              svg.attr('opacity', 1-t);
            }
          })
        .transition()
          .tween("zoomout", function(){
            let curScale = projection.scale();
            let curSpaceScale = space.scale();
            return function(t){
              let scl = t > 0.9995 ? scale : curScale-t*zoomedScale*scale;
              let spaceScl = t > 0.9995 ? spaceScale : curSpaceScale-t*zoomedScale*spaceScale;
              projection.scale(scl);
              projection.clipAngle(180);
              svg.selectAll("path.back-country").attr("d", path);
              projection.clipAngle(90);
              svg.selectAll("path.front-country").attr("d", path);
              space.scale(spaceScl);
              redrawStars();
            }
          })
      })();
    }
    
    function spin(){
      var timer = d3.timer(function(){
        if(start){
          let dt = Date.now() - t;
          projection.rotate([origin[0] + velocity[0] * dt, origin[1] + velocity[1] * dt]).clipAngle(180);
          svg.selectAll('path.back-country').attr('d', path);
          projection.rotate([origin[0] + velocity[0] * dt, origin[1] + velocity[1] * dt]).clipAngle(90);
          svg.selectAll('path.front-country').attr('d', path);
          space.rotate([origin[0] + velocity[0] * dt, origin[1] + velocity[1] * dt]);
          redrawStars();
        }
      });   
    }
    
    function drag(){
      start = false;
      var rotate = projection.rotate();
      projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]).clipAngle(180);
      svg.selectAll("path.back-country").attr("d", path);
      svg.selectAll(".focused").classed("focused", focused = false);
      projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]).clipAngle(90);
      svg.selectAll("path.front-country").attr("d", path);
      svg.selectAll(".focused").classed("focused", focused = false);
      space.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
      redrawStars();
    }

  };

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