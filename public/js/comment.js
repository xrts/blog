var perpage = 6;
var page = 1;
var pages = 0;
var comments = [];
//提交评论
$('#messageBtn').on('click',function(){
	$.ajax({
		type:'post',
		url:'/api/comment/post',
		data:{
			contentid:$("#contentId").val(),
			comment:$('#commitTextarea').val()
		},
		dataType:'json',
		success:function(result){
			$('#commitTextarea').val('');
			renderComment();
			if(!result.code){
				window.location.reload();
			}
		},
		error:function(err){
		}
	})
});

//每次页面重载的时候获取一下该文章的所有评论
$.ajax({
	url:'/api/comment',
	data:{
		contentid:$('#contentId').val()
	},
	success:function(result){
		comments= result;
		renderComment();
	}
})

//事件委托，上一页，下一页点击
$('#pager').delegate('a','click',function(){
	if($(this).parent().hasClass('previous')){
		if(page>1){
			page--;
		}
	}else{
		if(page<pages){
			page++;
		}
	}
	renderComment();
})	

//渲染评论页面
function renderComment() {

	//分页实现
	pages=Math.max(Math.ceil(comments.length/perpage),1);
	var start=Math.max(0,(page-1)*perpage);
	var end =Math.min(start+perpage,comments.length);

	$lis= $('#pager li');
	$lis.eq(1).html( page + ' / ' + pages );


	//评论数
	$('#messageCount').html(comments.length);
	$('#commentC').html(comments.length);

	//判断是否有评论
	if (comments.length  == 0 ) {
		$('#noComments').html('<div >还没有留言!</div>');
		$('#pager').hide();
		$('#messageList').hide();
	}else{
		$('#pager').show();
		$('#messageList').show();
		$('#noComments').html('');

		//评论
		var html = '';
		for(var i =start;i<end;i++){
			html +=('<div class="messageBox" ><p class="name clear"><span class="fl">'+comments[i].username+'</span><span class="fl fr">'+formatDate(comments[i].addDate)+'</span></p><p>'+comments[i].content+'</p></div>');
		}
		$('#messageList').html(html);
	};
}

//格式化显示日期
function formatDate(d){
	var date = new Date(d);
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	if(month<10){
		month='0'+month;
	}
	var day=date.getDate();
	if(day<10){
		day ='0'+day;
	}
	var hours= date.getHours();
	if(hours<10){
		hours='0'+hours;
	}
	var minutes=date.getMinutes();
	if(minutes<10){
		minutes ='0'+minutes;
	}
	var seconds = date.getSeconds();
	if(seconds<10){
		seconds ='0'+seconds;
	}
	return year+'-'+month+'-'+day+' '+hours+':'+minutes+':'+seconds;
}




