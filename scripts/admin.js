$(document).ready(function(){
  $('.default_hidden').hide();
  
  $('.crop_image').each(function(){
    var f = $(this).attr('image');
    $(this).css('background-image','url(images/story/'+f+')');
  });

  $('.thumbnail').imageZoom();

  $('.saved_audio').on('click','.edit_audio',function(){
    var audioData = $(this).parents('.saved_audio');
    var pdisplay = audioData.children('.display_slide');
    var pform = audioData.children('.form_slide');

    var title = pdisplay.find('h2.no_margin').text();
    pform.find('.audio_title').val(title);

    audioData.css('height','110px');
    slideOutIn(pdisplay,pform);
  });

  $('.saved_audio').on('click','.submitting',function(e){
    var audioData = $(this).parents('.saved_audio');
    var pdisplay = audioData.children('.display_slide');
    var pform = audioData.children('.form_slide');

    var title = pform.find('.audio_title').val();
    pdisplay.find('h2.no_margin').text(title);

    audioData.css('height','auto');
    slideOutIn(pdisplay,pform);
    e.preventDefault();
  });

  $('.saved_photo').on('click','.edit_photo',function(){
    console.log('edit');
    var photoData = $(this).parents('.photo_data');
    var pdisplay = photoData.children('.display_slide');
    var pform = photoData.children('.form_slide');

    var name = pdisplay.find('.photo_name').text();
    var date = convertDateToForm(pdisplay.find('.photo_date').text());
    var desc = pdisplay.find('.photo_desc').text();

    pform.find('.photo_name').val(name);
    pform.find('.photo_date').val(date);
    pform.find('.photo_desc').val(desc);

    slideOutIn(pdisplay,pform);
  });

  $('.saved_photo').on('click','.submitting',function(e){
    var photoData = $(this).parents('.photo_data');
    var pdisplay = photoData.children('.display_slide');
    var pform = photoData.children('.form_slide');
    
    var name = pform.find('.photo_name').val();
    var date = convertDateFromForm(pform.find('.photo_date').val());
    var desc = pform.find('.photo_desc').val();    

    pdisplay.find('.photo_name').text(name);
    pdisplay.find('.photo_date').text(date);
    pdisplay.find('.photo_desc').text(desc);

    slideOutIn(pdisplay, pform);
    e.preventDefault();
  });
});

function slideOutIn(inElement,outElement) {
  outElement.toggle('slide',{ direction:'right'},500);
  inElement.toggle('slide', { direction:'left'},500);
}

function convertDateToForm(str){
  // str = 5 March 2013
  // --> 2013-03-05
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