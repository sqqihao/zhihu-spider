#安装过程  
1:安装mongodb， 并启动mongodb， 默认端口， 没有用户名和密码验证;  
2:npm install 安装 mongoskin, cheerio, mongose, async等相关依赖;  
3:npm start 开始抓取数据;  
4:使用可视化工具查看数据
5:抓取的图片会保存在本地项目的images目录下

#关键字添加
打开当前项目下的words.txt， 关键字包围在大括号内步，并通过逗号分开， 实例如下:
```
["javascript”, “html”, “css“]
```    

#图片
图片会被下载到脚本目录的images下面， 图片名字和知乎官方名字一模一样

#操作
按ctrl+c退出程序   

#注意
长时间的抓取，会导致客户端IP被屏蔽， 服务器就不会返回搜索结果

#查看数据
也可以使用其他可视化的工具查看mongose数据

#数据结构
```
*
* 数据结构
* id(递增)
*    问题ID
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
```

#知乎的一些API， 记录
```
var data = {
    "captcha": captcha,
    "password": password,
    "_xsrf": _xsrf,
    "email":account
}
var _xsrf = $("input[name=_xsrf]");
var headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate",
    "Host": "www.zhihu.com",
    "Upgrade-Insecure-Requests": "1",
}
https://www.zhihu.com/api/v4/answers/31130717/comments?include=data%5B*%5D.author%2Ccollapsed%2Creply_to_author%2Cdisliked%2Ccontent%2Cvoting%2Cvote_count%2Cis_parent_author%2Cis_author&order=normal&limit=10&status=open&offset=0

https://www.zhihu.com/api/v4/answers/31130717/comments?include=data%5B*%5D.author%2Ccollapsed%2Creply_to_author%2Cdisliked%2Ccontent%2Cvoting%2Cvote_count%2Cis_parent_author%2Cis_author&order=normal&limit=10&status=open&offset=0

https://www.zhihu.com/api/v4/answers/31130717/comments?include=data%5B*%5D.author%2Ccollapsed%2Creply_to_author%2Cdisliked%2Ccontent%2Cvoting%2Cvote_count%2Cis_parent_author%2Cis_author&order=normal&limit=10&status=open&offset=0

```