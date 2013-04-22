//admin.html js 

//this function is working but i have to figure out how to get it to stay on the tab

$(document).ready(function(){
	$("#saved_content").hide();
	$("form").submit(function(){
	
			photo_inputs();
			$("#saved_content").show();
			$("form").hide();
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