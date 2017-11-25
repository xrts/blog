var express = require('express');
var router = express.Router();
var query = require('../models/Pool');

/*进入权限验证
*/
var categories;
router.use(function(req,res,next){
	if(!req.userInfo.isAdmin){
		res.send('对不起，只要管理员才可以进入后台管理');
		return;
	}
	categories=[];
	query('SELECT * FROM categories',function(err,rs,fields){

		for(var i =0 ;i<rs.length;i++){
			categories.push({id:rs[i].id,name:rs[i].name});
		}
		next();
	})
})

/*首页
*/
router.get('/',function(req,res,next){
	res.render('admin/index',{
		userInfo :req.userInfo
	});	
})

/*用户管理
*/
router.get('/user',function(req,res,next){
	//获取数据库内的数据存入users中

	var page= Number(req.query.page || 1);
	var limit=4;
	var pages=0;

	//统计数据总条数
	query('SELECT count(*) ct FROM users',function(err,rs,fields){
		//计算总页数
		var count=Number(rs[0].ct);

		pages=Math.ceil(count/limit);
		//取值
		page=Math.min(page,pages);
		page=Math.max(page,1);
		//每次偏移量
		var offset= (page-1)*limit;
		
		var users=[];
		var sql = 'SELECT * FROM users limit ? offset ? ';
		var param = [limit,offset];	
		query(sql,param,function(err,rs,fields){			
			for(var i = 0; i<rs.length;i++){
				users.push({id:rs[i].id,
				username:rs[i].username,
				pwd:rs[i].pwd,
				isAdmin:Boolean(rs[i].isAdmin)
				})			
			};	
			res.render('admin/user_index',{
				userInfo :req.userInfo,
				users:users,
				count:count,
				pages:pages,
				page:page,
				limit:limit,
				myrouter:'/admin/user'
			});
		});
	});				
})

/*分类管理
*/
//分类首页
router.get('/category',function(req,res,next){
	var page= Number(req.query.page || 1);
	var limit=4;
	var pages=0;

		//计算总页数
		var count=categories.length;
		pages=Math.ceil(count/limit);
		//取值
		page=Math.min(page,pages);
		page=Math.max(page,1);
		//每次偏移量
		var offset= (page-1)*limit;
		
		var mycategories=[];
		var sql = 'SELECT * FROM categories order by id desc limit ? offset ? ';
		var param = [limit,offset];	
		query(sql,param,function(err,rs,fields){			
			for(var i = 0; i<rs.length;i++){
				mycategories.push({id:rs[i].id,
							name:rs[i].name,
				})			
			};	
			res.render('admin/category_index',{
				userInfo :req.userInfo,
				categories:mycategories,
				count:count,
				pages:pages,
				page:page,
				limit:limit,
				myrouter:'/admin/category'
			});
		});
	
})

//分类添加
router.get('/category/add',function(req,res,next){

	res.render('admin/category_add',{
		userInfo :req.userInfo
	});
})

//分类保存
router.post('/category/add',function(req,res,next){

	var name = req.body.name || '';

	if(name==''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'名称不能为空'
		});
		return false;
	}else{
		//查询数据库中是否存在该分类
		query('SELECT * FROM categories WHERE name=?',[name],function(err,rs,fields){
			//返回空数组则没有该分类
			if(Object.prototype.toString.call(rs) === '[object Array]' && rs.length === 0){
				//将该分类插入数据库中
				sql='INSERT INTO categories(name) VALUES(?)'
				param=[name];
				query(sql,param,function(err,rs,fields){
					res.render('admin/success',{
						userInfo:req.userInfo,
						message:'分类保存成功',
						url:'/admin/category'
					})
				})
			}else{
					//数据库中已经存在该分类
				res.render('admin/error',{
					userInfo:req.userInfo,
					message:'分类已经存在'
				});
			}
		})
	}
})

//分类编辑
router.get('/category/edit',function(req,res,next){
	var id = req.query.id || '';
	query('SELECT * FROM categories WHERE id= ?',[id],function(err,rs,fields){
		var category = rs[0].name;
		res.render('admin/category_edit',{
			userInfo :req.userInfo,
			category:category
		});
	})	
})

//分类编辑保存
router.post('/category/edit',function(req,res,next){
	var name = req.body.name || '';
	var id = req.query.id || '';

	if(name==''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'分类不能为空'
		})
		return false;
	}else{

		query('SELECT * FROM categories WHERE id= ?',[id],function(err,rs,fields){
			var category = rs[0].name
		
		//当用户没有修改内容时
		if(name==category){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'修改成功',
				url:'/admin/category'
			});
		}else{
			//查找数据库中是否存在修改后的分类名，如果存在则修改失败
			query('SELECT * FROM categories WHERE name = ?',[name],function(err,rs,fields){
				if(Object.prototype.toString.call(rs) === '[object Array]' && rs.length === 0){
					//将修改的数据更新进数据库
					query('UPDATE categories SET  name = ? WHERE id =?',[name,id],function(err,rs,fields){
						res.render('admin/success',{
							userInfo:req.userInfo,
							message:'修改成功',
							url:'/admin/category'
						});
					})		
				}else{
					res.render('admin/error',{
						userInfo:req.userInfo,
						message:'分类名已经存在'
					})
				}
			})
		}
		})
	}
})

