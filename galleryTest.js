var slider, scontrol;

$(document).ready(function(){
  var w = $('.span9').width() - 51;
  $('#control_window').css('width',w)
  slider = $('#mainGallery').bxSlider({
    slideWidth: w,
    infiniteLoop: false,
    hideControlOnEnd:true,
    pager:false,
    captions: true,
    onSlideNext:function(slideElement, oldIndex, newIndex){
      var ca = $('.control_li.active');
      ca.removeClass('active');
      // scontrol.goToNextSlide();
      scontrol.goToSlide(newIndex);
      ca.next().addClass('active');
    },
    onSlidePrev:function(slideElement, oldIndex, newIndex){
      var ca = $('.control_li.active');
      ca.removeClass('active');
      // scontrol.goToPrevSlide();
      scontrol.goToSlide(newIndex);
      ca.prev().addClass('active');
    }
  });
  $('#mainGallery').parents('.bx-wrapper').addClass('gallery_big');

  scontrol = $('#sliderGallery').bxSlider({
    slideWidth: 150,
    infiniteLoop: false,
    hideControlOnEnd:true,
    captions:true,
    pager:false,
    video:true,
    moveSlides: 1,
    slideMargin: 1
  });  
  $('#sliderGallery').parents('.bx-wrapper').addClass('gallery_control');
  $('.control_li:first').addClass('active');

  $('#sliderGallery').on('click','.control_li',function(){
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

  $('#map_button').on("click",function(e){
    $('#gallery').slideUp("slow");
  });
  $('#photo_button').on("click",function(e){
    $('#gallery').slideDown("slow");
    filterGallery();
  });
  $('#gallery').slideUp("slow");
});

function filterGallery(story){
  console.log(story);
  // $('#gallery li').remove();
  $('.0').remove();
  // $('#mainGallery').append(buildGalleryList(story,'p'));
  // $('#sliderGallery').append(buildGalleryList(story,'c'));
  slider.reloadSlider();
  scontrol.reloadSlider();
  $('#mainGallery').parents('.bx-wrapper').addClass('gallery_big');
  $('#sliderGallery').parents('.bx-wrapper').addClass('gallery_control');
  $('.control_li:first').addClass('active');
}