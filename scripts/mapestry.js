var jsonFile = "example.json";
//Cloudemade info for leaflet map
var CM_API_KEY = 'cc3cabfbed9842c29f808df2cc6c3f64';
var CM_STYLE = '44094';
//leaflet icons
var default_color = L.icon({
  iconUrl: 'images/leaflet/marker-icon_grey.png',
  shadowUrl:'images/leaflet/marker-shadow.png'
});
var playing_color = L.icon({
  iconUrl: 'images/leaflet/marker-icon_green.png',
  shadowUrl:'images/leaflet/marker-shadow.png'
});
var story_color = L.icon({
  iconUrl: 'images/leaflet/marker-icon_blue.png',
  shadowUrl:'images/leaflet/marker-shadow.png'
});
//global vars
var map;
var layerG = new L.layerGroup();
var markers = {};
var galleryOpen = false;
var mapHeight,smMapH;

$(document).ready(function(){
  $.when(loadData())
  .pipe(function(){
    mapHeight = (window.innerHeight - $('.navbar').outerHeight())*.97;

    $('#map').css('height',mapHeight);
    $('.sidebar-nav-fixed').css('height',mapHeight - 32);

    map = L.map('map',{
      center: new L.LatLng(34.0621, -118.1193),
      zoom: 15,
      layers: layerG
    });

    L.tileLayer('http://{s}.tile.cloudmade.com/'+CM_API_KEY+'/'+CM_STYLE+'/256/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; Imagery <a href="http://cloudmade.com">CloudMade</a>',
      maxZoom: 18
    }).addTo(map);
    galleryView();
    smMapH = mapHeight - $('.gallery_big').outerHeight() - 11;
  })
  .done(function(){
    $('#photo_button').on("click",function(){
      if(!galleryOpen){
        $('#map').animate({'height':''+smMapH+'px'},"slow");
        $('.gallery_big').slideDown("slow");
        map.panBy([0,(mapHeight-smMapH)/2],0.9);
        galleryOpen = true;
      }
    });

    $('#map_button').on("click",function(){
      if(galleryOpen){
        $('.gallery_big').slideUp("slow");
        $('#map').animate({'height':mapHeight},"slow");
        map.panBy([0,(-mapHeight+smMapH)/2],0.9);
        galleryOpen = false;
      }
    });
    
    //turn off the base flat-ui listener
    $(".todo li").off();

    smallGallery();
    for(var s in markers){
      var audioStory = new AudioStory(s,markers[s]);
      audioStory.getTimeStamps();
      audioStory.audioEvents();
    }

    //listener to expand story view
    $(".teaser").on("click",function(){
      $(this).children(".open-icon").addClass(function(index,currentClass){
        if(currentClass.indexOf("plus") != -1){
          $(this).removeClass("fui-plus-24");
          $(this).addClass("fui-cross-24");

          markers[$(this).parent().siblings("audio").attr('id')].expanded = true;
          addRemoveLayers(map,markers);
          // markers[$(this).parent().siblings("audio").attr('id')].opacity = 100;
          // changeOpacity(map,markers);
        }
        else{
          $(this).removeClass("fui-cross-24");
          $(this).addClass("fui-plus-24");

          //check to see if audio is playing. If it is, leave it be
          if($(this).parent().siblings("audio")[0].paused){
            markers[$(this).parent().siblings("audio").attr('id')].expanded = false;
            addRemoveLayers(map,markers);
          }
          // markers[$(this).parent().siblings("audio").attr('id')].opacity = 50;
          // changeOpacity(map,markers);
        }
      });
      $(this).parent(".story").children(".collapsable").addClass(function(index,currentClass){
        if(currentClass.indexOf("collapse") != -1){
          $(this).removeClass("collapse");
        }
        else{
          $(this).addClass("collapse");
        }
      });
    });

    $(".todo li").on({
      mouseenter:function(){
        if($(this).attr("class").indexOf("active") == -1){
          $(this).addClass("todo-hover");
          var story = $(this).parents('.collapsable').siblings("audio").attr('id');
          var re = new RegExp("("+story+"_\\d+)");
          var seg = $(this).attr("class").match(re);
          markers[story].markers[seg[1]].setIcon(playing_color);
        }
      },
      mouseleave:function(){
        if($(this).attr("class").indexOf("active") == -1){
          $(this).removeClass("todo-hover");
          var story = $(this).parents('.collapsable').siblings("audio").attr('id');
          var re = new RegExp("("+story+"_\\d+)");
          var seg = $(this).attr("class").match(re);
          if($(this).parents('.collapsable').siblings("audio")[0].paused){
            markers[story].markers[seg[1]].setIcon(default_color);        
          }
          else{
            markers[story].markers[seg[1]].setIcon(story_color);
          }
        }
      }
    });
    $(".teaser:first").trigger("click");
  });
});

