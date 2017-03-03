const https = require("https");
/**
* @param
* url  String
* arg Object
* callback Function
*/
function httpGet( url, arg, callback ) {
	let str = "";
	for(let p in arg) {
		str += `&${p}=${arg[p]}`;
	};
	console.log(url);
	console.log(str);
	console.log(`正在请求地址: ${url+str}`);
	try{
		https.get(url+str, (res) => {
			let raw = "";
			res.on("data", (chunk) => {
				raw += chunk;
			});
			res.on("end", () => {
				callback( raw );
			});
			res.on("error", (err)=> {
				console.log(err);
			})
		});
	}catch(e) {
		console.log(e);
	}
}
function sleep(sleepTime) {
    for(var start = +new Date; +new Date - start <= sleepTime; ) {
    } 
}

exports.sleep = sleep;
exports.httpGet = httpGet;