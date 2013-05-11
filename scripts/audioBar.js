var audio_length = 512; //audio length in sec

// mockup of photo and locations for future dynamic input
var photos = {
  'p1':"gg01.jpg",
  'p2':"gg09.jpg",
  'p3':"gg10.jpg",
  'p4':"gg11_2.jpg",
  'p5':"gg13.jpg",
  'p6':"gg14.jpg",
  'p7':"gg21.jpg",
  'p8':"paramount_theater.jpg",
  'p9':"waterloo_home.jpg"
};
var loc = {
  'l1':{"lat":123.1,"lng":42.2},
  'l2':{"lat":123.1,"lng":42.2},
  'l3':{"lat":123.1,"lng":42.2},
  'l4':{"lat":123.1,"lng":42.2}
};

//metadata brought in from recorder
var themes = [0,80,200,310,360,400];
var bookmarks = [100,120,220,250,340,410,500]
var images = [
  {
    "time":155,
    "id":"p1",
  },
  {
    "time":370,
    "id":"p4",
  }
];

var locations = [
  {
    "time":30,
    "id":'l1',
  },
  {
    "time":230,
    "id":'l3',
  },
  {
    "time":480,
    "id":'l3',
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

var audioTime,audioPlayer;
var currentTime = [0];
var qStart = themes[0];
var qEnd = themes[1];

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
  return index * cw + ch + timeInterval
}

$(document).ready(function(){
  buildBookmarks();
  $('.thumbnail').imageZoom();

  var tabHeight = (window.innerHeight - $('.navbar').outerHeight())*.45;
  $('.tabScroll').css('height',tabHeight);

  $(document).on("mouseup",function(){
    mouseDown = false;
  });

  svg = d3.select("#audioBar").append("svg")
    .attr("width", w+ch+ch+cw)
    .attr("height", h+20);

  var cell = svg.selectAll(".cell")
    .data(cells)
    .enter().append("rect")
    .attr("class",function(d){
      var n = findIndex(d.t,0,themes.length);
      return (n % 2 == 0)?'cell cell1':'cell cell2'
    })
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
      }
    })
    .on({
      mouseout: function() {
        hovered.classed("hovered", false);
      },
      mousedown: function() {
        mouseDown = true;
        isHighlighted = !(d3.select(this).classed("highlighted"));
        d3.select(this).classed('highlighted',isHighlighted);
      }
    })
    .on("click",function(){console.log($(this).attr('t'))});

  insertPins();

  var theme = svg.selectAll('theme')
    .data(themes)
    .enter().append("g");

  theme.append("line")
    .attr("class","theme")
    .attr('t',function(d){ return d })
    .attr("x1", timeX)
    .attr("x2", timeX)
    .attr("y1", offset+ch)
    .attr("y2", offset+ch*2);
  theme.append("text")
  .attr("class","theme")
  .attr("x", function(d){
    return timeX(d) - 11
  })
  .attr("y", offset+ch*2+15)
  .text(function(d){
    var mm = parseInt(d/60);
    var ss = ''+(d%60);
    if(ss.length < 2){
      ss = '0'+ss;
    }
    return ''+mm+':'+ss
  });

  function _dragAudio(d,i){
    var at = d3.select(this);

    var newX = d3.event.dx;
    var newTime = currentTime[0] + newX/cw*timeInterval;
    
    if(newTime >= 0){
      currentTime[0] = newTime;
      audioPlayer.currentTime = newTime;
      audioTime.attr('transform','translate('+(timeX(currentTime[0])-ch-timeInterval)+',0)');
    }
  }

  var dragAudio = d3.behavior.drag()
    .origin(Object)
    .on("drag", _dragAudio);

  
  audioTime = svg.selectAll('audioTime')
    .data(currentTime)
    .enter().append("polyline")
    .attr("class","audioTime")
    .attr('points',function(d){ 
      var pts = [];
      var x1 = timeX(d) - 5;
      var x2 = timeX(d) + 5;
      var x3 = timeX(d);
      var y1 = offset+ch-25;
      var y2 = offset+ch-15;
      var y3 = offset+ch*2+15;
      var y4 = offset+ch*2+25;

      pts.push(''+x3+','+y2);
      pts.push(''+x1+','+y1);
      pts.push(''+x2+','+y1);
      pts.push(''+x3+','+y2);
      pts.push(''+x3+','+y3);
      pts.push(''+x2+','+y4);
      pts.push(''+x1+','+y4);
      pts.push(''+x3+','+y3);
      return pts.join(' ')
    })
    .call(dragAudio);

  displayImage($('.crop_image'));
  assetListeners($('.asset'));
  projectListeners($('#audioBar'));

  $('.asset').on({
    mouseover:function(){
      var aid = $(this).attr('id');
      d3.selectAll('[aid="'+aid+'"]').classed('assetHover',true);
    },
    mouseout:function(){
      var aid = $(this).attr('id');
      d3.selectAll('[aid="'+aid+'"]').classed('assetHover',false);
    }
  });

  audioPlayer = $('#audioPlayer')[0];

  $('#playButton').on("click", function(){
    if($('#playButton i').hasClass('icon-pause')){
      audioPlayer.pause();  
    }
    else{
      audioPlayer.play();      
    }
    $('#playButton i').toggleClass('icon-play-circle');
    $('#playButton i').toggleClass('icon-pause');
  });
  var lastTime = 0;
  audioPlayer.addEventListener("timeupdate", function(e){
    currentTime[0] = audioPlayer.currentTime;
    audioTime.attr('transform','translate('+(timeX(currentTime[0])-ch-timeInterval)+',0)');

    if(currentTime[0] < qStart){
      console.log("less");
      console.log(qStart);
      console.log(qEnd);
      var oldTime = $('#questionList li.active');
      var newTime = oldTime.prev();
      qEnd = qStart;
      qStart = newTime.attr('t');
      oldTime.removeClass('active');
      newTime.addClass('active');
      console.log(qStart);
      console.log(qEnd);
    }
    else if(qEnd < currentTime[0]){
      console.log("greater");
      console.log(qStart);
      console.log(qEnd);
      var oldTime = $('#questionList li.active');
      var newTime = oldTime.next();
      console.log(oldTime[0]);
      console.log(newTime[0]);
      qStart = qEnd;
      qEnd = newTime.next().attr('t');
      oldTime.removeClass('active');
      newTime.addClass('active');
      console.log(qStart);
      console.log(qEnd); 
    }
  });

  $('#questionList').on('click',"li",function(){
    var t = $(this).attr('t');
    if(t=='p'){
      var oldTime = $(this).siblings('.active');
      var newTime = $(this).siblings('.active').prev();
      if(!newTime.hasClass('previous')){
        oldTime.removeClass('active');
        newTime.addClass('active');
        audioPlayer.currentTime = newTime.attr('t');
      }
    }
    else if(t=='n'){
      var oldTime = $(this).siblings('.active');
      var newTime = $(this).siblings('.active').next();
      if(!newTime.hasClass('next')){
        oldTime.removeClass('active');
        newTime.addClass('active');
        audioPlayer.currentTime = newTime.attr('t');
      }
    }
    else{
      $(this).siblings('.active').removeClass('active');
      $(this).addClass('active');
      audioPlayer.currentTime = t;
    }
    qStart = $('#questionList .active').attr('t');
    qEnd = $('#questionList .active').next().attr('t');
    if(qEnd == 'n'){
      qEnd = audio_length;
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

      d3.select(this).attr('t',newTime);
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
    .on({
      mouseover: function() {
        var bm = d3.selectAll(this.childNodes);
        bm.classed("pinOver", true);
      },
      mouseout: function() {
        var bm = d3.selectAll(this.childNodes);
        bm.classed("pinOver", false);
      }
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
    .text("");  //star

  placePins = svg.selectAll('location')
    .data(locations)
    .enter().append("g")
    .attr("class","location")
    .attr('t',function(d){ return d.time })
    .attr('aid',function(d){ return d.id })
    .on({
      mouseover: function() {
        var aid = $(this).attr('aid');
        var bm = d3.selectAll(this.childNodes);
        bm.classed("pinOver", true);
        $('#'+aid).toggleClass('pinHovered');
      },
      mouseout: function() {
        var aid = $(this).attr('aid');
        var bm = d3.selectAll(this.childNodes);
        bm.classed("pinOver", false);
        $('#'+aid).toggleClass('pinHovered');
      }
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
    .on({
      mouseover: function() {
        var aid = $(this).attr('aid');
        var bm = d3.selectAll(this.childNodes);
        bm.classed("pinOver", true);
        $('#'+aid).toggleClass('pinHovered');
      },
      mouseout: function() {
        var aid = $(this).attr('aid');
        var bm = d3.selectAll(this.childNodes);
        bm.classed("pinOver", false);
        $('#'+aid).toggleClass('pinHovered');
      },
      click:function(){
        var aid = $(this).attr('aid');
        $('#'+aid).find('.thumbnail').trigger("click");
      }
    })
    .call(drag);

  mediaPins.append("line")
    .attr("x1", function(d){ return timeX(d.time) })
    .attr("x2", function(d){ return timeX(d.time) })
    .attr("y1", offset+ch-30)
    .attr("y2", offset+ch*2+5);

  mediaPins.append("text")
    .attr("x", function(d){ return timeX(d.time)-13 })
    .attr("y", offset+ch-40)
    .attr("font-family","FontAwesome")
    .attr("class","pins")
    .text("");  //picture
}

function displayImage(sel){
  sel.each(function(){
    var f = $(this).attr('image');
    $(this).css('background-image','url(images/story/'+f+')');
  });
}

function projectListeners(projects){
  $(projects).each(function(){
    $(this).droppable({ 
      accept: ".asset",
      tolerance: 'pointer',
      drop: function( event, ui ) {
        if($('.cell.hovered').length > 0){
          var t = $('.cell.hovered').attr('t');
          console.log(t);
          if(ui.draggable.attr('type') == 'location'){
            var aid = ui.draggable.attr('id');
            locations.push({"time":t,"id":aid});
          }
          else if(ui.draggable.attr('type') == 'photo' || ui.draggable.attr('type') == 'video' ){
            var aid = ui.draggable.attr('id');
            images.push({"time":t,"id":aid});
          }
          else{console.log("unknown pin");}

          insertPins();
        }
      }
    });  //droppable
  }); //projects
}

function assetListeners(assets){
  assets.each(function(){
    $(this).draggable({
      appendTo:'body',
      revert: 'invalid', 
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
    });
  });
}

function findIndex(d,i,k){
  var j = parseInt((k-i)/2)+i;
  if(i==j){
    return j
  }
  if(d < themes[j]){
    if(d >= themes[j-1]){
      return j-1
    }
    else{
      return findIndex(d,i,j)
    }
  }
  else{
    if(j < k){
      if(d < themes[j+1]){
        return j
      }
      else{
        return findIndex(d,j,k)
      }
    }
    else{
      return j
    }
  }
}

function buildBookmarks(){
  var bMarkConvert = {};
  var bList = [],
      bCont = [];
  bookmarkListContent(bMarkConvert,bList,bCont);
  $('#bookmarkTabs').append(bList.join('')); //append each bookmark as a tab
  $('#bookmarkContent').append(bCont.join('')); //append the content for bookmark
  
  $('#bookmarkContent').on('click','.convert',function(){
    var type = $(this).attr('type');
    var par = $(this).parents('.tab-pane');
    var bid = par.attr('id');
    if(type != bMarkConvert[bid]){
      var classConverter = {
        'bookmark':'bookmarks',
        'photo':'media',
        'place':'location'
      }
      var oldType = bMarkConvert[bid];
      bMarkConvert[bid] = type;

      $(this).siblings('.active').removeClass('active');
      $(this).addClass('active');
      if(type == 'bookmark'){
        par.find('.tabContent').html('');
        $('.'+bid).children('a').html('<i class="icon-star icon-large"></i>');
      }
      else if(type == "photo"){
        $('.'+bid).children('a').html('<i class="icon-camera icon-large"></i>');
        par.find('.tabContent').html(buildPhotos());
        displayImage(par.find('.crop_image'));
        par.find('.thumbnail').imageZoom();
        par.find(".checkbox").prepend("<span class='icon'></span><span class='icon-to-fade'></span>");

        par.find(".checkbox").click(function(){
          setupLabel();
          var asset = $(this).parents('.asset');
          if($(this).hasClass("disabled")){
            $(this).removeClass('disabled');
            asset.removeClass('fadedImage');
          }
          if($(this).hasClass('checked')){
            asset.siblings().each(function(){
              $(this).addClass('fadedImage');
              $(this).find('.checkbox').addClass("disabled");
              $(this).find('.checkbox').removeClass("checked");
            });
          }
          else{
            asset.siblings().each(function(){
              $(this).removeClass('fadedImage');
              $(this).find('.checkbox').removeClass("disabled");
              $(this).find('.checkbox').removeClass("checked");
            });
          }
        });

        $('.'+oldType+'[t="'++'"]')
      } //type photo
      else if(type == "place"){
        $('.'+bid).children('a').html('<i class="icon-map-marker icon-large"></i>');
        console.log("load map into tabContent");
      }
      else{
        console.log("shrugges sholders");
      }
    }
  });
  $('#bookmarkTabs a:first').trigger('click');
}

function bookmarkListContent(bMarkConvert,bList,bCont){
  for(var i in bookmarks){
    var bs = '<li class="b_'+bookmarks[i]+'">'+
                '<a href="#b_'+bookmarks[i]+'" data-toggle="tab">'+
                  '<i class="icon-star icon-large"></i>'+
                '</a>'+
              '</li>';
    var bc = '<div class="tab-pane" id="b_'+bookmarks[i]+'">'+
                '<div class="row-fluid">'+
                  '<div class="span12">'+
                    '<div class="btn-toolbar">'+
                      '<div class="btn-group">'+
                        '<a class="btn btn-primary convert active" type="bookmark"><i class="icon-large icon-star"></i></a>'+
                        '<a class="btn btn-primary convert" type="photo"><i class="icon-large icon-camera"></i></a>'+
                        '<a class="btn btn-primary convert" type="place"><i class="icon-large icon-map-marker"></i></a>'+
                      '</div>'+
                    '</div>'+
                  '</div>'+
                '</div>'+
                '<div class="row-fluid tabContent">'+
                '</div>'+
              '</div>';
    bMarkConvert[bookmarks[i]] = "bookmark";
    bList.push(bs);
    bCont.push(bc);
  }
}

function _buildPhotoHTML(imageID){
  var pHTML = '<div class="asset span2 '+imageID+'" type="photo">'+
    '<div class="thumbnailImage">'+
      '<a class="thumbnail" href="images/story/'+photos[imageID]+'">'+
        '<div class="crop_image" image = "'+photos[imageID]+'">'+
        '</div>'+
      '</a>'+
      '<label class="checkbox" for="'+imageID+'_c">'+
        '<span class="icon"></span>'+
        '<span class="icon-to-fade"></span>'+
        '<input type="checkbox" value="" id="'+imageID+'_c">'+
      '</label>'+
    '</div>'+
  '</div>';
  return pHTML
}

function buildPhotos(){
  var photosHTML = [];
  photosHTML.push('<div class="row-fluid">');
  for(var img in photos){
    photosHTML.push(_buildPhotoHTML(img));
  }
  photosHTML.push('</div>');
  return photosHTML.join('');
}

//how to get start and end of ranges.
 // var start = $('.cell:not(.highlighted) + .cell.highlighted');
  // var end = $('.cell.highlighted + .cell:not(.highlighted)').prev();



