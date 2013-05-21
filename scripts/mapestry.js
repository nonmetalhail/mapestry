var jsonFile = "example.json";
var jsonPhotoFile = "examplePhoto.json";
//Cloudemade info for leaflet map
var CM_API_KEY = 'cc3cabfbed9842c29f808df2cc6c3f64';
var CM_STYLE = '998'; //44094
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
var layerG = new L.featureGroup();
var markers = {};
var slider, scontrol;
var galleryOpen = false;
var mapHeight,galleryHeight,smMapH;
var photoList = {};
var playing = 'all';
var advPhoto = false;

$(document).ready(function(){
  createMainGallery();
  $.when(loadPhotos(),loadAudio())
  .pipe(function(){
    // console.log(window.innerHeight);
    mapHeight = (window.innerHeight - $('.navbar').outerHeight())*.96;
    galleryHeight = mapHeight * 0.6666;
    $('#gallery').outerHeight(galleryHeight);

    $('#map').css('height',mapHeight);
    $('.sidebar-nav-fixed').css('height',mapHeight - 20);
    // var stamenAtr = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>';
    // var stamen = new L.StamenTileLayer("terrain",{  //toner
    //   maxZoom: 16, 
    //   attribution: stamenAtr
    // });
    map = L.map('map',{
      center: new L.LatLng(42.50056, -92.33387),
      zoom: 15,
      maxZoom:16,
      layers: layerG
    });
    // map.addLayer(stamen);
    // map.attributionControl.addAttribution(stamenAtr);
    L.tileLayer('http://{s}.tile.cloudmade.com/'+CM_API_KEY+'/'+CM_STYLE+'/256/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; Imagery <a href="http://cloudmade.com">CloudMade</a>',
      maxZoom: 18
    }).addTo(map);
    smMapH = mapHeight - galleryHeight - 11;
  })
  .done(function(){
    $('#photo_button').on("click",function(){
      if(!galleryOpen){
        $('#map').animate({'height':''+smMapH+'px'},"slow");
        $('#gallery').slideDown("slow");
        filterGallery(playing);
        map.panBy([0,(mapHeight-smMapH)/2],0.9);
        $('#photoControls').slideDown("slow");
        galleryOpen = true;
      }
    });

    $('#map_button').on("click",function(){
      if(galleryOpen){
        $('#gallery').slideUp("slow");
        $('#map').animate({'height':mapHeight},"slow");
        map.panBy([0,(-mapHeight+smMapH)/2],0.9);
        $('#photoControls').slideUp("slow");
        galleryOpen = false;
      }
    });

    //listeners for photo switches
    $('#radioONS').parent('.radio').addClass('disabled');
    $('#radioOFFS').parent('.radio').addClass('disabled');
    $('#radioAll').on('change', function(){
      filterGallery('all');
      $('#radioOFFS').trigger('click');
      $('#radioONS').parent('.radio').addClass('disabled');
      $('#radioOFFS').parent('.radio').addClass('disabled');
    });
    $('#radioStory').on('change',function(){
      filterGallery(playing);
      $('#radioONS').parent('.radio').removeClass('disabled');
      $('#radioOFFS').parent('.radio').removeClass('disabled');
    });
    $('#radioONS').on('change', function(){
      advPhoto = true;
    });
    $('#radioOFFS').on('change', function(){
      advPhoto = false;
    });
    
    //pause other audio when one is clicked
    // $('audio').on("click",function(){
    //   pauseOther();
    // });

    //turn off the base flat-ui listener
    $(".todo li").off();

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
    createSmallGalleries();
    $(".teaser:first").trigger("click");
  });
});

function loadAudio(){
  var d = $.Deferred();
  $.getJSON(jsonFile,function(stories){
    insertStory(stories);
  }).done(function(p){
    d.resolve(p);
  }).fail(d.reject);
  return d.promise();
}
function loadPhotos(){
  var d = $.Deferred();
  $.getJSON(jsonPhotoFile,function(photos){
    processPhotos(photos);
  }).done(function(p){
    d.resolve(p);
  }).fail(d.reject);
  return d.promise();
 }

