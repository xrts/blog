

// 注册登录页面切换以及数据的提交
$(function(){
	var $login = $('#loginBox');
	var $register = $('#registerBox');
	var $admin = $('#adminBox');

	$login.find('a').on('click',function(){	
		$register.show();
		$login.hide();
		myclear();
	});

	$register.find('a').on('click',function(){
		$register.hide();
		$login.show();
		myclear();
	});


	//注册
	$register.find("input[value='注册']").on('click',function(){
		$.ajax({
			type:'post',
			url:'/api/user/register',
			data:{
				username:$register.find("[name='username']").val(),
				pwd:$register.find('[name="pwd"]').val(),
				repwd:$register.find('[name="repwd"]').val()
			},
			dataType:'json',
			success:function(result){
				//注册成功后返回登录页面
				$register.find('.myInfo').html(result.message);
				if(!result.code){
					setTimeout(function(){
						$register.hide();
						$login.show();
					},1000)	
				}
			},
			error:function(err){
			}
		})
	});

	//登录
	$login.find("input[value='登录']").on('click',function(){
		$.ajax({
			type:'post',
			url:'/api/user/login',
			data:{
				username:$login.find("[name='username']").val(),
				pwd:$login.find('[name="pwd"]').val(),
			},
			dataType:'json',
			success:function(result){
				
				$login.find('.myInfo').html(result.message);
				if(!result.code){
					setTimeout(function(){
						window.location.reload();
					},1000)	
				}
			},
			error:function(err){
				
			}
		})
	});

	//退出
	$admin.find('.loginOut').on('click',function(){
		$.ajax({
			
			url:'/api/user/logout',
			success:function(result){
				if(!result.code){
					window.location.reload();
				}
			}
		});
	})

	//重置
	$('.mainRight').find("input[value='重置']").on('click',function(){
		
		myclear();

	})

	

	//清空表单元素
	function myclear(){
		$login.find("[name='username']").val('');
		$login.find('[name="pwd"]').val('');
		$login.find('.myInfo').html('');
		$register.find("[name='username']").val('');
		$register.find('[name="pwd"]').val('');
		$register.find('[name="repwd"]').val('');
		$register.find('.myInfo').html('');
	
	}


})

