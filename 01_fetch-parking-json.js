//載入需要的模組，並設定取用名稱
var fetch = require('node-fetch');

// 設定目標網址
var url = 'https://data.tycg.gov.tw/api/v1/rest/datastore/0daad6e6-0632-44f5-bd25-5e1de1e9146f?format=json';

/* fetch(url)
  .then(response => {
    // console.log(response)
    console.log(response.headers.get('Content-Type'));
    var ptime = response.headers.get('Date');
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.url);
    return response.json();
  })
  .then(json => parseJSON2Table(json));  */
  

let startTime, endTime;

//Get the start time
startTime = Date.now();
  
// Perform a http(s) fetch
fetch(url)
  .then((response) => response.json())
  .then((json) => {
    //console.log(JSON.stringify(json));
    parseJSON2Table(json);
  })
  .catch((error) => {
    console.log(error);
  });

//Get the end time
endTime = Date.now();
  
//The difference is how many milliseconds it took to call myFunction()
console.debug('Elapsed time:', ((endTime - startTime)/1000).toFixed(3));

const areaTarget = '中壢區'

// 解析 JSON內容
function parseJSON2Table(jsonObj) {
  var rows = [];
  var data = jsonObj.result.records;
  for (var i = 0; i < data.length; i++) {
    var areaName = data[i]['areaName']
    if (areaName == areaTarget) {
      site = data[i]['parkName']
      addr = data[i]['address']
      total = data[i]['totalSpace']
      left = data[i]['surplusSpace']
      pay = data[i]["payGuide"].split('。')[0]
      lat = data[i]["wgsX"]
      lng = data[i]["wgsY"]
    // ["areaName", "parkName", "totalSpace", "surplusSpace","payGuide", "address]
      var row = [site, addr, total, parseInt(left), lng+","+lat, pay]
      rows.push(row);
    //console.log(row);
    } 
  }
  console.log(rows)
}
