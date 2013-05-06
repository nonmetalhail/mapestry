var projectCount = 2;
$(document).ready(function(){
  var wHeight = window.innerHeight - $('.navbar').outerHeight();
  $('.projects_sidebar').css('height',wHeight * .92);
  $('#storyList').css('height',wHeight *.96);

  $('.editable').inlineEdit(); 
  $('.projects').on('change','.project_name',function(){
    var pid = $(this).parents('.folders').attr('id');
    var newText = $(this).find('input').val();
    $(this).find('button:first-child').mouseup(function(){
      $('.'+pid).text(newText);
    });
  });

  $('#addProject').on('click',function(){
    //add form for title
    projectCount++;
    var el = '' + 
    '<div class="well folders" id = "pj'+projectCount+'">'+
      '<div class="row-fluid">'+
        '<div class="span11">'+
          '<h5 class="project_name editable">'+
            '<span class="placeholder">Project Name</span>'+
          '</h5>'+
        '</div>'+
        '<div class="span1">'+
          '<div class="admin-open-icon fui-menu-24"></div>'+
        '</div>'+
      '</div>'+
      '<div class="row-fluid">'+
        '<div class = "audio">'+
          'Audio: <span class="count">0</span>'+
          '<ol class = "components">'+
          '</ol>'+
        '</div>'+
        '<div class = "media">'+
          'Photos: <span class="count">0</span>'+
        '</div>'+
      '</div>'+
      '<div class="row-fluid">'+
        '<div class="span6">'+
          '<a href="mapestry.html" class="btn btn-block btn-warning preview">Preview</a>'+
        '</div>'+
      '</div>'+
    '</div>';
    projectListeners($(el).appendTo('.projects'));
    $('.editable').inlineEdit(); 
  });

  //jquery ui doesnt allow for bubbling listeners, so do this manually on creation
  projectListeners($('.folders'));
  assetListeners($('.audio_story'));
});


function projectListeners(projects){
  $(projects).each(function(){
    $(this).on('click','.admin-open-icon',function(){
      $(this).parents('.well').find('.components').slideToggle("fast");
    });
    
    $(this).droppable({ 
      accept: ".audio_story",
      activeClass: "activeDrop",
      hoverClass: "hoverDrop",
      tolerance: 'pointer',
      // over: function( event, ui ) {console.log('over');},
      drop: function( event, ui ) {
        var itemID = ui.draggable.attr('id');
        var text = ui.draggable.find('.asset_name:first-child').text();
        var mCount = ui.draggable.find('.media_count').text();
        var el = $(this);

        var projectName = $(this).find('.project_name').text();
        var pid = $(this).attr('id');

        el.find('.audio .count').text(parseInt(el.find('.audio .count').text()) + 1);
        el.find('.components').append('<li class="'+itemID+'">'+text+' <i class="story_del fui-cross-16"></i></li>');
        el.find('.media .count').text(parseInt(el.find('.media .count').text())+parseInt(mCount));

        ui.draggable.find( ".none" ).remove();
        ui.draggable.find('.asset_projects').append('<li class="placeholder '+pid+'">'+projectName+'</li>');
      }
    }); 

    $(this).find('.components').sortable().hide();
    $(this).on("click",'.story_del',function(){
      var el = $(this);
      var sid = el.parent().attr('class');
      var pid = el.parents('.folders').attr('id');
      var mCount = parseInt($('#'+sid).find('.media_count').text());
      var pC = parseInt(el.parents('.audio').siblings('.media').find('.count').text());
      
      el.parents('.audio').find('.count').text(parseInt(el.parents('.audio').find('.count').text()) - 1);
      el.parents('.audio').siblings('.media').find('.count').text(pC-mCount);

      el.parent().remove();
      $('#'+sid).find('.'+pid+':last').remove();
    });
  });
}

function assetListeners(assets){
  assets.each(function(){
    $(this).draggable({
      appendTo:'body',
      revert: 'invalid', 
      revertDuration:250,
      helper: function(e){
        var helperDiv = [];
        helperDiv.push('<div class="helper"><h5>');
        helperDiv.push($(this).find('.asset_name').text());
        helperDiv.push('</h5><i class="icon-volume-up icon-large"></i></div>');
        return $(helperDiv.join(''));
      },
      start: function (event, ui) {
        $(ui.helper).css("margin-left", event.clientX - $(event.target).offset().left);
        $(ui.helper).css("margin-top", event.clientY - $(event.target).offset().top);
      }
    });
  });
}


function slideOutIn(inElement,outElement) {
  outElement.toggle('slide',{ direction:'right'},500);
  inElement.toggle('slide', { direction:'left'},500);
}

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