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