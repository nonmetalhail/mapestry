var audio_length = 512; //audio length in sec
var themes = [0,80,200,310,360,400];
var bookmarks = [100,120,160,220,250,290,340,400,473,500];
var images = {
  20:"gg01.jpg",
  80:"gg09.jpg",
  130:"gg10.jpg",
  370:"gg11_2.jpg"
};
var locations = {
  30:'#l1',
  90:'#l2',
  245:'#l3',
  295:'#l4',
  380:'#l5',
  480:'#l6'
};

d3.selection.prototype.size = function() {
    var n = 0;
    this.each(function() { ++n; });
    return n;
  };

var w = $(window).innerWidth()-100,
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
  var tabHeight = (window.innerHeight - $('.navbar').outerHeight())*.6;
  $('.tabScroll').css('height',tabHeight);

  var svg = d3.select("#audioBar").append("svg")
    .attr("width", w+ch+ch+cw)
    .attr("height", h);

  var rectx = function(d) { return d.x + ch; };
  var recty = function(d) { return d.y+ch; };
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
    .attr("class","cell")
    .attr("x", rectx)
    .attr("y", recty)
    .attr("width", cw)
    .attr("height", ch)
    .attr("rx", 3)
    .attr("ry", 3)
    .attr('t',t)
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
    .data(bookmarks)
    .enter().append("line")
    .attr("class","generic")
    .attr('t',function(d){ return d })
    .attr("x1", timeX)
    .attr("x2", timeX)
    .attr("y1", ch+ch-30)
    .attr("y2", ch+ch*2+5);

    var theme = svg.selectAll('theme')
    .data(themes)
    .enter().append("line")
    .attr("class","theme")
    .attr('t',function(d){ return d })
    .attr("x1", timeX)
    .attr("x2", timeX)
    .attr("y1", ch+ch-5)
    .attr("y2", ch+ch*2+5);

  $('.crop_image').each(function(){
    var f = $(this).attr('image');
    $(this).css('background-image','url(images/story/'+f+')');
  });

  assetListeners($('.asset'));
  projectListeners($('#audioBar'))
});

function projectListeners(projects){
  $(projects).each(function(){
    $(this).droppable({ 
      accept: ".asset",
      tolerance: 'pointer',
      // drop: function( event, ui ) {
      //   console.log($('.cell.hovered').attr('t'));
      //   console.log('drop');
      //   // var itemID = ui.draggable.attr('id');
      //   // var text = ui.draggable.find('.asset_name:first-child').text();
      //   // var mCount = ui.draggable.find('.media_count').text();
      //   // var el = $(this);

      //   // var projectName = $(this).find('.project_name').text();
      //   // var pid = $(this).attr('id');

      //   // el.find('.audio .count').text(parseInt(el.find('.audio .count').text()) + 1);
      //   // el.find('.components').append('<li class="'+itemID+'">'+text+' <i class="story_del fui-cross-16"></i></li>');
      //   // el.find('.media .count').text(parseInt(el.find('.media .count').text())+parseInt(mCount));

      //   // ui.draggable.find( ".none" ).remove();
      //   // ui.draggable.find('.asset_projects').append('<li class="placeholder '+pid+'">'+projectName+'</li>');
      // }
    });  //droppable

    // $(this).on("click",'.story_del',function(){
    //   var el = $(this);
    //   var sid = el.parent().attr('class');
    //   var pid = el.parents('.folders').attr('id');
    //   var mCount = parseInt($('#'+sid).find('.media_count').text());
    //   var pC = parseInt(el.parents('.audio').siblings('.media').find('.count').text());
      
    //   el.parents('.audio').find('.count').text(parseInt(el.parents('.audio').find('.count').text()) - 1);
    //   el.parents('.audio').siblings('.media').find('.count').text(pC-mCount);

    //   el.parent().remove();
    //   $('#'+sid).find('.'+pid+':last').remove();
    // });
  }); //projects
}

function assetListeners(assets){
  assets.each(function(){
    $(this).draggable({
      appendTo:'body',
      revert: 'invalid', 
      // helper: "clone",
      revertDuration:250,
      helper: function(e){
        var helperDiv = [];
        if($(this).attr('type') == 'location'){
          var markerType = 'icon-map-marker';
        }
        else{
          var markerType = 'icon-picture';
        }
        helperDiv.push('<div class="audio_helper">');
        helperDiv.push('<i class="'+markerType+'"></i></div>');
        return $(helperDiv.join(''));
      },
      start: function (event, ui) {
        $(ui.helper).css("margin-left", event.clientX - $(event.target).offset().left-25);
        $(ui.helper).css("margin-top", event.clientY - $(event.target).offset().top-45);
      },
      stop: function (event, ui) {
        console.log($('.cell.hovered').attr('t'));
      }
    });
  });
}

//how to get start and end of ranges.
 // var start = $('.cell:not(.highlighted) + .cell.highlighted');
  // var end = $('.cell.highlighted + .cell:not(.highlighted)').prev();