function loadData(){
  var d = $.Deferred();
  $.getJSON(jsonFile,function(stories){
    insertStory(stories);
  }).done(function(p){
    d.resolve(p);
  }).fail(d.reject);
  return d.promise();
}

function AudioStory(tag,markers){
  this.tag = tag;
  this.elem = document.getElementById(tag);
  this.point = -1;
  this.timestamps = [];
  this.markers = markers;
}
AudioStory.prototype.getTimeStamps = function(){
  //set as as the object so we can access it later
  var as = this;

  $('.'+this.tag+'_part').each(function(){
    as.timestamps.push(parseInt($(this).attr("time")));
  });
}
//setting up listeners for the audio
AudioStory.prototype.audioEvents = function(){
  //set as as the object so we can access it later
  var as = this;
  
  //turn on a new listener for todo li elements
  $("."+as.tag+"_part").on("click",function(){
    pauseOther();
    as.elem.currentTime = parseInt($(this).attr('time')) + 0.001;
    as.elem.play();
    $("."+as.tag+"_part").removeClass('todo-hover');
  }); 
  
  //listener for when starts playing
  as.elem.addEventListener("play", function(e){
    //change set to story_color
    for(var i in as.markers.markers){
      as.markers.markers[i].setIcon(story_color);
    }
    //change active to playing_color
    $('.'+as.tag+'_part.todo-active').addClass(function(index,currentClass){
      var re = new RegExp("("+as.tag+"_\\d+)");
      var i = currentClass.match(re);
      as.markers.markers[i[1]].setIcon(playing_color);
    });

    //set up listeners to trigger only when it starts playing
    //when paused turn markesr to default_color
    as.elem.addEventListener("pause", function(e){
      for(var i in as.markers.markers){
        as.markers.markers[i].setIcon(default_color);
      }
    });

    //time listener which updates the todo based on time
    as.elem.addEventListener("timeupdate", function(e){
      var time = 0;
      for(var i in as.timestamps){
        if(e.target.currentTime > as.timestamps[i]){
          time = i;
        }
        if(e.target.currentTime < as.timestamps[i]){
          break;
        }
      }
      //if there has been a change in the story part
      if(time != as.point){
        //remove the active class
        $('.'+as.tag+'_' + as.point).removeClass('todo-active');
        try{as.markers.markers[as.tag+'_'+as.point].setIcon(story_color);}
        catch(err){}
        //did it go backwards or forwards?
        //if backwards...
        if(time < as.point){
          //remove the previously done bits
          for(var i = time; i < as.point; i++){
            $('.'+as.tag+'_' + i).removeClass('todo-done');
          }
        }
        //if moving forwards...
        else if(time > as.point){
          //add done class to each inbetween
          for(var i = as.point; i < time; i++){
            $('.'+as.tag+'_' + i).addClass('todo-done');
          }
        }
        //set the current as active
        $('.'+as.tag+'_' + time).addClass('todo-active');
        as.markers.markers[as.tag+'_' + time].setIcon(playing_color);
        if(galleryOpen){
          map.panTo(as.markers.markers[as.tag+'_' + time].getLatLng()).panBy([0,(mapHeight-smMapH)/2],0.9);
        }
        else{
          map.panTo(as.markers.markers[as.tag+'_' + time].getLatLng());
        }
        //update point in story
        as.point = time;
      }
    });
    
    //change the final todo when ends
    as.elem.addEventListener("ended", function(e){
      $('.'+as.tag+'_' + as.point).removeClass('todo-active');
      $('.'+as.tag+'_' + as.point).addClass('todo-done');
      as.point++;
    });
  });
}

function PhotoMarkers(){
  /*
    story = {
      storyName: new PhotoMarkers();

      {
        lg:L.layerGroup([markers]),
        markers:[markers]
        expanded: true/false of elem state
        opacity: int of marker opacity
      },
      ...
    }
  */
  this.lg;
  this.markers = {};
  // this.photos = [];
  this.expanded = false;
  this.opacity = 50;
}

