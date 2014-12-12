var files, id, creator, text; 
$(document).ready(function ($) {
	$("#userBtn").click(function () {
		$("#selectedEdit").animate({left:"5px"}, 300);
		
	});
	$("#huserBtn").on("click", function () {
		$("#selectedEdit").animate({left:"60px"}, 300);
	});
	$("#addBtn").on("click", function () {
		files = null;
		$("#creatorInput").val($('#username').val());
		$('input[type=file]').val("");
		$("#selectedEdit").animate({left:"114px"}, 300, function () {
			$('.uploadModal').css({display:"inline-block"});
			$('.uploadModal').animate({opacity:1}, 300);
			$("#close_btn").click(function () {
				$('.uploadModal').animate({opacity:0}, 300, function (){
					$('.uploadModal').css({display:"none"});
				});
				$('#fileToUpload').html(""); // set all values back to null
				$("#creatorInput").val($('#username').val());
        		$("#docTitleInput").val("");
			});
			// handle image upload
			$("#browse_btn").unbind().on('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				$("#fileInput:hidden").trigger('click');
			});
			$(this).off("click");
			$('input[type=file]').unbind().on('change', prepareupload);
			$("#submit_btn").unbind().on('click', upload_file);
		});
	});
	$("#highlightBtn").on("click", function () {
		$("#selectedEdit").animate({left:"164px"}, 300);
	});
	$("#vibrateBtn").on("click", function () {
		$("#selectedEdit").animate({left:"220px"}, 300);
	});
	$("#archiveBtn").on("click", function () {
		$("#selectedEdit").animate({left:"277px"}, 300);
	});
});
	
function prepareupload (event) {
	files = event.target.files;
	$("#fileToUpload").html(files[0].name);
	creator = $("#creatorInput").val();
	text = $("#docTitleInput").val();
	id = $("#activeItem > .accordion-toggle").attr("id");
}

function upload_file(event) {
	event.stopPropagation(); 
    event.preventDefault(); 
 
    // Create a formdata object and add the files
	var data = new FormData();
	$.each(files, function(key, value)
	{
		data.append(key, value);
	});
    
    $.ajax({
        url: "/SASTeam08/FileUploadServlet?id=" + id + "&creator=" + creator + "&text=" + text,
        type: 'POST',
        data: data,
        cache: false,
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        success: function(data, textStatus, jqXHR)
        {
        	$(".uploadModal").animate({opacity:"0"}, 300, function(){
        		$(".uploadModal").css({display:"none"});
        		$('#fileToUpload').html("");
        		$("#creatorInput").val("");
        		$("#docTitleInput").val("");
        	});
        	getDocs(id);
        },
        error: function(jqXHR, textStatus, errorThrown)
        {
        	// Handle errors here
        	console.log('ERRORS: ' + textStatus);
        }
    });
}

function handleDeleteFile(id, campaignId, href) {
	$.post("/SASTeam08/DeleteFileServlet?id=" + id + "&href=" + href, function(data) {
		console.log(data);
		getDocs(campaignId, href);
		clickedDelete = false; 
	});
}

function downloadFile(href) {
	if (!clickedDelete) {
		var win = window.open(href, '_blank');
		win.focus();
	}
}

function runCommentEditor(docId) {
	var x, y, xPrime, yPrime;
	var clickedInput = false, submitted = false;
	getImageComments(docId);
	$('#imageComments').on('mousemove', function (event) {
		x = 100 * event.pageX / $(document).width();
		y = 100 * event.pageY / $(document).height();
		var deltaX = 100 - x; 
		var deltaY = 100 - y;
		xPrime = (deltaX > 20) ? x + 2 : x - 10; 
		yPrime = (deltaY > 20) ? y + 2 : y - 20;
		//console.log(x + ", " + y);
	});
	var pointX = 0, pointY = 0;
	$('#imageComments').on('click', function () {
		if (!clickedInput) {
			pointX = x; 
			pointY = y; 
			$(".commentInput").remove();
			$("#imageComments > .circle").remove();
			var circleDiv = "<div class=\"circle\" style=\"top:" + y + "%;left:"+ x + "%;\"></div>";
			var commentInputDiv = "<div class=\"commentInput\" style=\"top:" + yPrime + "%;left:"+ xPrime + "%;\">" +
			"<textarea class=\"form-control\" type=\"text\" id=\"commentInput\"/><button id=\"commentInputBtn\" class=\"btn btn-default\">Submit</button></div>"
			$(circleDiv + commentInputDiv).appendTo("#imageComments");
		}
		$('#commentInput').unbind().on('click', function() {
			clickedInput = true;
		});
		$('#commentInputBtn').unbind().on('click', function () {
			sendCommentToDB($('#commentInput').val(), pointX, pointY, docId);
			$(".commentInput").remove();
			$("#imageComments > .circle").remove();
			$('.commentInput').remove();
			clickedInput = true; 
			
		});
		clickedInput = false; 
	});
}

function stopCommentEditor() {
	$('#imageComments').off('mousemove');
	$('#imageComments').off('click');
	$('#commentInput').off('click');
	$('#commentInputBtn').off('click');
}

function sendCommentToDB(comment, xpos, ypos, docId) {
	
	$.post("/SASTeam08/AddComment?id=" + docId + "&usersName=" + $("#userName").val(), {"comment": comment, "xPos" : xpos, "yPos" : ypos}, function(data) {
		
		console.log(data);
		getImageComments(docId);
	});
}

function getImageComments(docId) {
	$("#imageCommentsDisplay").empty();
	$.get("/SASTeam08/GetImageComments?docId=" + docId, function (data) {
		for (var i = 0; i < data.length; i++) {
			var yPrime, xPrime, thisI; 
			var x = parseFloat(data[i].xPos);
			var y = parseFloat(data[i].yPos);
			var deltaX = 100 - x; 
			var deltaY = 100 - y;
			xPrime = (deltaX > 20) ? x + 2 : x - 10; 
			yPrime = (deltaY > 20) ? y + 2 : y - 20;
			var circle = "<div class=\"imageCommentCircle\"" +
			"style=\"top:" + data[i].yPos + "%;left:" + data[i].xPos + "%;\""
			+ "></div>";
			var content = "<div class=\"imageCommentBox\""+
			"style=\"top:" + yPrime + "%;left:" + xPrime + "%;\"" 
			+"><p style=\"background-color:gray;color:white;padding:2px;border-radius:2px\">" + data[i].usersName + " said"
			+ ":</p><p>" + data[i].comment +  "</p></div>"; 
			content = circle + content; 
			$("#imageCommentsDisplay").append(content);
			thisI = i; 
		}
		$(".imageCommentCircle").hover(function () {
			$(this).next().fadeIn(100);
		}, function () {
			$(this).next().fadeOut(100);
		});
	});
}
