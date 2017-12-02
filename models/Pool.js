
var mysql=require("mysql");
var pool = mysql.createPool({
    waitForConnections:true,
    connectionLimit:2,
    host: 'localhost',
    user: 'root',
    password: 'chengji',
    database: 'blog',
    port: '3306'
});

var query=function(sql,param,callback){
   

    pool.getConnection(function(err,conn){
        if(err){
            console.log(err);
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