var express = require('express');
var router = express.Router();
var query = require('../models/Pool');
//统一返回格式
var responseDate;

router.use(function(req,res,next){
	responseDate={
		code:0,
		message:'',
	}
	next();
});

/*用户注册
	注册逻辑

	1、用户名、密码不能为空
	2、两次输入密码必须一致
	3、用户名是否已经被注册（数据库）*/
router.post('/user/register',function(req,res,next){	
	var username = req.body.username;
	var pwd= req.body.pwd;
	var repwd = req.body.repwd;
	if(username==''){
		responseDate.code=1;
		responseDate.message='用户名不能为空';
		res.json(responseDate);
		return;
	}
	if(pwd==''){
		responseDate.code=1;
		responseDate.message='密码不能为空';
		res.json(responseDate);
		return;
	}
	if(pwd!=repwd){
		responseDate.code=1;
		responseDate.message='两次输入的密码不同';
		res.json(responseDate);
		return;
	}

	//注册数据库检查，检查用户名是否已经存在
	
		var sql = 'SELECT * FROM users WHERE username=?';
		var param = [username];
		query(sql,param,function(err,rs,fields){
			//如果查询不到返回空数组则注册成功
			if(Object.prototype.toString.call(rs) === '[object Array]' && rs.length === 0){
				responseDate.message='注册成功，请登录~~';
				
				res.json(responseDate);
				//注册成功后将该条记录插入到数据库中
				var sql = 'insert into users(username,pwd) values(?,?)';
				var param = [username,pwd];
				query(sql,param,function(err,rs){});
				return;
			}else{
				responseDate.code=2;
				responseDate.message='用户名已经存在';
				res.json(responseDate);
				return;
			}
		});
		
});

/*用户登录
	登录逻辑
	查找数据库用户名和密码一致则登录成功*/
router.post('/user/login',function(req,res){
	var username = req.body.username;
	var pwd= req.body.pwd;

	if(username==''||pwd==''){
		responseDate.code=1;
		responseDate.message='用户名和密码不能为空';
		res.json(responseDate);
		return;
	}
	
		var sql = 'SELECT * FROM users WHERE username=? AND pwd=?';
		var param= [username,pwd];
		query(sql,param,function(err,rs,fields){

			if(Object.prototype.toString.call(rs) === '[object Array]' && rs.length === 0){
				responseDate.code=2;
				responseDate.message='登录失败，请输入正确的用户名和密码！';
				res.json(responseDate);
				return;
			}else{
				responseDate.message='登录成功';
				responseDate.myusername=username;
				req.cookies.set('userInfo',JSON.stringify({
					id:rs[0].id,
					myusername:username,
					isAdmin:Boolean(rs[0].isAdmin)
					
				}));
				res.json(responseDate);
				return;
			}					
		});		
});

/*退出
*/
router.get('/user/logout',function(req,res){
	req.cookies.set('userInfo',null);
	res.json(responseDate);
});


/*指定文章的全部评论
*/
router.get('/comment',function(req,res){
	var contentId = req.query.contentid || '';
	var sql= 'SELECT * FROM comments WHERE cid=? order by id desc';
	var param = [contentId];
	var comments=[];
	query(sql,param,function(err,rs,fields){
		for(var i =0;i<rs.length;i++){
			comments.push({content:rs[i].content,
							addDate:rs[i].addDate,
							username:rs[i].username});
		}
		res.json(comments);
	})
})

/*评论提交
*/
router.post('/comment/post',function(req,res){
	//内容的id
	var contentId = req.body.contentid || '';
	var username=req.userInfo.myusername || '';
	var	content=req.body.comment|| '';
	if(content!=''){
		var sql ='INSERT INTO comments(cid,username,content) VALUES(?,?,?)';
		var param=[contentId,username,content];
		query(sql,param,function(err,rs,fields){});
		responseDate.message='评论成功';
		res.json(responseDate);
		return;
	}else{
		responseDate.message='评论不能为空';
		responseDate.code=3;
		res.json(responseDate);
		return;
	}
})

module.exports= router;