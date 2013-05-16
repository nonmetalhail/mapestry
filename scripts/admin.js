var jsonPhotoFile = "photos.json";
var jsonLocationFile = "locations.json";
var CM_API_KEY = 'cc3cabfbed9842c29f808df2cc6c3f64';
var CM_STYLE = '998'; //44094

$(document).ready(function(){
  $.when(loadPhotos(),loadLocations())
  .done(function(){
    var tabHeight = (window.innerHeight - $('.navbar').outerHeight())*.7;
    $('.tabScroll').css('height',tabHeight);

    $.inlineEdit.prototype.controls.date = function( value ) {
      return '<input type="date" value="'+ convertDateToForm(value.replace(/(\u0022)+/g, '')) +'">' + this.buttonHtml();
    }
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

    $('.crop_image').each(function(){
      var f = $(this).attr('image');
      $(this).css('background-image','url(images/story/'+f+')');
    });

    $('.thumbnailImage').imageZoom();

    $('.asset_name').inlineEdit(); 
    $('.asset_date').inlineEdit(); 
    $('.asset_desc').inlineEdit({
      control:'textarea'
    }); 
    $('.asset_location').inlineEdit(); 
    $('.asset_address').inlineEdit(); 
    $('.asset_city').inlineEdit(); 
    $('.asset_state').inlineEdit(); 
    $('.asset_zip').inlineEdit(); 
    $('.asset_country').inlineEdit();
    $('.asset_latlng').inlineEdit(); 
    // $('.asset_date').inlineEdit({
    //   control:'date'}); 

    $('#allMedia').on('change',function(){
      $('.asset').show();
    });
    $('#photosOnly').on('click',function(){
      $('.asset[type="photo"]').show();
      $('.asset[type="video"]').hide();
    });
    $('#videosOnly').on('change',function(){
      $('.asset[type="video"]').show();
      $('.asset[type="photo"]').hide();
    });

    $('.deletePhoto').on('click',function(){
      var tab = $(this).parents('.tab-pane').attr('id');
      $('#'+tab).find('.checkbox.checked').each(function(){
        var cid = $(this).attr('for').split('_')[0];
        var type = $('#'+cid).attr('type');

        if(type == 'audio'){
          var a = confirm("Are you sure?\n\nDeleting an audio interview will delete stories created from it.");          
        }
        else{
          var a = confirm("Are you sure?\n\nYour projects will miss this "+type+"...");        
        }
        if(a==true){
          $('#'+cid).fadeOut(750,function(){
            $(this).remove();
          });
        }
      });
    });

    $('.syncRecorder').on('click',function(){
      var tab = $(this).parents('.tab-pane').attr('id');
      if(tab!="tab1"){
        $('#'+tab).find('.checkbox.checked').each(function(){
          console.log(this)
          var cid = $(this).attr('for').split('_')[0];
          $('#'+cid).find(".recorderNotification").fadeIn(750);
          $(this).removeClass("checked");
        });
      }
    });

    $('.shareAsset').on("click",function(){
      var tab = $(this).parents('.tab-pane').attr('id');
      var shared = '<li class="row-fluid tempShare"><div class="span2"></div><div class="span6">No One</div></li>';
      $('#'+tab).find('.checkbox.checked').each(function(){
        if($(this).parent().parent().find('.shareNotification').hasClass('sharedAsset')){
          shared = '<li class="row-fluid">'+
            '<div class="span2">'+
              '<i class="share_del fui-cross-16"></i>'+
            '</div>'+
            '<div class="span6">Erin McAdams</div>'+
            '<div class="span2 colab">'+
              '<label class="checkbox" for="colab1">'+
                '<span class="icon"></span>'+
                '<span class="icon-to-fade"></span>'+
                '<input type="checkbox" value="" id="colab1">'+
              '</label>'+
            '</div>'+
            '</li>';
        }
      });
      $('#shareList').html(shared);

      $(".colab .checkbox").on("click",function(){
        setupLabel();
      });
      
      $('#shareAsset').on("click",function(){
        $('#shareFile').modal('hide');
        $('#'+tab).find('.checkbox.checked').each(function(){
          $(this).parent().parent().find('.shareNotification').removeClass('private');
          $(this).parent().parent().find('.shareNotification').addClass('sharedAsset');
          $(this).parent().parent().find('.shareNotification').text(" Shared");
        $(this).removeClass("checked");
        });
      });
      
      $('#shareList').on("click",".share_del",function(){
        $(this).parents('li').remove();
      });

      $('.addShare').on("click",function(){
        var shared = '<li class="row-fluid">'+
            '<div class="span2">'+
              '<i class="share_del fui-cross-16"></i>'+
            '</div>'+
            '<div class="span6">'+$(this).text()+'</div>'+
            '<div class="span2 colab">'+
              '<label class="checkbox" for="colab2">'+
                '<span class="icon"></span>'+
                '<span class="icon-to-fade"></span>'+
                '<input type="checkbox" value="" id="colab2">'+
              '</label>'+
            '</div>'+
            '</li>';
        $('.tempShare').remove();
        $('#shareList').append(shared);
        $(".colab .checkbox").on("click",function(){
          setupLabel();
        });
      })
    });

    $("body").on('shown','#newLoc', function() { 
      L.Util.requestAnimFrame(map.invalidateSize,map,!1,map._container);
    });
    $('#saveLocation').on("click",function(){
      var address = locResults.display_name.split(",");
      var lid = 'l'+($('.asset[type="location"]').length+2);
      var temp = {
        lid:{
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
      };
      processLocations(temp);

      $('#newLoc').modal('hide');
      $(".cb .checkbox").on("click",function(){
        setupLabel();
      });
    });
    
    $('#saveQuestion').on("click",function(){
      if($('#questionIn').val()){
        var p = $(this).parents(".tabScroll");
        var c = p.find('.asset').length + 1;
        var newQ = '<div class="asset" type="topic" id = "q'+c+'">'+
          '<div class="row-fluid">'+
            '<div class="span1 cb">'+
                '<label class="checkbox" for="q'+c+'_c">'+
                  '<span class="icon"></span>'+
                  '<span class="icon-to-fade"></span>'+
                  '<input type="checkbox" value="" id="q'+c+'_c">'+
                '</label>'+
              '</div>'+
            '<div class="span2">'+
              '<div class="row-fluid">'+
                '<div class="span12">'+
                  '<div class="audio_icon">'+
                    '<i class="fui-bubble-16"></i>'+
                  '</div>'+
                '</div>'+
              '</div>'+
              '<div class="row-fluid">'+
                '<div class="span12">'+
                  '<div class="row-fluid">'+
                    '<div class="span3">'+
                    '</div>'+
                    '<div class="span6">'+
                      '<div class="btn btn-block btn-small shareNotification private"> Private</div>'+
                    '</div>'+
                    '<div class="span3">'+
                    '</div>'+
                  '</div>'+
                '</div>'+
              '</div>'+
            '</div>'+
            '<div class="span5 asset_data">'+
              '<div class="row-fluid">'+
                '<div class="span10 display_text">'+
                  '<div class="row-fluid">'+
                    '<h3 class="asset_question editable">'+$('#questionIn').val()+'</h3>'+
                  '</div>'+
                '</div>'+
              '</div>'+
            '</div>'+
            '<div class="span2">'+
              '<div class="row-fluid">'+
                'Used in interviews:'+
                '<ul class="asset_stories">'+
                  '<li class="placeholder">None</li>'+
                '</ul>'+
              '</div>'+
            '</div>'+
            '<div class="span2">'+
              '<div class="row-fluid">'+
                '<div class="span12">'+
                  '<h3 class="recorderNotification placeholder">Sent to recorder</h3>'+
                '</div>'+
              '</div>'+
            '</div>'+
          '</div>'+
          '<hr>'+
        '</div>';
        $(this).parents('.tabScroll').append(newQ);

        $('#q'+c+'_c').click(function(){
            setupLabel();
        });
        setupLabel();
        $('#newQ').modal('hide');
      }
    });
    
    $(".checkbox").prepend("<span class='icon'></span><span class='icon-to-fade'></span>");
    $(".checkbox").click(function(){
        setupLabel();
    });
    setupLabel();
  });
});


function convertDateToForm(str){
  // str = 5 March 2013
  // --> 2013-03-05
  if(str.length < 1){
    return
  }
  var months = {
    "January":'01', 
    "February":'02', 
    "March":'03', 
    "April":'04', 
    "May":'05', 
    "June":'06', 
    "July":'07', 
    "August":'08', 
    "September":'09', 
    "October":'10', 
    "November":'11', 
    "December":'12'
  };
  var strArr = str.split(' ');
  var day = (strArr[0].length == 2) ? strArr[0] : '0'+strArr[0];
  return ''+strArr[2]+'-'+months[strArr[1]]+'-'+day
}

function convertDateFromForm(str){
  // str = 2013-03-05
  // --> 5 March 2013
  if(str.length < 1){
    return ''
  }
  var months = {
    '01':"January", 
    '02':"February", 
    '03':"March", 
    '04':"April", 
    '05':"May", 
    '06':"June",
    '07':"July", 
    '08':"August", 
    '09':"September", 
    '10':"October", 
    '11':"November", 
    '12':"December"
  };
  var strArr = str.split('-');
  var day = (strArr[2][0] == '0') ? strArr[2][1] : strArr[2];
  return ''+day+' '+months[strArr[1]]+' '+strArr[0]
}

function loadPhotos(){
  var d = $.Deferred();
  $.getJSON(jsonPhotoFile,function(ph){
    processPhotos(ph);
  }).done(function(p){
    d.resolve(p);
  }).fail(d.reject);
  return d.promise();
}

function loadLocations(){
  var d = $.Deferred();
  $.getJSON(jsonLocationFile,function(lo){
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
  var shareIcon={
    "Private":" ",
    "Shared":" "
  }
  var pHTML = [];
  for(var img in ph){
    var p = '<div class="asset" type="photo" id = "'+img+'">'+
      '<div class="row-fluid">'+
        '<div class="span1 cb">'+
            '<label class="checkbox" for="'+img+'_c">'+
              '<span class="icon"></span>'+
              '<span class="icon-to-fade"></span>'+
              '<input type="checkbox" value="" id="'+img+'_c">'+
            '</label>'+
          '</div>'+
        '<div class="span2">'+
          '<div class="row-fluid">'+
            '<div class="span12 thumbnailImage">'+
              '<a class="thumbnail" href="images/story/'+ph[img].i+'">'+
                '<div class="crop_image" image = "'+ph[img].i+'"></div>'+
              '</a>'+
            '</div>'+
          '</div>'+
          '<div class="row-fluid">'+
            '<div class="span12">'+
              '<div class="row-fluid">'+
                '<div class="span3">'+
                '</div>'+
                '<div class="span6">'+
                  '<div class="btn btn-block btn-small shareNotification '+shareConvert[ph[img].share]+'">'+shareIcon[ph[img].share]+ph[img].share+'</div>'+
                '</div>'+
                '<div class="span3">'+
                '</div>'+
              '</div>'+
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
          '<div class="row-fluid">'+
            '<div class="span12">'+
              '<h3 class="recorderNotification placeholder">Sent to recorder</h3>'+
            '</div>'+
          '</div>'+
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
  var shareIcon={
    "Private":" ",
    "Shared":" "
  }
  var lHTML = [];
  for(var l in lo){
    var ls = '<div class="asset" type="location" id = "'+l+'">'+
      '<div class="row-fluid">'+
        '<div class="span1 cb">'+
          '<label class="checkbox" for="'+l+'_c">'+
            '<span class="icon"></span>'+
            '<span class="icon-to-fade"></span>'+
            '<input type="checkbox" value="" id="'+l+'_c">'+
          '</label>'+
        '</div>'+
        '<div class="span2">'+
          '<div class="row-fluid">'+
            '<div class="span12">'+
              '<div class="audio_icon">'+
                '<i class="fui-location-16"></i>'+
              '</div>'+
            '</div>'+
          '</div>'+
          '<div class="row-fluid">'+
            '<div class="span12">'+
              '<div class="row-fluid">'+
                '<div class="span3">'+
                '</div>'+
                '<div class="span6">'+
                  '<div class="btn btn-block btn-small shareNotification '+shareConvert[lo[l].share]+'">'+shareIcon[lo[l].share]+lo[l].share+'</div>'+
                '</div>'+
                '<div class="span3">'+
                '</div>'+
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
          '<div class="row-fluid">'+
            '<div class="span12">'+
              '<h3 class="recorderNotification placeholder">Sent to recorder</h3>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>'+
      '<hr>'+
    '</div>';

    lHTML.push(ls);
  }

  $('#tab3 .tabScroll').append(lHTML.join(''));
}