//分类删除
router.get('/category/delete',function(req,res,next){
	//获取要删除的分类ID
	var id = req.query.id || '';
	query('DELETE FROM categories WHERE id=?',[id],function(err,re,fields){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'删除成功',
			url:'/admin/category'
		});
	})
})

/*内容管理
*/
//内容管理首页
router.get('/content',function(req,res,next){
	var page= Number(req.query.page || 1);
	var limit=4;
	var pages=0;

	query('SELECT count(*) ct FROM contents',function(err,rs,fields){
		//计算总页数
		var count=Number(rs[0].ct);

		pages=Math.ceil(count/limit);
		//取值
		page=Math.min(page,pages);
		page=Math.max(page,1);
		//每次偏移量
		var offset= (page-1)*limit;
		
		var contents=[];
		var sql = 'SELECT * FROM contents order by id desc limit ? offset ? ';
		var param = [limit,offset];	
		query(sql,param,function(err,rs,fields){
			for(var i = 0; i<rs.length;i++){
				contents.push({id:rs[i].id,
							name:rs[i].name,
							title:rs[i].title,
							author:rs[i].author,
							addDate:rs[i].mydate,
							views:rs[i].pageViews
				})			
			};	
			res.render('admin/content_index',{
				userInfo :req.userInfo,
				contents:contents,
				count:count,
				pages:pages,
				page:page,
				limit:limit,
				myrouter:'/admin/content'
			});
		});
	});	

})

//内容添加
router.get('/content/add',function(req,res,next){
		res.render('admin/content_add',{
			userInfo:req.userInfo,
			categories:categories
		})
})

//内容添加保存
router.post('/content/add',function(req,res){
	var cid = req.body.category ||'';
	//var cid = req.body.category.id || '';
	var title = req.body.title ||'';
	var author = req.body.author ||'';
	var description = req.body.description ||'';
	var content = req.body.content ||'';
	//var content=editor.getContent() 
	var category;
	for(var i=0;i<categories.length;i++){
		if(categories[i].id==cid){
			category=categories[i].name;
		}
	}


	if(cid=='' || title=='' || description=='' || /*content=='' ||*/ author==''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'所有框内输入不能为空'
		});
	}else{
		var sql ='INSERT INTO contents(cid,name,title,author,description,content) VALUES(?,?,?,?,?,?) '
		var param=[cid,category,title,author,description,content];
		query(sql,param,function(err,rs,fields){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'内容添加成功',
				url:'/admin/content'
			})
		})
	}
})

//内容修改
router.get('/content/edit',function(req,res){
	var id = req.query.id || '';
	query('SELECT * FROM contents WHERE id= ?',[id],function(err,rs,fields){
		var cid = rs[0].cid;
		var name = rs[0].name;
		var title = rs[0].title;
		var author = rs[0].author;
		var description = rs[0].description;
		var content = rs[0].content;

		res.render('admin/content_edit',{
			userInfo :req.userInfo,
			cid:cid,
			name:name,
			title:title,
			author:author,
			description:description,
			content:content,
			categories:categories
		});
	})	
});

//内容修改保存
router.post('/content/edit',function(req,res){
	var id= req.query.id || '';
	var cid = req.body.category ||'';
	var title = req.body.title ||'';
	var author = req.body.author ||'';
	var description = req.body.description ||'';
	var content = req.body.content ||'';
	var category;
	for(var i=0;i<categories.length;i++){
		if(categories[i].id==cid){
			category=categories[i].name;
		}
	}
	console.log(cid);
	if(cid=='' || title=='' || description=='' || content=='' || author==''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'所有框内输入不能为空'
		});
	}else{
		var sql ='UPDATE contents SET cid=? ,name =?, title=? ,author=? ,description=?, content=? WHERE id =? '
		var param=[cid,category,title,author,description,content,id];
		query(sql,param,function(err,rs,fields){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'内容修改成功',
				url:'/admin/content'
			})
		})
	}
})

//内容删除
router.get('/content/delete',function(req,res,next){
	//获取要删除的分类ID
	var id = req.query.id || '';
	query('DELETE FROM contents WHERE id=?',[id],function(err,re,fields){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'删除成功',
			url:'/admin/content'
		});
	})
})



	

module.exports= router;