var audio_length = 512; //audio length in sec
var themes = [0,80,200,310,360,400];
var markers = [100,120,160,220,250,290,340,400,473,500];

d3.selection.prototype.size = function() {
    var n = 0;
    this.each(function() { ++n; });
    return n;
  };

var w = $(window).innerWidth()-125,
    h = 100,
    ch = 30,
    cw = 5,
    caph = 20;

var cols = Math.ceil(w / cw);
var timeInterval = audio_length/cols;

var cells = d3.range(0, cols).map(function (d,i) {
  var col = d;
  return {
    r: col,
    x: cw * col,
    y: ch,
    t: timeInterval * i
  };
});

$(document).ready(function(){
  var svg = d3.select("#audioBar").append("svg")
    .attr("width", w+ch+ch+cw)
    .attr("height", h);

  var rectx = function(d) { return d.x + ch; };
  var recty = function(d) { return d.y; };
  var t = function(d) { return d.t; };
  var timeX = function(d){
    var index = Math.round(d / timeInterval);
    return index * cw + ch
  }

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
    })
    .on("click",function(){console.log($(this).attr('t'))});

    $(document).on("mouseup",function(){
      mouseDown = false;
    });

    // svg.append('rect')
    // .attr("class","wall")
    // .attr("x", cw)
    // .attr("y", ch)
    // .attr("width", ch)
    // .attr("height", ch);

    // svg.append('rect')
    // .attr("class","wall")
    // .attr("x", ch + cw + w)
    // .attr("y", ch)
    // .attr("width", ch)
    // .attr("height", ch);

    var generic = svg.selectAll('generic')
      .data(markers)
      .enter().append("line")
      .attr("class","generic")
      .attr('t',function(d){ return d })
      .attr("x1", timeX)
      .attr("x2", timeX)
      .attr("y1", ch)
      .attr("y2", ch*2.5);

      var theme = svg.selectAll('theme')
      .data(themes)
      .enter().append("line")
      .attr("class","theme")
      .attr('t',function(d){ return d })
      .attr("x1", timeX)
      .attr("x2", timeX)
      .attr("y1", ch-5)
      .attr("y2", ch*2+5);

    // var start = $('.cell:not(.highlighted) + .cell.highlighted');
    // var end = $('.cell.highlighted + .cell:not(.highlighted)').prev();
});