function changeOpacity(map,markers){
  for(var story in markers){
    markers[story].lg.setOpacity(markers[story].opacity);
  }
}

function addRemoveLayers(map,markers){
  layerG.clearLayers();
  for(var story in markers){
    if(markers[story].expanded){
      layerG.addLayer(markers[story].lg);
    }
  }
}

function pauseOther(){
  $('audio').each(function(){
    this.pause();
  });
}

function insertStory(d){
  var markerIndex = {};
  var tagList = {};
  var photoList = {};

  function _buildPopUp(d){
    var popup = $('<div><hr></div>');
    for(var s in d){
      for(var i in d[s]){
        var link = $('<a class="btn btn-large btn-block btn-primary popup" id="'+s+'_'+d[s][i].c+'">Play</a>').on("click",function(){
          var audioTrack = $(this).attr('id');
          pauseOther();
          if($('#'+audioTrack.split('_')[0]).siblings(".collapsable").attr("class").indexOf('collapse') > -1){
            $('#'+audioTrack.split('_')[0]).siblings(".teaser").trigger('click');
          }
          $('.'+audioTrack).trigger('click');
        });

        popup.append('<div class = "popup_div">');
        popup.append(link);
        popup.append('<h5 class="popup">'+d[s][i].t+'</h5>');
        popup.append('</div><hr>')
      }
    }
    return popup;
  }
  function _buildMarker(){
    // markers['mom1'] = new PhotoMarkers();
    // markers['mom1'].markers.push(L.marker([34.06418,-118.1197],{icon: default_color}).bindPopup(test));
    // markers['mom1'].markers.push(L.marker([34.0621,-118.1156],{icon: default_color}).bindPopup("<b>Hello world!</b><br>I am a popup."));
    // markers['mom1'].markers.push(L.marker([34.0617,-118.1194],{icon: default_color}).bindPopup("<b>Hello world!</b><br>I am a popup."));
    // markers['mom1'].lg = L.layerGroup(markers['mom1'].markers);
    // markers['mom1'].photos = ['1.jpg','2.jpg','3.jpg'];
    for(var ll in markerIndex){
      var m = L.marker(markerIndex[ll]['latlong'],{icon: default_color})
        .bindPopup(_buildPopUp(markerIndex[ll]['popup'])[0]);
      console.log(markerIndex[ll]['popup']);
      for(var s in markerIndex[ll]['popup']){
        for(var i in markerIndex[ll]['popup'][s]){
          markers[s].markers[''+s+'_'+markerIndex[ll]['popup'][s][i].c] = m;
          markers[s].lg.addLayer(m);
        }
      }
    }
  }
  function _buildMarkerIndex(d,s,c){
    var index = d.latlong.join(' ');
    if(!markerIndex[index]){
      markerIndex[index] = {};
      markerIndex[index]["latlong"] = d.latlong;
      markerIndex[index]["popup"] = {};
    }
    if(!markerIndex[index]["popup"][s]){
      markerIndex[index]["popup"][s] = [];
    }
    
    markerIndex[index]["popup"][s].push({
      'c':c,
      't':d.segTitle
    });
  }
  function _getTags(d){
    for(var i in d){
      if(!tagList[d[i]]){
        tagList[d[i]] = true;
      }
    }
  }
  function _addTags(){
    var tags = [];
    for(var tag in tagList){
      tags.push(tag);
    }
    console.log(tags);
    $('#tags').attr('value',tags.join(','));
    $(".tagsinput").tagsInput({'interactive':false});
    $(".tag").on('click',function(){
      var clickedTag = $(this).children().text();
      $(".open-icon").each(function(){
        if($(this).attr('class').indexOf('cross') != -1){
          $(this).trigger("click");
        }
        if($(this).attr('tags').indexOf(clickedTag) != -1){
          $(this).trigger("click");
        }
      });
    });
  }
  function _addPhotos(d){
    if(!photoList[d.image]){
      photoList[d.image] = {'t':d.t,'d':d.d};
    }
  }
  function _buildSegment(d,s){
    var segment = [];
    for(var i in d){
      segment.push('<li class="'+s+'_part '+s+'_'+i+'" time="'+d[i].time+'" segment = "'+i+'">'+
        '<div class="todo-icon fui-location-24"></div>'+
        '<div class="todo-content">'+
          '<h4 class="todo-name">'+d[i].segTitle+'</h4>'+
          d[i].desc+
        '</div>'+
      '</li>'
      );
      _buildMarkerIndex(d[i],s,i);
    }
  return segment.join('');
  }
  function _buildGallery(d){
    var photo = [];
    for(var i in d){
      photo.push('<li><img data-frame="images/story/'+d[i].image+'" src="images/story/'+d[i].image+'" title="'+d[i].t+'" data-description="'+d[i].d+'" />'); 
      _addPhotos(d[i]);
    }
    return photo.join('');
  }
  function _buildStory(d){
    var story = [];
    for(var i in d){
      story.push('<div class = "story">'+
        '<hr>'+
        '<div class = "teaser">'+
          '<div class="open-icon fui-plus-24" tags="'+d[i].sTags.join(',')+'"></div>'+
          '<h2>'+d[i].storyTitle+'</h2>'+
        '</div>'+
        '<audio id = "'+d[i].story+'" controls preload="auto" type="audio/mp3">'+
          '<source src="audio/'+d[i].audio+'" type="audio/mpeg">'+
          'You are using an obsolete browser, idiot...'+
        '</audio>'+
        '<div class = "collapsable collapse"> <!-- collapse -->'+
          '<div class="todo mrm" id = "'+d[i].story+'_parts" story = "'+i+'">'+
            '<ul>'+
              _buildSegment(d[i].segment,d[i].story)+
            '</ul>'+
          '</div> <!--todo -->'+
          '<hr>'+
          '<h5 class="ilb">Record Date: </h5> <h6 class="ilb">'+d[i].rDate+'</h6>'+
          '<p>'+
            d[i].sText+
          '</p>'+
          '<hr>'+
          '<ul id="'+d[i].story+'_Gallery" class = "smallGallery">'+
            _buildGallery(d[i].photos)+
          '</ul>'+
        '</div> <!--collapse -->'+
      '</div>  <!--segment -->'
      );
      _getTags(d[i].sTags);
      markers[d[i].story] = new PhotoMarkers();
      // markers[d[i].story].photos = d[i].photos;
      markers[d[i].story].lg = L.layerGroup();
    }
    return story.join('');
  }
  function _buildMainGallery(){
    var photo = [];
    for(var i in photoList){
      photo.push('<li><img data-frame="images/story/'+i+'" src="images/story/'+i+'" title="'+photoList[i].t+'" data-description="'+photoList[i].d+'" />'); 
    }
    $('#myGallery').append(photo.join(''));
  }
  
  $('#storybar').append(_buildStory(d));
  _buildMarker();
  _addTags();
  _buildMainGallery();
}

