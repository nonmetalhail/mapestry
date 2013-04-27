$(document).ready(function(){
  $('.default_hidden').hide();
  
  $('.crop_image').each(function(){
    var f = $(this).attr('image');
    $(this).css('background-image','url(images/story/'+f+')');
  });

  $('.saved_photo').on('click','.edit_photo',function(){
    console.log('edit');
    var photoData = $(this).parents('.photo_data');
    var pdisplay = photoData.children('.display_slide');
    var pform = photoData.children('.form_slide');

    var name = pdisplay.children('.photo_name').text();
    var date = pdisplay.children('.photo_date').text();
    var desc = pdisplay.children('.photo_desc').text();

    pform.children('.photo_name').val(name);
    pform.children('.photo_date').val(date);
    pform.children('.photo_desc').val(desc);

    slideOutIn(pdisplay,pform);
  });

  $('.saved_photo').on('click','.submitting',function(e){
    var photoData = $(this).parents('.photo_data');
    var pdisplay = photoData.children('.display_slide');
    var pform = photoData.children('.form_slide');
    
    var name = pform.children('.photo_name').val();
    var date = pform.children('.photo_date').val();
    var desc = pform.children('.photo_desc').val();    

    pdisplay.children('.photo_name').text(name);
    pdisplay.children('.photo_date').text(date);
    pdisplay.children('.photo_desc').text(desc);

    slideOutIn(pdisplay, pform);
    e.preventDefault();
  });

  $("#video").submit(function(){
  
      photo_inputs();
      $("#video").hide();
      $("#saved_video").show();

      alert ("it worked?")
      return false;
      //blank forms need to remain unchanged
      //need to show what IS submitted

  });
});

function slideOutIn(inElement,outElement) {
  outElement.toggle('slide',{ direction:'right'},500);
  inElement.toggle('slide', { direction:'left'},500);
}

function photo_inputs() {
  //name input
  $(".input_name").empty().text($("#name").val() );
  //date input
  $(".input_date").empty().text($("#date").val() );
  //description input
  $(".input_desc").empty().text($("#desc").val() );
}