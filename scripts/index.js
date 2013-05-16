$(document).ready(function(){
  var h1 = $('.white_rect').outerHeight(),
      h2 = $('.index_pic').innerHeight();
  var hx = (h2-h1)/2;
  console.log(h1);
  console.log(h2);
  console.log(hx);
  $('.white_rect').css('margin-top',hx);
});