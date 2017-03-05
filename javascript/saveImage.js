const fs = require("fs");
const https = require("https");
const cfg = JSON.parse( fs.readFileSync("config.cfg") );
const reg = /<img[^<]+>/gi;
const cheerio = require("cheerio");
const async = require("async");

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
                    console.log("down fail");
                }
                console.log("down success");
            });
        });
    });   
}
function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";
  
    var uuid = s.join("");
    return uuid;
}

//图片字符串的处理
function trim(htmlString) {
    //启动异步线程， 避免多次连接导致服务器拒绝连接;
    let taskDetailList = [];
    if(typeof htmlString!=="string") return;
    //去除所有div的样式
    //htmlString = htmlString.replace(/<div[^>]*>([.\n\r]*)<\/div>/gi, function($0 ,$1) {return $1});
    //console.log(htmlString);
    var imgs = htmlString.match(/<img[^<]+>/gi);
    for(var i=0; i<(imgs&&imgs.length) ;i++) {
        let img = imgs[i];
        var $ = cheerio.load(img);
        var imgUrl = $("img").attr("data-actualsrc");
        var imgId = uuid();
        var loacalUrl = `${cfg.imgDir}${imgId}.png`;
        taskDetailList.push((cb) => {
            getImage(imgUrl, loacalUrl);
        });
        htmlString = htmlString.replace($.html(), `<img src="${loacalUrl}">`);
    }
    async.parallelLimit(taskDetailList, 1 , ()=> {
        console.log("img downloading");
    });
    //console.log(htmlString);
    return htmlString;
}
exports.trim = trim