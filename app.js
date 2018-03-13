var express= require('express');
//加载模板
var swig = require('swig');

//加载body-parser，用来处理post提交过来的数据
var bodyParser = require('body-parser');
//加载富文本编辑器
var ueditor = require('ueditor');
var mysql = require('mysql');

//加载cookies模块
var Cookies = require('cookies');

// 创建APP应用
var app = express();

/*静态文件托管
	当用户访问的url以/public开始，那么直接返回对应的__dirname+'/public'下的文件*/
app.use('/public',express.static(__dirname+'/public'));
//配置模板（3步）
/*1.定义当前应用所使用的模板引擎
	第一个参数是模板引擎的名称，也是文件后缀名
	第二个参数是用于解析处理模板内容的方法*/
app.engine('html',swig.renderFile);

/*2.设置模板文件存放的目录
	第一个参数必须是views
	第二个参数是目录*/
app.set('views','./views');

/*3.注册所使用的模板引擎
	第一个参数必须是view engine 
	第二个参数与第一步中的第一个参数保持一致*/
app.set('view engine','html');

swig.setDefaults({cache:false});//在开发中需要取消模板缓存，以随时查看页面更改内容而不需重启服务

//bodyparser设置
app.use(bodyParser.urlencoded({extended:true}));

//设置cookie
app.use(function(req,res,next){
	req.cookies= new Cookies(req,res);
	//解析登录用户的cookie信息
	req.userInfo = {};
	if(req.cookies.get('userInfo')){
		try{
			req.userInfo= JSON.parse(req.cookies.get('userInfo'));
			//console.log(req.userInfo)	
		}catch(e){ }
	}
		next();
});

app.use("/ueditor/ue",  function(req, res, next) {

  // ueditor 客户发起上传图片请求

  if(req.query.action === 'uploadimage'){

    // 这里你可以获得上传图片的信息
    var foo = req.ueditor;
    console.log(foo.filename); // exp.png
    console.log(foo.encoding); // 7bit
    console.log(foo.mimetype); // image/png

    // 下面填写你要把图片保存到的路径 （ 以 path.join(__dirname, 'public') 作为根路径）
    var img_url = path.join(__dirname, 'public/uploadimage');
    res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
  }
  //  客户端发起图片列表请求
  else if (req.query.action === 'listimage'){
    var dir_url = '/public/uploadimage'; // 要展示给客户端的文件夹路径
    res.ue_list(dir_url) // 客户端会列出 dir_url 目录下的所有图片
  }
  // 客户端发起其它请求
  else {

    res.setHeader('Content-Type', 'application/json');
    // 这里填写 ueditor.config.json 这个文件的路径
    res.redirect('/ueditor/ueditor.config.json')
	}
});

//根据不同功能划分模块（后台、API、前台）
app.use('/admin',require('./routers/admin'))
app.use('/api',require('./routers/api'))
app.use('/',require('./routers/main'))


// 监听APP请求
app.listen(3000);

console.log('runing~~')