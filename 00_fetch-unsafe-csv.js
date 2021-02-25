//載入需要的模組，並設定取用名稱
var fetch = require('node-fetch');

// 設定目標網址
var url = 'http://data.tycg.gov.tw/api/v1/rest/datastore/62551055-e06f-4529-91b3-7ae74b601c28?format=csv';

/* fetch(url)
  .then(function(response) {
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
  
// Perform an http(s) fetch.
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
console.debug('Elapsed time:', ((endTime - startTime)/1000).toFixed(3));

// 處理 CSV 內容
function parseCsv2Table(csvText) {
  var rows = []; // 儲存解譯結果，一列csv = 一個 row
  var lines = csvText.split("\n");
  lines.shift(); // 移除欄位列(第一列)
  // 解譯資料列，直到內容為空
  while( typeof lines[0] !== "undefined" && lines[0].length > 0) {
    var line = lines.shift(); // get first data line
    var splitArr = line.split(','); // 以, 切割字串為陣列
    var row = [];
    // 全部欄位：[檢查結果,場所名稱,檢查日期,_id,場所地點"]
    // 取得部分欄位
    row = [splitArr[0], splitArr[2], splitArr[1], splitArr[4]]
    rows.push(row);
    console.log(row); 
  }
  // console.log(rows)
}
