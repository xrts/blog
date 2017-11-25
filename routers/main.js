var express = require('express');
var router = express.Router();
var query = require('../models/Pool');

//导航栏通用数据
var data ;
router.use(function(req,res,next){
	data={
		categories:[],
		cid:''
		
	}
	query('SELECT * FROM categories',function(err,rs,fields){
		for(var i =0 ;i<rs.length;i++){
			data.categories.push({id:rs[i].id,name:rs[i].name});
		}
		next();	
	})
	
});

//首页
router.get('/',function(req,res,next){
	var contents=[];
	data.cid = req.query.cid || '';
	var page= Number(req.query.page || 1);
	var limit=4;
	var pages=0;
	var count=0;
	var sql ;
	var param ;	
	if(data.cid==''){
		sql='SELECT count(*) ct FROM contents ';
		param = [];
	}else{
		sql='SELECT count(*) ct FROM contents where cid=? ';
		param = [data.cid];
	}
	query(sql,param,function(err,rs,fields){
		//计算总页数
		count=Number(rs[0].ct);
		pages=Math.ceil(count/limit);
		//取值
		page=Math.min(page,pages);
		page=Math.max(page,1);
		//每次偏移量
		var offset= (page-1)*limit;
		var sql ;
		var param ;	
		if(data.cid==''){
			sql='SELECT * FROM contents c LEFT JOIN ( SELECT COUNT(1) ct, cid FROM comments group by cid ) com  on c.id=com.cid order by id desc limit ? offset ?  ';
			param = [limit,offset];
		}else{
			sql='SELECT * FROM contents c LEFT JOIN ( SELECT COUNT(1) ct, cid FROM comments group by cid ) com  on c.id=com.cid where c.cid=? order by id desc limit ? offset ? ';
			param = [data.cid,limit,offset];
		}

		query(sql,param,function(err,rs,fields){
			for(var i = 0; i<rs.length;i++){
				contents.push({id:rs[i].id,
								category:rs[i].name,
								title:rs[i].title,
								author:rs[i].author,
								content:rs[i].content,
								description:rs[i].description,
								addDate:rs[i].mydate,
								views:rs[i].pageViews,
								comments:rs[i].ct
								
				})			
			};

			res.render('index',{
				userInfo :req.userInfo,
				contents:contents,
				categories:data.categories,
				count:count,
				pages:pages,
				page:page,
				limit:limit,
				cid:data.cid,
				myrouter:'/'
			});	
			
		});
	});		
})

//详情页
router.get('/view',function(req,res,next){
	var id = req.query.contentid;
	var sql = 'SELECT * FROM contents where id=?';
	var param = [id];
	var contents={}
	var comments;
	
	query(sql,param,function(err,rs,fields){		
		contents={id:rs[0].id,
							category:rs[0].name,
							title:rs[0].title,
							author:rs[0].author,
							content:rs[0].content,
							description:rs[0].description,
							addDate:rs[0].mydate,
							views:rs[0].pageViews
				}
		contents.views++;
		query('UPDATE contents SET pageViews=? WHERE id=?',[contents.views,id],function(err,rs,fields){});
		res.render('view',{
			userInfo:req.userInfo,
			contents:contents,
			categories:data.categories,
			page:data.page,
			comments:comments
		})		
	})	
})

//评论

module.exports= router;