const common = require("./common.js");
const fs = require("fs");
const cheerio = require("cheerio");
const cfg = JSON.parse( fs.readFileSync("config.cfg") );
const async = require("async");
const saveImage = require("./saveImage.js");

/**
*专门用来fetch知乎的问题列表
*
**/
function getHTML(word, fn) {
	//打开页面并开始搜索， 并获取第一个页面的所有列表
	common.httpGet(cfg.search, { q : word }, (htmlResponse)=>{
		//首页显示的回答条数非常有限， 需要模拟ajax动态加载数据
		let $ = cheerio.load(htmlResponse);
		//console.log($.html())
		//持续添加html
		//htmlResponse = dataAppend(htmlResponse, { q : word }, 10, fn);
		fn($.html());
	})
}

//数据处理HTML 2 JSON
function parseHTML2JSON(htmlString, summaryObj, key) {
	let $ = cheerio.load(htmlString);
	let eCon = $(".contents");
	let eItem = eCon.find(".item");
	summaryObj[key] = summaryObj[key] || [];
	let summaryList = summaryObj[key] ;
	eItem.each(function(i, e) {
		let urlId = $(this).find(".js-title-link").attr("href");
		console.log(urlId);
		summaryList.push({
			//标题
			"title":$(this).find(".title").text(),
			//作者
			"author":$(this).find(".author").text(),
			//入口点， 包含题目ID
			"urlID":urlId,
			//"id":urlId.match(regIdReg)[0],
			//已被赞的次数
			"vote":$(this).find(".zm-item-vote-count").text(),
			//内容大概
			"summary":$(this).find(".summary").text()
		});
	});
}

//这个函数专门用来走ajax的回调的， 而且是循环调用自己， 直到到知乎那边无搜索结果;
function dataAppend(htmlResponse, jsonArg , pageIndex, fn) {
	jsonArg.offset = pageIndex;
	//构造成的API：https://www.zhihu.com/r/search?q=javascript+js+html+baba+html5+xx&type=content&offset=10
	common.httpGet(cfg.ajaxSearch, jsonArg, (_htmlResponse) => {
		let $ = cheerio.load(htmlResponse);
		let ajaxData = JSON.parse(_htmlResponse).htmls;
		//持续添加数据
		if(ajaxData.length>0) {
			$(".contents").append(ajaxData);
			//索引递增
			pageIndex += 10;
			//如果有获取到item ， 那就调用自己;
			dataAppend($.html(), jsonArg, pageIndex, fn);
		}else{
			fn( $.html() );
		}
	});
}

let taskDetailList = [];
//DOM数据抓取
function fetchDetail(summaryObj, dbCallback) {
	//循环所有关键字
	for(let key in summaryObj) {
		//循环关键字下的所有问题列表
		let summaryList = summaryObj[key];
		for(let i=0; i<summaryList.length; i++) {
		//for(let i=0; i<1; i++) {
			let item = summaryList[i];
			//获取详细信息
			taskDetailList.push((cb) => {
				if(item.urlID.search("http")!=-1) {
					console.log(`找个一个专栏,地址是 ${item.urlID}`);
					cb();
					return;
				}
				//console.log(item);
				common.httpGet( cfg.index+item.urlID, {}, (htmlString) => {
					//conosle.log("dd");
					let $ = cheerio.load(htmlString);
					//console.log(htmlString);
					//console.log(htmlString);
					let detail = saveImage.trim($("#zh-question-detail").html());
					detail = saveImage.trim(detail);
					//let detail = $("#zh-question-detail").text();
					var questionDetail = {
							"answer" : $("#zh-question-answer-num").text(),
							"title" : $(".zm-item-title").text().replace(/\n+/ig,""),
							"qustionDetail":detail,
							"topic" : $(".zm-tag-editor").text().match(/[^\n]+/ig),
							"answers" : [
						]
					};
					let eContent = $("#zh-question-answer-wrap");
					let itemAnswers = eContent.find(".zm-item-answer");
					//获取用户的评论内容;

					for(var j=0 ; j<itemAnswers.length; j++) {
						let itemAnswer = $(itemAnswers[j]);
						let content = itemAnswer.find(".zm-item-rich-text").html();
						content = saveImage.trim(content);
						//let content = itemAnswer.find(".zm-item-rich-text").text();
						questionDetail.answers.push({
							voteUp : itemAnswer.find(".up .count").text(),
							answerAuthorInfo : itemAnswer.find(".author-link").text(),
							userHref : itemAnswer.find(".author-link").attr("href"),
							badgeSummary : itemAnswer.find(".badge-summary").text(),
							data : itemAnswer.find(".answer-date-link").text(),
							comments : itemAnswers.find(".addcomment").html(),
							content : content,
						})
					}
					dbCallback(key, questionDetail);
					cb();
				});
			});
		};
	}

	async.parallelLimit(taskDetailList, 1 , ()=> {
		console.log("2 级评论加载完毕");
	});
}

exports.parseHTML2JSON = parseHTML2JSON
exports.getHTML = getHTML
exports.fetchDetail = fetchDetail