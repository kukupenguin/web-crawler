// 載入需要的模組，並設定取用名稱
const fetch = require("node-fetch");
const HTMLParser = require("node-html-parser");

// 設定目標網址
const url = "https://udn.com/news/index";

let root;

// 抓取 url 網頁
fetch(url)
  .then(res => res.text())
  .then(body => (root = HTMLParser.parse(body)))
  .then(() => extractData(root));

// 解析網頁，取得行動版重大新聞標題與網址
function extractData(root) {
  var elem, title, thisUrl ;
  var news = '';
  var nodes = root.querySelectorAll('div.story-list__holder .story-list__text');
  
  for (var i = 0; i < nodes.length; i++) {
    elem = nodes[i].querySelector('h3 a');
    // console.log(elem);
    title = elem.rawText.trim();
    thisUrl = elem.getAttribute('href');
    
    if (thisUrl.includes("news") ) {
      news += title + "\n" + thisUrl + "\n\n";
    }
  };
  console.log(news);
  //console.log( JSON.stringify(objs));

}