function AudioStory(tag,markers){
  this.tag = tag;
  this.elem = document.getElementById(tag);
  this.point = -1;
  this.photoPoint = -1;
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
    //update gallery if open
    if(playing != as.tag){
      playing = as.tag;
      //no fucking clue...
      $('#radioStory').trigger('click');
      $('#radioStory').trigger('click');
      $('#radioONS').trigger('click');
      $('#radioONS').trigger('click');
    }

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
          if(map.getZoom() < 13){
            map.setView(as.markers.markers[as.tag+'_' + time].getLatLng(),14).panBy([0,(mapHeight-smMapH)/2],0.9);
          }
          else{
            map.panTo(as.markers.markers[as.tag+'_' + time].getLatLng()).panBy([0,(mapHeight-smMapH)/2],0.9);
          }
        }
        else{
          if(map.getZoom() < 14){
            map.setView(as.markers.markers[as.tag+'_' + time].getLatLng(),15);
          }
          else{
            map.panTo(as.markers.markers[as.tag+'_' + time].getLatLng());
          }
        }
        //update point in story
        as.point = time;
      }
      if(galleryOpen){
        if(advPhoto){
          var pTime = 0;
          for(var i in photoList[as.tag].times){
            if(e.target.currentTime > photoList[as.tag].times[i]){
              pTime = i;
            }
            if(e.target.currentTime < photoList[as.tag].times[i]){
              break;
            }
          }
          if(pTime != as.photoPoint){
            $('.p_'+as.tag+'_'+photoList[as.tag].times[pTime]).trigger('click');
            as.photoPoint = pTime;
          }
        }
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

function MapMarkers(){
  /*
    story = {
      storyName: new MapMarkers();

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
  if(layerG.getBounds()._northEast){
    map.fitBounds(layerG.getBounds());
    if(galleryOpen){
      map.panBy([0,(mapHeight-smMapH)/2],0.9);
    }
  }
}

function pauseOther(){
  $('audio').each(function(){
    this.pause();
  });
}

function processPhotos(p){
  var times = {};
  function _createStoryTimes(d){
    var storyTimes = [];
    for(var story in d){
      if(!times[story]){
        times[story] = [];
      }
      for(var i in d[story]){
        storyTimes.push('p_'+story+'_'+d[story][i])
        times[story].push(d[story][i]);
      }
    }
    return storyTimes.join(' ');
  }
  //populate all photots obj
  photoList['all'] = new PhotoObj();
  for(var photo in p){
    var st = _createStoryTimes(p[photo].s);
    var main = '<li class = "'+st+'">'+
      '<img title = "'+p[photo].t+'" src="images/story/'+photo+'" />'+
      '</li>';
    var control = '<li class = "control_li '+st+'">'+
      '<div class = "thumb">'+
        '<img class = "thumbs" title = "'+p[photo].t+'" src="images/story/'+photo+'" />'+
      '</div></li>';
    for(var story in p[photo].s){
      if(!photoList[story]){
        photoList[story] = new PhotoObj();
      }
      photoList[story].photos.push({
        'p':main,
        'c':control
      });
      photoList[story].times = times[story].sort(function(a,b){return a-b});
    }
    photoList['all'].photos.push({
        'p':main,
        'c':control
      });
      photoList['all'].times = [];
  }
}

function PhotoObj(){
  // {
  //   "mom1":{
  //     "times":[0,1,2,5,7,9],
  //     "photos":[
  //       {
  //         "p":"li",
  //         "c":"li"
  //       },
  //       {
  //         "p":"li",
  //         "c":"li"
  //       },
  //     ]
  //   }
  // }
  this.times = [];
  this.photos = [];
}

function insertStory(d){
  var markerIndex = {};
  var tagList = {};

  function _buildPopUp(d){
    var popup = $('<div><hr></div>');
    for(var s in d){
      for(var i in d[s]){
        var link = $('<a class="btn btn-large btn-block btn-primary popup" id="'+s+'_'+d[s][i].c+'"><i class="icon-play-circle icon-large"></i></a>').on("click",function(){
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
    // markers['mom1'] = new MapMarkers();
    // markers['mom1'].markers.push(L.marker([34.06418,-118.1197],{icon: default_color}).bindPopup(test));
    // markers['mom1'].markers.push(L.marker([34.0621,-118.1156],{icon: default_color}).bindPopup("<b>Hello world!</b><br>I am a popup."));
    // markers['mom1'].markers.push(L.marker([34.0617,-118.1194],{icon: default_color}).bindPopup("<b>Hello world!</b><br>I am a popup."));
    // markers['mom1'].lg = L.layerGroup(markers['mom1'].markers);
    // markers['mom1'].photos = ['1.jpg','2.jpg','3.jpg'];
    for(var ll in markerIndex){
      var m = L.marker(markerIndex[ll]['latlong'],{icon: default_color})
        .bindPopup(_buildPopUp(markerIndex[ll]['popup'])[0]);
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
  function _buildStory(d){
    var story = [];
    for(var i in d){
      story.push('<div class = "story">'+
        '<hr>'+
        '<div class = "teaser">'+
          '<div class="open-icon fui-plus-24" tags="'+d[i].sTags.join(',')+'"></div>'+
          '<h3>'+d[i].storyTitle+'</h3>'+
        '</div>'+
        '<audio id = "'+d[i].story+'" controls preload="auto" type="audio/mp3">'+
          '<source src="audio/'+d[i].audio+'.m4a" type="audio/mpeg">'+
          '<source src="audio/'+d[i].audio+'.ogg" type="audio/ogg">'+
          'You are using an obsolete browser which does not support audio'+
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
          '</ul>'+
        '</div> <!--collapse -->'+
      '</div>  <!--segment -->'
      );
      _getTags(d[i].sTags);
      markers[d[i].story] = new MapMarkers();
      // markers[d[i].story].photos = d[i].photos;
      markers[d[i].story].lg = L.featureGroup();
    }
    return story.join('');
  }
  
  $('#storybar').append(_buildStory(d));
  _buildMarker();
  _addTags();
}

function buildGalleryList(s,type){
  var photo = [];
  for(var i in photoList[s].photos){
    photo.push(photoList[s].photos[i][type]);
  }
  return photo.join('');
}

function createSmallGalleries(){
  var w = $('.sidebar-nav-fixed').width();
  $('.smallGallery').each(function(){
    var story = $(this).attr('id').split('_')[0];
    $(this).append(buildGalleryList(story,'p'));

    var g = $(this).bxSlider({
      slideWidth: w,
       video: true
    });  
    $(this).parents('.bx-wrapper').addClass('gallery_small');
  })
}

function createMainGallery(){
  var w = $('.span9').width() - 51;

  $('#control_window').css('width',w);
  slider = $('#mainGallery').bxSlider({
    slideWidth: w,
    infiniteLoop: false,
    hideControlOnEnd:true,
    pager:false,
    video: true,
    onSlideNext:function(slideElement, oldIndex, newIndex){
      var ca = $('.control_li.active');
      ca.removeClass('active');
      scontrol.goToSlide(newIndex);
      ca.next().addClass('active');
    },
    onSlidePrev:function(slideElement, oldIndex, newIndex){
      var ca = $('.control_li.active');
      ca.removeClass('active');
      scontrol.goToSlide(newIndex);
      ca.prev().addClass('active');
    }
  });
  $('#mainGallery').parents('.bx-wrapper').addClass('gallery_big');

  scontrol = $('#sliderGallery').bxSlider({
    slideWidth: 150,
    infiniteLoop: false,
    hideControlOnEnd:true,
    controls:false,
    video: true,
    // captions:true,
    pager:false,
    moveSlides: 1,
    slideMargin: 1
  });  
  $('#sliderGallery').parents('.bx-wrapper').addClass('gallery_control');
  $('.control_li:first').addClass('active');

  $('#sliderGallery').on('click','.control_li',function(){
    var self = this;
    $('.control_li.active').removeClass('active');
    $('.control_li').each(function(i){
      if(this == self){
        scontrol.goToSlide(i);
        slider.goToSlide(i);
        $(self).addClass('active');
        return;
      }
    });
  });
  $('#gallery').hide();
  $('#photoControls').hide();
}

function filterGallery(story){
  slider.fadeOut("slow",function(){
    $('#mainGallery').html(buildGalleryList(story,'p'));
    slider.reloadSlider();
    slider.hide();
    $('#mainGallery').parents('.bx-wrapper').addClass('gallery_big');
    $('#mainGallery').css('height',''+galleryHeight-120+'px');
    slider.fadeIn("slow");            
  });
  scontrol.fadeOut("slow",function(){
    $('#sliderGallery').html(buildGalleryList(story,'c'));
    scontrol.reloadSlider();
    scontrol.hide();
    $('#sliderGallery').parents('.bx-wrapper').addClass('gallery_control');
    $('.control_li:first').addClass('active');
    scontrol.fadeIn("slow");
  });
}