var Pool = require('../models/Pool');
var pool = new Pool();
var mypool = pool.getPool();


function GetUsers(){
	
	this.getusers=function(){
		mypool.getConnection(function(err,conn){
		var sql = 'SELECT * FROM users ';	
		var users=[];	
		conn.query(sql,function(err,rs){			
			for(var i = 0; i<rs.length;i++){
				users.push({id:rs[i].id,
							username:rs[i].username,
							pwd:rs[i].pwd,
							isAdmin:Boolean(rs[i].isAdmin)
							})			
			}		
		});		
		conn.release();
		})
	}
}

module.exports=GetUsers;
