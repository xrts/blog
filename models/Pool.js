/*
var mysql=require('mysql');

function OptPool(){
	this.flag=true;
	this.pool=mysql.createPool({
		host:'localhost',
		user:'root',
		password:'',
		database:'blog',
		port:'3306'
	});
	this.getPool=function(){
		if(this.flag){
			this.pool.on('connection',function(connection){
				connection.query('set session auto_increment_increment=1');
				this.flag=false;
			});
		}
		return this.pool;
	}
	
}

module.exports=OptPool;*/


var mysql=require("mysql");
var pool = mysql.createPool({
    waitForConnections:true,
    connectionLimit:2,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'blog',
    port: '3306'
});

var query=function(sql,param,callback){
   
/*    if (typeof param === 'function') {
        console.log('sql:'+sql );
    } else if (param !== undefined) {
        console.log('sql:'+sql +'\nparam:'+ param);
    }
*/
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,null,null);
        }else{
             conn.query(sql,param,function(qerr,vals,fields){
                //事件驱动回调
                callback(qerr,vals,fields);

              
            });
              //释放连接
              conn.release();
        }
    });
};


module.exports=query;