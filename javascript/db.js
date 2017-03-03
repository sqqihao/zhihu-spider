const fs = require("fs");

console.log("读取配置文件");
const cfg = JSON.parse( fs.readFileSync("config.cfg") );
var words = fs.readFileSync("words.txt",{encoding:"utf8"});
console.warn(cfg);
console.log("读取配置文件成功");

var mongo = require('mongoskin');
console.log("连接数据库");
var db = mongo.db(cfg.monooseUrl, {native_parser:true});
db.bind('zhihuDb');
console.log("连接数据库成功");

db.zhihuDb.find().toArray(function(err, items) {
	for(let i=0; i<items.length; i++) {
		console.log(items[i]);
	}
});

//当ctrl+c的时候退出， 并关闭数据库链接;
process.on('SIGINT', function() {
    db.close(function(){
        console.log('database has closed');
    })
})