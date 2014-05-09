var apiJson = "example.json";
var url = 'mapestry.html?';

$(document).ready(function(){
  $.when(loadstories())
  .done(function(){
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

function loadstories(){
  var d = $.Deferred();
  $.getJSON(apiJson,function(d){
    processStories(d);
  }).done(function(p){
    d.resolve(p);
  }).fail(d.reject);
  return d.promise();
}

function _buildTagList(t){
  var sList = [];
  for(var i in t){
    sList.push('<li class="tag">'+t[i]+'</li>');
  }
  return sList.join('')
}

function processStories(stories){
  var lHTML = [];
  console.log(stories);
  for(var s in stories){
    var shtml ='<div class = "row-fluid raw_audio">'+
        '<div class="span1">'+
        '</div>'+
        '<div class="span6 asset_data">'+
          '<div class="row-fluid">'+
            '<div class="span7 display_text">'+
              '<a href="'+url+stories[s].story+'" >'+
                '<h3 class="asset_name">'+stories[s].storyTitle+'</h3>'+
              '</a>'+
            '</div>'+
            '<div class="span5">'+
              '<h3 class="asset_date">'+stories[s].rDate+'</h3>'+
            '</div>'+
          '</div>'+
          '<div class="row-fluid">'+
            '<div class="span12 asset_desc">'+stories[s].sText+'</div>'+
          '</div>'+
        '</div>'+
        '<div class="span2">'+
          '<ul>'+
            _buildTagList(stories[s].sTags)+
          '</ul>'+
        '</div>'+
        '<div class="span2">'+
          '<div class="row-fluid">'+
            '<div class="span12 testetst">'+
              '<a class="btn btn-large btn-block btn-primary" href="'+url+stories[s].story+'">Play Story</a>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>'+
      '<hr>';

    lHTML.push(shtml);
  }

  $('#storyCont').append(lHTML.join(''));
}