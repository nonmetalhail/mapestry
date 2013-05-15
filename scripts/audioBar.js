var audio_length = 1860; //audio length in sec
var jsonPhotoFile = "photos.json";
var jsonLocationFile = "locations.json";
var CM_API_KEY = 'cc3cabfbed9842c29f808df2cc6c3f64';
var CM_STYLE = '998'; //44094

// mockup of photo and locations for future dynamic input
var photos,loc;

//metadata brought in from recorder
var themes = [0,150,560,954,1463,1720];
var bookmarks = [100,433,690,874,1274,1340,1800]
var images = [
  {
    "time":350,
    "id":"p1"
  },
  {
    "time":1032,
    "id":"p4"
  }
];

var locations = [
  {
    "time":232,
    "id":'l1'
  },
  {
    "time":989,
    "id":'l3'
  },
  {
    "time":1487,
    "id":'l3'
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
  return index * cw + ch + cw - 2//+ timeInterval
}

$(document).ready(function(){
  $.when(loadPhotos(),loadLocations())
  .done(function(){
    buildBookmarks();
    $('.thumbnail').imageZoom();

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
        var n = findIndex(d.t,themes,0,themes.length);
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

    var tabHeight = (window.innerHeight - $('.navbar').outerHeight() 
      - $('.nav-tabs').outerHeight() - $('#audioBottom').outerHeight() 
      - $('#saveStory').outerHeight() - $('.addFile').outerHeight() - 150);
    $('.tabScroll').css('height',tabHeight);

    var locResults;
    var options = {
      collapsed: false, /* Whether its collapsed or not */
      position: 'bottomright', /* The position of the control */
      text: 'Locate', /* The text of the submit button */
      callback: function (results) {
        var bbox = results[0].boundingbox,
          first = new L.LatLng(bbox[0], bbox[2]),
          second = new L.LatLng(bbox[1], bbox[3]),
          bounds = new L.LatLngBounds([first, second]);
        console.log(results);
        this._map.fitBounds(bounds);
        var latlong = '' + results[0].lat + ','+results[0].lon;
        locResults = results[0];
        $('#latlng').val(latlong);
      }
    };
    var cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
    cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/'+CM_API_KEY+'/'+CM_STYLE+'/256/{z}/{x}/{y}.png', {attribution: cloudmadeAttribution});
    var map = new L.Map('admin_map').addLayer(cloudmade).setView(new L.LatLng(40,-101), 3);
    var osmGeocoder = new L.Control.OSMGeocoder(options);

    map.addControl(osmGeocoder);

    $("body").on('shown','#newLoc', function() { 
      L.Util.requestAnimFrame(map.invalidateSize,map,!1,map._container);
    });
    $('#saveLocation').on("click",function(){
      var address = locResults.display_name.split(",");
      var lid = 'l'+($('.asset[type="location"]').length+2);
      console.log(lid);
      var tempData = {
        "lat":locResults.lat,
        "lng":locResults.lon,
        "t":address[0]+address[1],
        "ad":address[0]+address[1],
        "ci":address[2],
        "st":address[4],
        "zip":address[5],
        "co":address[6],
        "share":"Private",
        "s":["None"]
      }
      var temp = {
        lid:tempData
      };
      processLocations(temp);
      assetListeners($('.asset'));
      loc[lid] = tempData
      $('#newLoc').modal('hide');
    });
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

function findIndex(d,arr,i,k){
  var j = parseInt((k-i)/2)+i;
  if(i==j){
    return j
  }
  if(d < arr[j]){
    if(d >= arr[j-1]){
      return j-1
    }
    else{
      return findIndex(d,arr,i,j)
    }
  }
  else{
    if(j < k){
      if(d < arr[j+1]){
        return j
      }
      else{
        return findIndex(d,arr,j,k)
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
    var par = $(this).parents('.sideTab');
    console.log(par);
    var bid = par.attr('id');
    var timeID = bid.split('_')[1];
    if(type != bMarkConvert[timeID]){
      var symbolConverter = {
        'bookmark':'',
        'photo':'',
        'place':''
      };
      var classConverter = {
        'bookmark':'bookmarks',
        'photo':'media',
        'place':'location'
      }
      
      var oldType = bMarkConvert[timeID];
      bMarkConvert[timeID] = type;

      $(this).siblings('.active').removeClass('active');
      $(this).addClass('active');

      var svgElm = d3.select('.'+classConverter[oldType]+'[t="'+timeID+'"]');
      svgElm.classed(classConverter[type],true);
      svgElm.select('text').text(symbolConverter[type]);
      svgElm.classed(classConverter[oldType],false);
      svgElm.attr("aid","");

      if(type == 'bookmark'){
        par.find('.tabContent').html('');
        $('.'+bid).children('a').html('<i class="icon-star icon-large"></i>');
        svgElm.select('text').classed('pins',false);
        svgElm.select('text').classed('bookmarkIcon',true);

      }
      else if(type == "photo"){
        $('.'+bid).children('a').html('<i class="icon-camera icon-large"></i>');
        par.find('.tabContent').html(buildPhotos());
        displayImage(par.find('.crop_image'));
        par.find('.imgZoom').imageZoom();
        var index = findIndex(timeID,bookmarks,0,bookmarks.length);
        bookmarks.splice(index,1);
        var iIndex = images.length;
        images.push({"time":timeID,"id":""})

        par.find(".crop_image").on('click',function(){
          var asset = $(this).parents('.asset');
          asset.toggleClass("selected");
          if(asset.hasClass("fadedImage")){
            asset.removeClass('fadedImage');
          }
          if(asset.hasClass('selected')){
            asset.siblings().each(function(){
              $(this).addClass('fadedImage');
              $(this).removeClass("selected");
            });
            svgElm.select('text').classed('pins',true);
            svgElm.select('text').classed('bookmarkIcon',false);
            svgElm.attr("aid",asset.attr("iid"));
            
            images[iIndex].id = asset.attr("iid");
          }
          else{
            asset.siblings().each(function(){
              $(this).removeClass('fadedImage');
            });
            svgElm.select('text').classed('pins',false);
            svgElm.select('text').classed('bookmarkIcon',true);
            images[iIndex].id = "";
          }
        });
      } //type photo
      else if(type == "place"){
        var nX = parseInt(svgElm.select('text').attr('x'))+5;
        svgElm.select('text').attr('x',nX);
        $('.'+bid).children('a').html('<i class="icon-map-marker icon-large"></i>');
        par.find('.tabContent').html(buildLocs());
        var index = findIndex(timeID,bookmarks,0,bookmarks.length);
        bookmarks.splice(index,1);
        var iIndex = locations.length;
        locations.push({"time":timeID,"id":""})

        par.find(".loc_helper").on('click',function(){
          var asset = $(this).parents('.asset');
          asset.toggleClass("selected");
          if(asset.hasClass("fadedImage")){
            asset.removeClass('fadedImage');
          }
          if(asset.hasClass('selected')){
            asset.siblings().each(function(){
              $(this).addClass('fadedImage');
              $(this).removeClass("selected");
            });
            svgElm.select('text').classed('pins',true);
            svgElm.select('text').classed('bookmarkIcon',false);
            svgElm.attr("aid",asset.attr("lid"));
            
            locations[iIndex].id = asset.attr("lid");
          }
          else{
            asset.siblings().each(function(){
              $(this).removeClass('fadedImage');
            });
            svgElm.select('text').classed('pins',false);
            svgElm.select('text').classed('bookmarkIcon',true);
            locations[iIndex].id = "";
          }
        });
        
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
    var bc = '<div class="tab-pane sideTab" id="b_'+bookmarks[i]+'">'+
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
  var pHTML ='<div class="asset span2" iid="'+imageID+'" type="photo">'+
    '<div class="thumbnailImage thumbnail">'+
      '<div class="crop_image" image = "'+photos[imageID].i+'">'+
      '</div>'+
      '<a class="imgZoom" href="images/story/'+photos[imageID].i+'">'+
        ''+
      '</a>'+
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

function _buildLocHTML(locID){
  var pHTML ='<div class="asset span2" lid="'+locID+'" type="place">'+
    '<div class="loc_helper thumbnailImage">'+
      '<i class="icon-map-marker icon-large"></i>'+
      '<h5>'+
        loc[locID].t+
      '</h5>'+
    '</div>'+
  '</div>';
  return pHTML
}

function buildLocs(){
  var photosHTML = [];
  photosHTML.push('<div class="row-fluid">');
  for(var lo in loc){
    photosHTML.push(_buildLocHTML(lo));
  }
  photosHTML.push('</div>');
  return photosHTML.join('');
}


// initial json call
function loadPhotos(){
  var d = $.Deferred();
  $.getJSON(jsonPhotoFile,function(ph){
    photos = ph;
    processPhotos(ph);
  }).done(function(p){
    d.resolve(p);
  }).fail(d.reject);
  return d.promise();
}

function loadLocations(){
  var d = $.Deferred();
  $.getJSON(jsonLocationFile,function(lo){
    loc = lo;
    processLocations(lo);
  }).done(function(p){
    d.resolve(p);
  }).fail(d.reject);
  return d.promise();
}

function _buildStoryList(l){
  var sList = [];
  for(var i in l){
    sList.push('<li class="placeholder">'+l[i]+'</li>');
  }
  return sList.join('')
}

function processPhotos(ph){
  var shareConvert={
    "Private":'private',
    "Shared":'sharedAsset'
  }
  var pHTML = [];
  for(var img in ph){
    var p = '<div class="asset" type="photo" id = "'+img+'">'+
      '<div class="row-fluid">'+
        '<div class="span1">'+
          '</div>'+
        '<div class="span2">'+
          '<div class="row-fluid">'+
            '<div class="span12 thumbnailImage">'+
              '<a class="thumbnail" href="images/story/'+ph[img].i+'">'+
                '<div class="crop_image" image = "'+ph[img].i+'"></div>'+
              '</a>'+
            '</div>'+
          '</div>'+
        '</div>'+
        '<div class="span5 asset_data">'+
          '<div class="row-fluid">'+
            '<div class="span7 display_text">'+
              '<h3 class="asset_name editable">'+ph[img].n+'</h3>'+
            '</div>'+
            '<div class="span5">'+
              '<h3 class="asset_date editable">'+ph[img].date+'</h3>'+
            '</div>'+
            '<div class="span12 asset_desc editable">'+ph[img].d+'</div>'+
          '</div>'+
        '</div>'+
        '<div class="span2">'+
          '<div class="row-fluid">'+
            'Used in stories:'+
            '<ul class="asset_stories">'+
              _buildStoryList(ph[img].s)+
            '</ul>'+
          '</div>'+
        '</div>'+
        '<div class="span2">'+
        '</div>'+
      '</div>'+
      '<hr>'+
    '</div>';
    pHTML.push(p);
  }
  $('#tab2 .tabScroll').append(pHTML.join(''));
}

function processLocations(lo){
  var shareConvert={
    "Private":'private',
    "Shared":'sharedAsset'
  }
  var lHTML = [];
  for(var l in lo){
    var ls = '<div class="asset" type="location" id = "'+l+'">'+
      '<div class="row-fluid">'+
        '<div class="span1">'+
        '</div>'+
        '<div class="span2">'+
          '<div class="row-fluid">'+
            '<div class="span12">'+
              '<div class="audio_icon">'+
                '<i class="fui-location-16"></i>'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>'+
        '<div class="span5 asset_data">'+
          '<div class="row-fluid">'+
            '<div class="span7 display_text">'+
              '<div class="row-fluid">'+
                '<h3 class="asset_location editable">'+lo[l].t+'</h3>'+
              '</div>'+
              '<div class="row-fluid">'+
                '<span class="asset_address editable">'+lo[l].ad+'</span>'+
              '</div>'+
              '<div class="row-fluid">'+
                '<span class="asset_city editable">'+lo[l].ci+'</span>'+
                '<span class="asset_state editable">'+lo[l].st+'</span>,'+
                '<span class="asset_zip editable">'+lo[l].zip+'</span>'+
              '</div>'+
              '<div class="row-fluid">'+
                '<div class="asset_country editable">'+lo[l].co+'</div>'+
              '</div>'+
              '<div class="row-fluid">'+
                '<div class="asset_latlng editable">'+lo[l].lat+','+lo[l].lng+'</div>'+
              '</div>'+
            '</div>'+
            '<div class="span5">'+
              '<h3>Places:</h3>'+
              '<ul>'+
                '<li><h4 class="place_tag editable">'+lo[l].ci+'</h4></li>'+
                '<li><h4 class="place_tag editable">'+lo[l].st+'</h4></li>'+
                '<li><h4 class="place_tag editable">'+lo[l].co+'</h4></li>'+
              '</ul>'+
            '</div>'+
          '</div>'+
        '</div>'+
        '<div class="span2">'+
          '<div class="row-fluid">'+
            'Used in stories:'+
            '<ul class="asset_stories">'+
              _buildStoryList(lo[l].s)+
            '</ul>'+
          '</div>'+
        '</div>'+
        '<div class="span2">'+
        '</div>'+
      '</div>'+
      '<hr>'+
    '</div>';

    lHTML.push(ls);
  }

  $('#tab3 .tabScroll').append(lHTML.join(''));
}

//how to get start and end of ranges.
 // var start = $('.cell:not(.highlighted) + .cell.highlighted');
  // var end = $('.cell.highlighted + .cell:not(.highlighted)').prev();