function galleryView(){
  var w = $('.span9').width() - 59;
  $('#myGallery').galleryView({
    transition_speed: 500,       //INT - duration of panel/frame transition (in milliseconds)
    transition_interval: 4000,    //INT - delay between panel/frame transitions (in milliseconds)
    easing: 'swing',              //STRING - easing method to use for animations (jQuery provides 'swing' or 'linear', more available with jQuery UI or Easing plugin)
    show_panels: true,            //BOOLEAN - flag to show or hide panel portion of gallery
    show_panel_nav: false,        //BOOLEAN - flag to show or hide panel navigation buttons
    enable_overlays: true,        //BOOLEAN - flag to show or hide panel overlays
    panel_width: w,             //INT - width of gallery panel (in pixels)
    panel_height: 500,            //INT - height of gallery panel (in pixels)
    panel_animation: 'slide',     //STRING - animation method for panel transitions (crossfade,fade,slide,none)
    panel_scale: 'fit',          //STRING - cropping option for panel images (crop = scale image and fit to aspect ratio determined by panel_width and panel_height, fit = scale image and preserve original aspect ratio)
    overlay_position: 'bottom',   //STRING - position of panel overlay (bottom, top)
    pan_images: true,             //BOOLEAN - flag to allow user to grab/drag oversized images within gallery
    pan_style: 'drag',            //STRING - panning method (drag = user clicks and drags image to pan, track = image automatically pans based on mouse position
    pan_smoothness: 15,           //INT - determines smoothness of tracking pan animation (higher number = smoother)
    start_frame: 1,               //INT - index of panel/frame to show first when gallery loads
    show_filmstrip: true,         //BOOLEAN - flag to show or hide filmstrip portion of gallery
    show_filmstrip_nav: true,     //BOOLEAN - flag indicating whether to display navigation buttons
    enable_slideshow: false,      //BOOLEAN - flag indicating whether to display slideshow play/pause button
    autoplay: false,              //BOOLEAN - flag to start slideshow on gallery load
    show_captions: true,          //BOOLEAN - flag to show or hide frame captions 
    filmstrip_size: 3,            //INT - number of frames to show in filmstrip-only gallery
    filmstrip_style: 'scroll',    //STRING - type of filmstrip to use (scroll = display one line of frames, scroll filmstrip if necessary, showall = display multiple rows of frames if necessary)
    filmstrip_position: 'bottom', //STRING - position of filmstrip within gallery (bottom, top, left, right)
    frame_width: 164,             //INT - width of filmstrip frames (in pixels)
    frame_height: 80,             //INT - width of filmstrip frames (in pixels)
    frame_opacity: 0.5,           //FLOAT - transparency of non-active frames (1.0 = opaque, 0.0 = transparent)
    frame_scale: 'crop',          //STRING - cropping option for filmstrip images (same as above)
    frame_gap: 5,                 //INT - spacing between frames within filmstrip (in pixels)
    show_infobar: true,           //BOOLEAN - flag to show or hide infobar
    infobar_opacity: 1            //FLOAT - transparency for info bar
  });

  $('.gv_galleryWrap').addClass('gallery_big').addClass('hero-unit').hide();
}

