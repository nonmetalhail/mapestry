var audio_length = 512; //audio length in sec

d3.selection.prototype.size = function() {
    var n = 0;
    this.each(function() { ++n; });
    return n;
  };

var w = 100,
    h = $(window).height()-50,
    ch = 5,
    cw = 30,
    caph = 20;

var rows = Math.ceil(h / ch);
var timeInterval = audio_length/rows;

var cells = d3.range(0, rows).map(function (d,i) {
  var row = d;
  return {
    r: row,
    x: ch,
    y: row * ch,
    t: timeInterval * i
  };
});

$(document).ready(function(){
  var svg = d3.select("#audioBar").append("svg")
    .attr("width", w)
    .attr("height", h+cw+cw+ch);

  var rectx = function(d) { return d.x; };
  var recty = function(d) { return d.y + cw; };
  var t = function(d) { return d.t; };

  // var topCell = function(c) { return cells[(c.r - 1) * cols + c.c]; };
  // var leftCell = function(c) { return cells[c.r * cols + c.c - 1]; };
  // var bottomCell = function(c) { return cells[(c.r + 1) * cols + c.c]; };
  // var rightCell = function(c) { return cells[c.r * cols + c.c + 1]; };

  // var topLeftCell = function(c) { return cells[(c.r - 1) * cols + c.c - 1]; };
  // var bottomLeftCell = function(c) { return cells[(c.r + 1) * cols + c.c - 1]; };
  // var bottomRightCell = function(c) { return cells[(c.r + 1) * cols + c.c + 1]; };
  // var topRightCell = function(c) { return cells[(c.r - 1) * cols + c.c + 1]; };

  var hovered;
  var mouseDown = false;
  var isHighlighted = false;
  var cell = svg.selectAll(".cell")
    .data(cells)
    .enter().append("rect")
    // .attr("class", function(d) { 
    //   //add conditional for selected
    //   var type = (d.r == 0 || d.r == rows - 1) ? "wall" : "air";
    //   return "cell " + type; 
    // })
    .attr("class","cell")
    .attr("x", rectx)
    .attr("y", recty)
    .attr('t',t)
    .attr("width", cw)
    .attr("height", ch)
    .on("mouseover", function() {
      var p = d3.mouse(this);
      hovered = d3.select(this);
      hovered.classed("hovered", true);
      if(mouseDown){
        hovered.classed('highlighted',isHighlighted);
        console.log(d3.select(this).attr('t'));
      }
    })
    .on("mouseout", function() {
      hovered.classed("hovered", false);
    })
    .on("mousedown", function() {
      mouseDown = true;
      isHighlighted = !(d3.select(this).classed("highlighted"));
      d3.select(this).classed('highlighted',isHighlighted);
      console.log(d3.select(this).attr('t'));
    });

    $(document).on("mouseup",function(){
      mouseDown = false;
    });

    svg.append('rect')
    .attr("class","wall")
    .attr("x", ch)
    .attr("y", 0)
    .attr("width", cw)
    .attr("height", cw);

    svg.append('rect')
    .attr("class","wall")
    .attr("x", ch)
    .attr("y", h+cw+ch)
    .attr("width", cw)
    .attr("height", cw);

    // var start = $('.cell:not(.highlighted) + .cell.highlighted');
    // var end = $('.cell.highlighted + .cell:not(.highlighted)').prev();
});