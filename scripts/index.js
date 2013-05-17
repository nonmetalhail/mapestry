$(document).ready(function(){
  var h1 = $('.white_rect').outerHeight(),
      h2 = $('.index_pic').innerHeight();
  var hx = (h2-h1)/2;
  $('.white_rect').css('margin-top',hx);
});