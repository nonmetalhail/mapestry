$(document).ready(function(){
  var w = $('.span9').width() - 51;
  var slider, scontrol;

  slider = $('.bxslider').bxSlider({
    slideWidth: w,
    infiniteLoop: false,
    captions: true,
    onSlideNext:function(slideElement, oldIndex, newIndex){
      var ca = $('.control_li.active');
      ca.removeClass('active');
      scontrol.goToNextSlide();
      ca.next().addClass('active');
    },
    onSlidePrev:function(slideElement, oldIndex, newIndex){
      var ca = $('.control_li.active');
      ca.removeClass('active');
      scontrol.goToPrevSlide();
      ca.prev().addClass('active');
    }
  });
  $('.bxslider').parents('.bx-wrapper').addClass('gallery_big');

  scontrol = $('.sliderControl').bxSlider({
    slideWidth: w,
    infiniteLoop: false,
    moveSlides: 1,
    slideMargin: 1
  });  
  $('.sliderControl').parents('.bx-wrapper').addClass('gallery_control');
  $('.control_li:first').addClass('active');

  $('.sliderControl').on('click','.control_li',function(){
    var self = this;
    $('.control_li.active').removeClass('active');
    $('.control_li').each(function(i){
      if(this == self){
        scontrol.goToSlide(i);
        slider.goToSlide(i);
      }
    });
    $(this).addClass('active');
  });

  $('#photo_button').on("click",function(e){
    console.log("clicked");
    e.preventDefault();
    $('.2').remove();
    
    var photoList = [
      '<div class = "thumb"><img class = "thumbs" src="images/story/DSC_1140.jpg" /></div>',
      '<div class = "thumb"><img class = "thumbs" src="images/story/DSC_1169.jpg" /></div>'
    ];
    slider.reloadSlider();
    $('.bxslider').parents('.bx-wrapper').addClass('gallery_big');
  });
});