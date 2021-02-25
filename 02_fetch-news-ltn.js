// 載入需要的模組，並設定取用名稱
const fetch = require("node-fetch");
const HTMLParser = require("node-html-parser");
const fs = require("fs");

// 設定目標網址
const url = "https://www.ltn.com.tw/";

//設定全域變數
let root;

// 抓取 url 網頁
fetch(url)
  .then(res => res.text())
  .then(body => (root = HTMLParser.parse(body)))
  .then(() => extractData(root));

// 解析網頁，取得滾動頭條標題與網址
function extractData(root) {
  var elem, title;
  var objs = [];
  var nodes = root.querySelectorAll('div.swiper-slide a');
  
  for (i = 0; i < nodes.length; i++) {
    elem = nodes[i];
    title = elem.rawText.trim();        // 取得元素文字
    thisUrl = elem.getAttribute('href') // 取的元素href值
    // console.log(title)
    // console.log(thisUrl)
    
    // 篩選需要的網址, 以JSON物件儲存
    if (thisUrl && thisUrl.includes("news") ) {
      objs.push({ "標題": title, "URL": thisUrl }); 
    } 
  }
  console.log(objs);
  //console.log( JSON.stringify(objs) );

  // 儲存json
  fs.writeFile("ltn-news.json", JSON.stringify(objs), function(err) {
    if (err) throw err;
    console.log("successfully saved file");
  });
}
