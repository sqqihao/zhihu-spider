/**
*
*
* 0: 模拟登陆知乎， 获取cookie， 分析登录API
* 1: 检索关键字 ：统一配置 config.cfg
* 2: 结果页面 ajax动态加载 分析动态加载API
* 3: 获取所有的知乎问答列表 问题列表List
* 4: 异步， 并发抓取的线程 ， 使用node的多线程库？同步 ? 打开界面
* 5: 根据节点抓取数据， DOM操作的库cheerio
* 6: 统一配置：配置需要抓取节点的class或者id
* 7: 数据的保存， mongodb， sqllite， 本地的JSON
* 8: mongose用来保存数据
*
*
* 数据结构
* id(递增)
*	问题ID
* 	问题内容
*       作者
*		内容
*		时间
*		和本标题相关的关键字
*{
*	//标题
*	"title": String,
*	//作者
*	"author": String,
*	//入口点， 包含题目ID
*	"urlID": String,
*	//已被赞的次数
*	"vote": Number,
*	//内容大概
*	"summary": String
*}
*
*
*
*	回答内容
*		标题
*		作者
*		内容
*		时间
*		被赞
*		被踩
*		优秀回答者
*
*{
*	//回答这个问题的人数
*	"answer" : String,
*	//内容的标题
*	"title" : String,
*	//标题内容的标签
*	"topic" : String,
*	//回答者的详细数据
*	"answers" : [
*		//被赞的次数
*		voteUp : String,
*		//用户信息
*		answerAuthorInfo : String,
*		//用户个人信息的链接
*		userHref : String,
*		//用户的胸章
*		badgeSummary : String,
*		//用户发布的信息
*		data : String,
*		//该回答被回答的次数
*		comments : String,
*		//用户的回答内容
*		content : String,
*	]
*};
*
* 环境：mongodb
* 下载mongodb ， 解压，并打开解压文件的bin目录下， 执行：sudo ./mongod --dbpath "/Volumes/work/Program Files/mongodb-osx-x86_64-3.4.2/bin/data/db"
*
*	问题：
*	1:存在三级列表， 目前还未实现
*	2:图片附件还未抓取
*
*/
const https = require("https");
const fs = require("fs");
const cheerio = require("cheerio");
const common = require("./javascript/common.js");
const requestHTML = require("./javascript/requestHTML.js");
const async = require("async");
var mongo = require('mongoskin');

console.log("读取配置文件");
const cfg = JSON.parse( fs.readFileSync("config.cfg") );
var words = fs.readFileSync("words.txt",{encoding:"utf8"});
console.warn(cfg);
console.log("读取配置文件成功");

console.log("连接数据库");
var db = mongo.db(cfg.monooseUrl, {native_parser:true});
console.log("连接数据库成功");


//处理需要搜索的文本到数组
var aWords = JSON.parse(words);
var regIdReg = new RegExp(cfg.idReg);

//把数据导入数据库
function saveToDb(key, dataItem) {
	db.collection(key).insert(dataItem, function(err, result) {
		if(err) {
			console.log(err);
		}
		console.log("数据库保存完毕");
	    console.log(result.result);
	});
	common.sleep(100);
}


//当ctrl+c的时候退出， 并关闭数据库链接;
process.on('SIGINT', function() {
    db.close(function(){
        console.log('database has closed');
    })
})

function main() {

	//异步的任务列表
	let taskList = [];

	//一级列表内容保存对象
	let summaryObj = {};

	//利用async库, 循环往任务列表中添加异步任务函数;
	for(var i=0; i<aWords.length; i++) {
		let word = aWords[i];
		db.bind(word);
		taskList.push((cb) => {
			//根据关键字fetch ， HTML页面
			requestHTML.getHTML(word, (htmlString) => {
				//把题目转化为JSON类型的数据，并放到summaryList这个数组中国年
				requestHTML.parseHTML2JSON(htmlString, summaryObj, word);
				common.sleep(1000);
				cb();
			});
		});
	}

	async.parallelLimit(taskList, 1, () => {
		//当对应的关键字的列表全部拉取下来以后， 获取详细数据
		console.log("一级列表加载完毕");
		//加载主要内容一级详细评论
		requestHTML.fetchDetail(summaryObj, saveToDb); 
	});
}

//开始脚本
main();