function smallGallery(){
  var w = $('.sidebar-nav-fixed').width() - 10;
  $('.smallGallery').galleryView({
    transition_speed: 500,       //INT - duration of panel/frame transition (in milliseconds)
    transition_interval: 4000,    //INT - delay between panel/frame transitions (in milliseconds)
    easing: 'swing',              //STRING - easing method to use for animations (jQuery provides 'swing' or 'linear', more available with jQuery UI or Easing plugin)
    show_panels: false,            //BOOLEAN - flag to show or hide panel portion of gallery
    show_panel_nav: false,        //BOOLEAN - flag to show or hide panel navigation buttons
    enable_overlays: false,        //BOOLEAN - flag to show or hide panel overlays
    panel_width: w,             //INT - width of gallery panel (in pixels)
    panel_height: 1,            //INT - height of gallery panel (in pixels)
    panel_animation: 'slide',     //STRING - animation method for panel transitions (crossfade,fade,slide,none)
    panel_scale: 'crop',          //STRING - cropping option for panel images (crop = scale image and fit to aspect ratio determined by panel_width and panel_height, fit = scale image and preserve original aspect ratio)
    overlay_position: 'bottom',   //STRING - position of panel overlay (bottom, top)
    pan_images: false,             //BOOLEAN - flag to allow user to grab/drag oversized images within gallery
    pan_style: 'drag',            //STRING - panning method (drag = user clicks and drags image to pan, track = image automatically pans based on mouse position
    pan_smoothness: 15,           //INT - determines smoothness of tracking pan animation (higher number = smoother)
    start_frame: 1,               //INT - index of panel/frame to show first when gallery loads
    show_filmstrip: true,         //BOOLEAN - flag to show or hide filmstrip portion of gallery
    show_filmstrip_nav: true,     //BOOLEAN - flag indicating whether to display navigation buttons
    enable_slideshow: false,      //BOOLEAN - flag indicating whether to display slideshow play/pause button
    autoplay: false,              //BOOLEAN - flag to start slideshow on gallery load
    show_captions: false,          //BOOLEAN - flag to show or hide frame captions 
    filmstrip_size: 3,            //INT - number of frames to show in filmstrip-only gallery
    filmstrip_style: 'scroll',    //STRING - type of filmstrip to use (scroll = display one line of frames, scroll filmstrip if necessary, showall = display multiple rows of frames if necessary)
    filmstrip_position: 'bottom', //STRING - position of filmstrip within gallery (bottom, top, left, right)
    frame_width: 80,             //INT - width of filmstrip frames (in pixels)
    frame_height: 80,             //INT - width of filmstrip frames (in pixels)
    frame_opacity: 1,           //FLOAT - transparency of non-active frames (1.0 = opaque, 0.0 = transparent)
    frame_scale: 'fit',          //STRING - cropping option for filmstrip images (same as above)
    frame_gap: 3,                 //INT - spacing between frames within filmstrip (in pixels)
    show_infobar: false,           //BOOLEAN - flag to show or hide infobar
    infobar_opacity: 1            //FLOAT - transparency for info bar
  });
  
  $('.gv_galleryWrap:not(.gallery_big)').addClass("gallery_small");
}