/**
    因为保存图片的字符串查找， 以及div的样式class,id ,data-url不好操作
*/
const fs = require("fs");
const https = require("https");
const cfg = JSON.parse( fs.readFileSync("config.cfg") );
const reg = /<img[^<]+>/gi;
const cheerio = require("cheerio");
const async = require("async");
const common = require("./common.js");

function getImage(url, fileDir) {
    https.get(url, function(res){
        var imgData = "";
        res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
        res.on("data", function(chunk){
            imgData+=chunk;
        });
        res.on("end", function(){
            fs.writeFile(fileDir, imgData, "binary", function(err){
                if(err){
                    console.log("download fail");
                }
                console.log("download success");
            });
        });
    });   
}

//图片字符串的处理
function trim(htmlString) {
    //启动异步线程， 避免多次连接导致服务器拒绝连接;
    let taskDetailList = [];
    if(typeof htmlString!=="string") return;
    var $ = cheerio.load(htmlString);
    var imgs = $("img");
    for(var i=0; i<(imgs&&imgs.length) ;i++) {
        let imgUrl = imgs.eq(i).attr("data-original");
        if(!imgUrl)continue;
        let localUrl = imgUrl.match(/\/([^\/]*)$/)[1];
        //var imgId = uuid();
        loacalUrl = `${cfg.imgDir}${localUrl}`;
        taskDetailList.push((cb) => {
            getImage(imgUrl, loacalUrl);
            common.sleep(1000);
        });
    }
    async.parallelLimit(taskDetailList, 1 , ()=> {
        console.log("img downloading");
    });
    console.log($.html());
    return $.html();
}
exports.trim = trim