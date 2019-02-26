var yeardiv = d3.select("body").append("div")


var timechart;


var button1993 = d3.select("body").append("input")
  .attr("type","button")
  .attr("value", "1993")
  .on("click", function(){
    d3.select("svg").remove();
    chart = draw("1993");
})

var button1998 = d3.select("body").append("input")
  .attr("type","button")
  .attr("value", "1998")
  .on("click", function(){
    d3.select("svg").remove();
    chart = draw("1998");
})

var button2004 = d3.select("body").append("input")
  .attr("type","button")
  .attr("value", "2004")
  .on("click", function(){
    d3.select("svg").remove();
    chart = draw("2004");
})

var button2009 = d3.select("body").append("input")
  .attr("type","button")
  .attr("value", "2009")
  .on("click", function(){
    d3.select("svg").remove();
    chart = draw("2009");
})

var button2014 = d3.select("body").append("input")
  .attr("type","button")
  .attr("value", "2014")
  .on("click", function(){
    d3.select("svg").remove();
    chart = draw("2014");
})

var margin = {top: 30, right: 10, bottom: 10, left: 10},
      width = 1260 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

function draw(year){ 
  yeardiv.text("Data for year "+ year);

  

  var x = d3.scale.ordinal().rangePoints([0, width], 1),
      y = {},
      dragging = {};

  var line = d3.svg.line(),
      axis = d3.svg.axis().orient("left"),
      background,
      foreground;

  var highlighted = null; 

  svg = d3.select("body").append("svg")
      .attr("class", "parallel")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var div = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0);



  var randomColor = (function(){
    var golden_ratio_conjugate = 0.618033988749895;
    var h = Math.random();

    var hslToRgb = function (h, s, l){
        var r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return '#'+Math.round(r * 255).toString(16)+Math.round(g * 255).toString(16)+Math.round(b * 255).toString(16);
    };
    
    return function(){
      h += golden_ratio_conjugate;
      h %= 1;
      return hslToRgb(h, 0.5, 0.60);
    };
  })();



  d3.csv("data.csv", function(error, cars) {

    //window.location.reload(true);

    cars = cars.filter(function(d){return d.Year == year;})

    // Extract the list of dimensions and create a scale for each.
    x.domain(dimensions = d3.keys(cars[0]).filter(function(d) {
      var column_list = ["Independence","Thrift","Unselfishness","Religiousness","Imagination","Respectfulness","Determination","hardworking","Obedience"];
      return column_list.indexOf(d) >= 0 && (y[d] = d3.scale.linear()

          .domain(d3.extent(cars, function(p) { return +p[d]; }))
          .range([height, 0]));
    }));

    // Add grey background lines for context.
    background = svg.append("g")
        .attr("class", "background")
      .selectAll("path")
        .data(cars)
      .enter().append("path")
        .attr("d", path);

    // Add blue foreground lines for focus.
    foreground = svg.append("g")
        .attr("class", "foreground")
      .selectAll("path")
        .data(cars)
      .enter().append("path")
        .attr("d", path)
        .style("stroke", randomColor)
        .on("mouseover", function(d) {	
        	  if (highlighted==null){
        	  	d3.select(this).attr("d", path).style("stroke-width", "5px")
        	  }
  	      div.transition()		
  	          .duration(200)		
  	          .style("opacity", .9);		
  	      div	.html(d.Country)	
  	          .style("left", (d3.event.pageX) + "px")		
  	          .style("top", (d3.event.pageY - 28) + "px");	
  	  })					
        .on("mouseout", function(d) {	
        	  if (highlighted==null){
        	  	d3.select(this).attr("d", path).style("stroke-width", "3px")	
        	  }
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        })
        .on("click", highlight);


    // Add a group element for each dimension.
    var g = svg.selectAll(".dimension")
        .data(dimensions)
      .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .call(d3.behavior.drag()
          .origin(function(d) { return {x: x(d)}; })
          .on("dragstart", function(d) {
            dragging[d] = x(d);
            background.attr("visibility", "hidden");
          })
          .on("drag", function(d) {
            dragging[d] = Math.min(width, Math.max(0, d3.event.x));
            foreground.attr("d", path);
            dimensions.sort(function(a, b) { return position(a) - position(b); });
            x.domain(dimensions);
            g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
          })
          .on("dragend", function(d) {
            delete dragging[d];
            transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
            transition(foreground).attr("d", path);
            background
                .attr("d", path)
              .transition()
                .delay(500)
                .duration(0)
                .attr("visibility", null);
          }));

    // Add an axis and title.
    g.append("g")
        .attr("class", "axis")
        .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
      .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; });

    // Add and store a brush for each axis.
    g.append("g")
        .attr("class", "brush")
        .each(function(d) {
          d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
        })
      .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);
  });

  function equalToEventTarget() {
  	return this == d3.event.target;
  }

  d3.select("body").on("click", function(){
  	var outside = d3.selectAll("path").filter(equalToEventTarget).empty();
  	if (outside && highlighted!=null){
  		lowlight();
  	}

  });

  function highlight(d) {
    if (highlighted!=null){
    	lowlight();
    }
    d3.select(this).attr("d", path).style("stroke-width", "10px");
    highlighted=d3.select(this).attr("d", path);
    d3.select("body").selectAll("h2").style("display", "block");
    d3.select("body").selectAll("p.interests")
    	.text(d.Year)
    	.style("display", "block");
    d3.select("body").selectAll("p.learn")
    	.text(d.Independance)
    	.style("display", "block");
  }

  function lowlight() {
  	highlighted.style("stroke-width", "3px");
  	highlighted=null;
  	d3.select("body").selectAll("h2").style("display", "none");
  	d3.select("body").selectAll("p.interests")
    		.text("")
    		.style("display", "none");
    	d3.select("body").selectAll("p.learn")
    		.text("")
    		.style("display", "none");

  }

  function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
  }

  function transition(g) {
    return g.transition().duration(500);
  }

  // Returns the path for a given data point.
  function path(d) {
    return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
  }

  function brushstart() {
    d3.event.sourceEvent.stopPropagation();
  }

  // Handles a brush event, toggling the display of foreground lines.
  function brush() {
    var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
        extents = actives.map(function(p) { return y[p].brush.extent(); });
    foreground.style("display", function(d) {
      return actives.every(function(p, i) {
        return extents[i][0] <= d[p] && d[p] <= extents[i][1];
      }) ? null : "none";
    });
  }
}

chart = draw("2014");







//window.location.reload(true)





