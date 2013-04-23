//admin.html js 

//this function is working but i have to figure out how to get it to stay on the tab

$(document).ready(function(){
	$("#saved_content").hide();
	$("#photo_test").submit(function(){
	
			photo_inputs();
			$("#photo_test").hide();
			$("#saved_content").show();

			alert ("it worked?")
			return false;
			//blank forms need to remain unchanged
			//need to show what IS submitted

	});
	$("#video").submit(function(){
	
			photo_inputs();
			$("#video").hide();
			$("#saved_content_video1").show();

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