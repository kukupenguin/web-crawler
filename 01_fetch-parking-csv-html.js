//載入需要的模組，並設定取用名稱
var fetch = require("node-fetch");

// 設定目標網址
var url =
  "https://data.tycg.gov.tw/api/v1/rest/datastore/0daad6e6-0632-44f5-bd25-5e1de1e9146f?format=csv";

/* fetch(url)
  .then(response => {
    // console.log(response)
    console.log(response.headers.get('Content-Type'));
    var ptime = response.headers.get('Date');
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.url);
    return response.text();
  })
  .then(data => parseCsv2Table(data));  */

let startTime, endTime;

//Get the start time
startTime = Date.now();

// Perform a http(s) fetch
fetch(url)
  .then((response) => response.text())
  .then((data) => {
    // console.log(data);
    parseCsv2Table(data);
  })
  .catch((error) => {
    console.log(error);
  });

//Get the end time
endTime = Date.now();

//The difference is how many milliseconds it took to call myFunction()
console.debug("Elapsed time:", ((endTime - startTime) / 1000).toFixed(3));

// 設定篩選條件
const areaTarget = "中壢區";
const columns = ["停車場", "地址", "全部車位", "可用車位", "座標", "計費方式"];

// 解析CSV內容
function parseCsv2Table(csvText) {
  var rows = [];
  var lines = csvText.split("\n");
  lines.shift(); // 移除欄位列
  while (typeof lines[0] !== "undefined" && lines[0].length > 0) {
    var line = lines.shift(); // get first data line
    var splits = line.split(","); // 以, 切割字串為陣列
    console.log(splits);
    // [wgsY,wgsX,areaId,address,parkName,areaName,_id,totalSpace,payGuide,parkId,introduction,surplusSpace]
    var areaName = splits[5];
    if (areaName == areaTarget) {
      var coord = splits[0] + "," + splits[1];
      var parkName = splits[4];
      var address = splits[3];
      var totalsp = parseInt(splits[7]);
      var surplus = parseInt(splits[11]);
      var payGuide = splits[8].split("。")[0].replace('"', "");
      // 需要的欄位：[停車場','地址', '全部車位', '可用車位', '座標', '計費方式'];
      var row = [parkName, address, totalsp, surplus, coord, payGuide];
      rows.push(row);
      console.log(row);
    }
  }
  // 按剩餘數量 遞減排序
  rows.sort(function (a, b) {
    return b[3] - a[3];
  });
  // rows 轉換成 table html
  var title = areaTarget + "停車場 車位剩餘數量";
  html = array2dToHtmlTable(rows, title, columns);
  // 開啟網頁
  browserOpen(html);
}

// 轉換 2d 陣列數據成 table
function array2dToHtmlTable(dataRows, titleStr, cols) {
  var styleStr =
    "<style>" +
    "table { border-collapse: collapse; width: 100%;}" +
    "td,th { border: 1px solid #cccccc; padding: 6px; }" +
    "tr:nth-child(odd) { background-color: #e5e5e5; }" +
    "tr:nth-child(even) { background-color: #f9f9f9; }" +
    "th { background-color: black; color: white; }" +
    "</style>";
  var htmlStr =
    '<html>\n<head><meta charset="utf-8">' +
    "<title>" + titleStr + "</title>" + styleStr +
    "</head>\n<body>\n";
  var d = new Date();
  var dStr = d.toString();
  var dSub = dStr.substring(0, dStr.indexOf("GMT"));
  var divStart = '<div style="width:99%; margin: 10px auto;">';
  var header =
    '<h3 style="text-align: center;">' + titleStr + " @ " + dSub + "</h3>";
  // 標題列
  var theads =
    '<tr><th style="text-align: center;">' +
    cols.join("</th><th>") +
    "</th></tr>\n";
  htmlStr += divStart + header + "\n<table>\n<tbody>\n" + theads;
  // 數據列
  dataRows.forEach(function (row) {
    var trStr = "" + "<tr><td>" + row.join("</td><td>") + "</td></tr>";
    htmlStr += trStr + "\n";
  });

  htmlStr += "<div>\n</tbody>\n</table>\n";
  return htmlStr;
  //console.log(tableHtml)
}

// 以瀏覽器開啟 html
function browserOpen(htmlString) {
  // 啟動 local http server
  var http = require("http");
  var server = http.createServer(function (request, response) {
    response.writeHead(200, {
      "Content-Type": "text/html",
    });
    response.write(htmlString);
    response.end();
  });
  server.listen(8082); //設定 在 8082 port

  // 以 browser 開啟 server 首頁
  var launcher = require("launch-browser");
  // open browser at an URL
  // use preferred browsers (in priority order): chrome, firefox, safari
  // if no proferred browsers found, open any available browser

  launcher(
    "http://localhost:8082",
    {
      browser: ["chrome", "firefox", "safari"],
    },
    function (e, browser) {
      if (e) return console.log(e);
      // 關閉 browser 時, 顯示關閉訊息，並同時關閉 server
      browser.on("stop", function (code) {
        console.log("Browser closed with exit code:", code);
        server.close(); // Close the server
      });
    }
  );
}
