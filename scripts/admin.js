$(document).ready(function(){
  $('.default_hidden').hide();
  
  $('.crop_image').each(function(){
    var f = $(this).attr('image');
    $(this).css('background-image','url(images/story/'+f+')');
  });

  $('.thumbnail').imageZoom();

  $('#addProject').on('click',function(){
    //add form for title and counter for id
    var el = '' + 
    '<div class="well folders" id = "p3">'+
      '<div class="row-fluid">'+
        '<div class="span11">'+
          '<h5>'+
            '<a class="project_name">Family History</a>'+
          '</h5>'+
        '</div>'+
        '<div class="span1">'+
          '<div class="admin-open-icon fui-menu-24"></div>'+
        '</div>'+
      '</div>'+
      '<div class="row-fluid">'+
        '<div class = "media audio">'+
          'Audio: <span class="count">0</span>'+
          '<ol class = "components">'+
          '</ol>'+
        '</div>'+
        '<div class = "media photo">'+
          'Photos: <span class="count">0</span>'+
          '<ol class = "components">'+
          '</ol>'+
        '</div>'+
        '<div class = "media video">'+
          'Videos: <span class="count">0</span>'+
          '<ol class = "components">'+
          '</ol>'+
        '</div>'+
      '</div>'+
    '</div>';
    projectListeners($(el).appendTo('.projects'));
  });

  //jquery ui doesnt allow for bubbling listeners, so do this manually on creation
  projectListeners($('.folders'));
  assetListeners($('.asset'));
});


function projectListeners(projects){
  $(projects).each(function(){
    $(this).on('click','.admin-open-icon',function(){
      $(this).parents('.well').find('.components').slideToggle("fast");
    });
    
    $(this).droppable({ 
      accept: ".asset",
      activeClass: "activeDrop",
      hoverClass: "hoverDrop",
       tolerance: 'pointer',
      // over: function( event, ui ) {console.log('over');},
      drop: function( event, ui ) {
        var type = ui.draggable.attr('type');
        var itemID = ui.draggable.attr('id');
        var text = ui.draggable.find('.asset_name:first-child').text()
        var el = $(this).find('.' + type);
        
        var projectName = $(this).find('.project_name').text();
        var pid = $(this).attr('id');

        el.children('.count').text(parseInt(el.children('.count').text()) + 1);
        el.children('.components').append('<li class="'+itemID+'">'+text+'</li>');

        ui.draggable.find( ".placeholder" ).remove();
        ui.draggable.find('.asset_projects').append('<li class="'+pid+'">'+projectName+'</li>');
      }
    }); 

    $(this).find('.components').sortable().hide();
  });
}

function assetListeners(assets){
  assets.each(function(){
    $(this).on('click','.edit_asset',function(){
      var assetData = $(this).parents('.asset_data');
      var pdisplay = assetData.children('.display_slide');
      var pform = assetData.children('.form_slide');

      var name = pdisplay.find('.asset_name').text();
      var date = convertDateToForm(pdisplay.find('.asset_date').text());
      var desc = pdisplay.find('.asset_desc').text();

      pform.find('.asset_name').val(name);
      pform.find('.asset_date').val(date);
      pform.find('.asset_desc').val(desc);

      pdisplay.toggleClass('content');
      slideOutIn(pdisplay,pform);
      pdisplay.toggleClass('content');
      
    });

    $(this).on('click','.submitting',function(e){
      var assetData = $(this).parents('.asset_data');
      var pdisplay = assetData.children('.display_slide');
      var pform = assetData.children('.form_slide');
      
      var name = pform.find('.asset_name').val();
      var date = convertDateFromForm(pform.find('.asset_date').val());
      var desc = pform.find('.asset_desc').val();    

      pdisplay.find('.asset_name').text(name);
      pdisplay.find('.asset_date').text(date);
      pdisplay.find('.asset_desc').text(desc);

      var id = $(this).parents('.asset').attr('id');
      $('.'+id).each(function(){
        $(this).text(name)
      });

      pdisplay.toggleClass('content');
      slideOutIn(pdisplay, pform);
      pdisplay.toggleClass('content');
      e.preventDefault();
    });

    $(this).draggable({
      appendTo:'body',
      revert: 'invalid', 
      helper: "clone",
      revertDuration:250,
      helper: function(e){
        if(this.getAttribute('type') == 'audio'){
          var helperDiv = [];
          helperDiv.push('<div class="helper"><h2>');
          helperDiv.push($(this).find('.asset_name').text());
          helperDiv.push('</h2><i class="icon-volume-up icon-large"></i></div>');
          return $(helperDiv.join(''));
        }
        else{
          var f = $(this).find('.crop_image').attr('image');
          var el = $('<div class="helper helper_photo"></div>');
          el.css('background-image','url(images/story/'+f+')');
          return el
        }
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