$(document).ready(function(){
  $.inlineEdit.prototype.controls.date = function( value ) {
    return '<input type="date" value="'+ convertDateToForm(value.replace(/(\u0022)+/g, '')) +'">' + this.buttonHtml();
  }

  $('.crop_image').each(function(){
    var f = $(this).attr('image');
    $(this).css('background-image','url(images/story/'+f+')');
  });

  $('.thumbnail').imageZoom();

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
    var a = confirm("Are you sure?\n\nYour stories will miss this "+$(this).parents('.asset').attr('type')+"...");
    if(a==true){
      $(this).parents('.asset').fadeOut(750,function(){
        $(this).remove();
      });
    }
  });

  $('.syncRecorder').on('click',function(){
    $(this).fadeOut(750,function(){
      var par = $(this).parent();
      $(this).remove();
      $('<h3 class="placeholder">Sent!</h3>').appendTo(par).hide().fadeIn();
    });
  });

  $('.addFile').on('click',function(){
    alert("Thanks for trying to add a file! \n\nThis feature has not been implemented in this prototype. Why dont you go ahead an pretend you uploaded a file and call it a day.")
  });
  $('.download').on('click',function(){
    alert("This feature is not implemented in our prototype. \n\nAfter all, the entire point of a download feature is so you have access to YOUR content, not take ours...")
  });
});


  // $(projects).each(function(){
  //   $(this).on('click','.admin-open-icon',function(){
  //     $(this).parents('.well').find('.components').slideToggle("fast");
  //   });

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