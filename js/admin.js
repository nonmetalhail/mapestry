//admin.html js 

//this function is working but i have to figure out how to get it to stay on the tab

$(document).ready(function(){
	$("#saved_photo").hide();
	$("#saved_video").hide();
	$("#saved_photo2").hide();
	$("#photo_test").submit(function(){
	
			photo_inputs();
			$("#photo_test").hide();
			$("#photo_test2").hide();
			$("#saved_photo").show();

			// alert ("it worked?")
			return false;
			//blank forms need to remain unchanged
			//need to show what IS submitted

	});
	// so this should be the second submit button but it doesn't display 
	// content on submit, save for the image.
	$("#photo_test2").submit(function(){
	
			photo_inputs();
			//$("#photo_test").hide();
			$("#photo_test2").hide();
			$("#saved_photo2").show();

			// alert ("it worked?");
			return false;
			//blank forms need to remain unchanged
			//need to show what IS submitted

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

function photo_inputs() {
	//name input
	$(".input_name").empty().text($("#name").val() );
	//date input
	$(".input_date").empty().text($("#date").val() );
	//description input
	$(".input_desc").empty().text($("#desc").val() );
	}