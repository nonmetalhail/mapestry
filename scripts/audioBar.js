var audio_length = 512; //audio length in sec

// mockup of photo and locations for future dynamic input
var photos = {
  'p1':"gg01.jpg",
  'p2':"gg09.jpg",
  'p3':"gg10.jpg",
  'p4':"gg11_2.jpg"
};
var photos = {
  'l1':{"lat":123.1,"lng":42.2},
  'l2':{"lat":123.1,"lng":42.2},
  'l3':{"lat":123.1,"lng":42.2},
  'l4':{"lat":123.1,"lng":42.2}
};

//metadata brought in from recorder
var themes = [0,80,200,310,360,400];
var bookmarks = [100,120,160,220,250,290,340,400,473,500]
var images = [
  {
    "time":20,
    "id":"gg01.jpg",
  },
  {
    "time":80,
    "id":"gg09.jpg",
  },
  {
    "time":130,
    "id":"gg10.jpg",
  },
  {
    "time":370,
    "id":"gg11_2.jpg",
  }
];

var locations = [
  {
    "time":30,
    "id":'#l1',
  },
  {
    "time":90,
    "id":'#l2',
  },
  {
    "time":245,
    "id":'#l3',
  },
  {
    "time":295,
    "id":'#l4',
  },
  {
    "time":380,
    "id":'#l5',
  },
  {
    "time":480,
    "id":'#l6',
  }
];

var svg;
var hovered;
var mouseDown = false;
var isHighlighted = false;

//remove complains if null, so set it to nothing to start
var bmarks = d3.selectAll('first'), 
  placePins = d3.selectAll('first'),
  mediaPins = d3.selectAll('first');

var w = $(window).innerWidth()-100,
    h = 100,
    ch = 30,
    cw = 5,
    caph = 20,
    offset = ch+5;

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

var rectx = function(d) { return d.x + ch; };
var recty = function(d) { return d.y+offset; };
var t = function(d) { return d.t; };
var timeX = function(d){
  var index = Math.round(d / timeInterval);
  return index * cw + ch
}

$(document).ready(function(){
  var tabHeight = (window.innerHeight - $('.navbar').outerHeight())*.6;
  $('.tabScroll').css('height',tabHeight);

  $(document).on("mouseup",function(){
    mouseDown = false;
  });

  svg = d3.select("#audioBar").append("svg")
    .attr("width", w+ch+ch+cw)
    .attr("height", h);

  // var topCell = function(c) { return cells[(c.r - 1) * cols + c.c]; };
  // var leftCell = function(c) { return cells[c.r * cols + c.c - 1]; };
  // var bottomCell = function(c) { return cells[(c.r + 1) * cols + c.c]; };
  // var rightCell = function(c) { return cells[c.r * cols + c.c + 1]; };

  // var topLeftCell = function(c) { return cells[(c.r - 1) * cols + c.c - 1]; };
  // var bottomLeftCell = function(c) { return cells[(c.r + 1) * cols + c.c - 1]; };
  // var bottomRightCell = function(c) { return cells[(c.r + 1) * cols + c.c + 1]; };
  // var topRightCell = function(c) { return cells[(c.r - 1) * cols + c.c + 1]; };

  
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

  insertPins();

  var theme = svg.selectAll('theme')
    .data(themes)
    .enter().append("line")
    .attr("class","theme")
    .attr('t',function(d){ return d })
    .attr("x1", timeX)
    .attr("x2", timeX)
    .attr("y1", offset+ch-5)
    .attr("y2", offset+ch*2+5);

  $('.crop_image').each(function(){
    var f = $(this).attr('image');
    $(this).css('background-image','url(images/story/'+f+')');
  });

  assetListeners($('.asset'));
  projectListeners($('#audioBar'));
  $('.asset').on({
    mouseover:function(){
      var aid = $(this).attr('id');
      $('[aid="'+aid+'""]').toggleClass('assetHover');
    },
    mouseout:function(){
      var aid = $(this).attr('id');
      $('[aid="'+aid+'""]').toggleClass('assetHover');
    }
  });
});

