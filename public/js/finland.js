var width = window.innerWidth, height = window.innerHeight, centered;
var geojsonUrl = "../data/countries/finland.json";
var csvUrl = "../data/countries/finland.csv";
var scale = Math.min(width, height)*5;

console.log(width/2);
console.log(height/2);

var projection = d3.geo.mercator()
  .scale(scale)
  .rotate([-26,-64.5,0])
  .translate([width/2, height/2]);
  // .fitExtent([0, 0], [width, height]);

var path = d3.geo.path()
  .projection(projection);

var svg = d3.select("body").append('svg')
  .attr('width', width)
  .attr('height', height);
  
var g = svg.append('g');

var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip");

queue()
	.defer(d3.json, geojsonUrl)
	.defer(d3.csv, csvUrl)
	.await(ready);

function ready(error, json, csv){
    /* console.log(cities) */;

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
        .attr("d", path)
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
        .on('click', clicked);
};

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

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
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

  console.log('x', x);
  console.log('y', y);
  console.log('k', k);

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}