function insertPins(){
  function _dragStuff(d,i){
    var l = d3.select(this).select('line');
    var t = d3.select(this).select('text');

    var newX1 = parseInt(l.attr('x1')) + d3.event.dx;
    var newX = parseInt(t.attr('x')) + d3.event.dx;
    var newTime = (newX1-ch)/cw*timeInterval;
    console.log(d);
    if(newTime >= 0){
      if(d.time){
        d.time = newTime;
      }
      else{
        console.log('else');
        console.log(i);
        bookmarks[i] = newTime;
      }
      console.log(d);

      d3.select(this).attr('t',d);
      l.attr('x1',newX1);
      l.attr('x2',newX1);
      t.attr('x',newX);
    }
  }

  var drag = d3.behavior.drag()
    .origin(Object)
    .on("drag", _dragStuff);

  bmarks.remove();
  placePins.remove();
  mediaPins.remove();

  bmarks = svg.selectAll('bookmarks')
    .data(bookmarks)
    .enter().append("g")
    .attr("class","bookmarks")
    .attr('t',function(d){ return d})
    .on("mouseover", function() {
      var bm = d3.selectAll(this.childNodes);
      bm.classed("pinOver", true);
    })
    .on("mouseout", function() {
      var bm = d3.selectAll(this.childNodes);
      bm.classed("pinOver", false);
    })
    .call(drag);

    bmarks.append("line")
    .attr("x1", timeX)
    .attr("x2", timeX)
    .attr("y1", offset+ch-30)
    .attr("y2", offset+ch*2+5);

    bmarks.append("text")
    .attr("x", function(d){ return timeX(d)-12 })
    .attr("y", offset+ch-40)
    .attr("font-family","FontAwesome")
    .attr("class","bookmarkIcon")
    .text("");  //star

  placePins = svg.selectAll('location')
    .data(locations)
    .enter().append("g")
    .attr("class","location")
    .attr('t',function(d){ return d.time })
    .attr('aid',function(d){ return d.id })
    .on("mouseover", function() {
      var bm = d3.selectAll(this.childNodes);
      bm.classed("pinOver", true);
    })
    .on("mouseout", function() {
      var bm = d3.selectAll(this.childNodes);
      bm.classed("pinOver", false);
    })
    .call(drag);

    placePins.append("line")
    .attr("x1", function(d){ return timeX(d.time) })
    .attr("x2", function(d){ return timeX(d.time) })
    .attr("y1", offset+ch-30)
    .attr("y2", offset+ch*2+5);

    placePins.append("text")
    .attr("x", function(d){ return timeX(d.time)-7 })
    .attr("y", offset+ch-40)
    .attr("font-family","FontAwesome")
    .attr("class","pins")
    .text("");  //map

  mediaPins = svg.selectAll('media')
    .data(images)
    .enter().append("g")
    .attr("class","media")
    .attr('t',function(d){ return d.time })
    .attr('aid',function(d){ return d.id })
    .on("mouseover", function() {
      var bm = d3.selectAll(this.childNodes);
      bm.classed("pinOver", true);
    })
    .on("mouseout", function() {
      var bm = d3.selectAll(this.childNodes);
      bm.classed("pinOver", false);
    })
    .call(drag);

    mediaPins.append("line")
    .attr("x1", function(d){ return timeX(d.time) })
    .attr("x2", function(d){ return timeX(d.time) })
    .attr("y1", offset+ch-30)
    .attr("y2", offset+ch*2+5);

    mediaPins.append("text")
    .attr("x", function(d){ return timeX(d.time)-7 })
    .attr("y", offset+ch-40)
    .attr("font-family","FontAwesome")
    .attr("class","pins")
    .text("");  //picture
}

function projectListeners(projects){
  $(projects).each(function(){
    $(this).droppable({ 
      accept: ".asset",
      tolerance: 'pointer',
      drop: function( event, ui ) {
        if($('.cell.hovered').length > 0){
          var t = $('.cell.hovered').attr('t');
          if(ui.draggable.attr('type') == 'location'){
            var aid = ui.draggable.attr('id');
            locations.push({"time":t,"id":aid});
          }
          else if(ui.draggable.attr('type') == 'photo'){
            var aid = ui.draggable.attr('id');
            images.push({"time":t,"id":aid});
          }
          else{console.log("unknown pin");}

          insertPins();
        }
        // var itemID = ui.draggable.attr('id');
        // var text = ui.draggable.find('.asset_name:first-child').text();
        // var mCount = ui.draggable.find('.media_count').text();
        // var el = $(this);

        // var projectName = $(this).find('.project_name').text();
        // var pid = $(this).attr('id');

        // el.find('.audio .count').text(parseInt(el.find('.audio .count').text()) + 1);
        // el.find('.components').append('<li class="'+itemID+'">'+text+' <i class="story_del fui-cross-16"></i></li>');
        // el.find('.media .count').text(parseInt(el.find('.media .count').text())+parseInt(mCount));

        // ui.draggable.find( ".none" ).remove();
        // ui.draggable.find('.asset_projects').append('<li class="placeholder '+pid+'">'+projectName+'</li>');
      }
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
      // stop: function (event, ui) {

      // }
    });
  });
}

//how to get start and end of ranges.
 // var start = $('.cell:not(.highlighted) + .cell.highlighted');
  // var end = $('.cell.highlighted + .cell:not(.highlighted)').prev();



