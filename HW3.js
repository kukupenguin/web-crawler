// > 該作業基本及進階知識

// > for loop (for-of / for-in)
// > https://blog.typeart.cc/JavaScript%E4%B8%ADfor%20of%E5%92%8Cfor%20in%E7%9A%84%E5%B7%AE%E5%88%A5/

// > ES6 var/let/const 差異
// > https://medium.com/@totoroLiu/javascript-var-let-const-%E5%B7%AE%E7%95%B0-e3d930521230

// > js promise => then/catch/ansyc/await
// > https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide/Using_promises

// > Js Date Objects：
// > https://www.w3schools.com/js/js_dates.asp
// > https://www.w3schools.com/js/js_date_formats.asp
// > https://www.w3schools.com/js/js_date_methods.asp

// > Js String 處理：
// > https://codertw.com/%E5%89%8D%E7%AB%AF%E9%96%8B%E7%99%BC/266378/

// > Update/Add Json Object ( JS )
// > https://stackoverflow.com/questions/4071499/dynamically-add-variable-name-value-pairs-to-json-object

// > 載入需要的模組，並設定取用名稱
const fetch = require( 'node-fetch' );
const HTMLParser = require( 'node-html-parser' );
const fs = require( 'fs' );

const startURL = 'https://www.setn.com/ViewAll.aspx?p=';

// > 初始化各值
let curPage = '1';
const outputJson = [];
let targetDate;
const preDayNum = 1;
const stuID = '1081655HW3';

// > 程式起始點
Process_Start();



function Process_Start() {
	if ( preDayNum < 16 ) {
		// > 偵測今日時間，並format成 MM/dd
		const today = new Date();

		// > 原回傳月份為 0-11，所以需+1
		// > 由於時間直接運算會回得時間數字，再將這數字轉成UTC在取日期
		const preDayUTC = new Date( today.setDate( today.getDate() - preDayNum ) );
		const preDate = preDayUTC.getDate();
		const preMonth = preDayUTC.getMonth() + 1;
		targetDate = Process_DateFormat( preMonth ) + '/' + Process_DateFormat( preDate );

		// > 進入爬蟲主流程
		Get_WebElements( startURL + curPage );
	} else {
		console.log( '目前只可調整前 15 天' )
	}
}

// > M / D 補0處理
function Process_DateFormat( value ) {
	if ( value.toString().length == 1 ) {
		return '0' + value.toString();
	} else {
		return value.toString();
	}
}

function Get_WebElements( urlPath ) {
	fetch( urlPath )
		.then( ( res ) => res.text() )
		// > 如爬取過程錯誤，將會拋出
		.catch( ( e ) => {
			console.log( 'Get_WebElements Error:' + e );
		} )
		.then( ( body ) => {
			if ( !Process_ExtractWeb( HTMLParser.parse( body ) ) ) {
				// > 如果未符合條件，將繼續往後爬取
				curPage = ( Number( curPage ) + 1 ).toString();
				Get_WebElements( startURL + curPage );
			} else {
				// > 拋出爬取完成，做JSON最後整理與輸出
				Process_BuildJspn();
			}
		} )

		// > 如爬取過程錯誤，將會拋出
		.catch( ( e ) => {
			console.log( 'Get_WebElements Error:' + e );
		} );
}

function Process_ExtractWeb( web ) {
	let articles, tags, dates, url, isDone;

	// > 取得 tags/articles/dates doms
	tags = web.querySelectorAll( 'div.NewsList div.newslabel-tab a' );
	articles = web.querySelectorAll( 'div.NewsList h3.view-li-title a' );
	dates = web.querySelectorAll( 'div.NewsList time' );

	// > 由於 date,tag,article 都單一對應，所以共用迴圈即可
	for ( let i = 0; i < tags.length; i++ ) {
		if ( dates[ i ].rawText.substr( 0, 5 ) == targetDate ) {
			// > 建立第一層
			if ( outputJson.length == 0 ) {
				outputJson.push( {
					tag: tags[ i ].rawText.trim(),
					count: 0,
					articles: [],
				} );
			} else {
				// > 如 tag 已存在 outputJson 中，則不重複 push
				let isTagExist = false;
				for ( const data of outputJson ) {
					if ( data.tag == tags[ i ].rawText.trim() ) {
						isTagExist = true;
					}
				}
				if ( !isTagExist ) {
					outputJson.push( {
						tag: tags[ i ].rawText.trim(),
						count: 0,
						articles: [],
					} );
				}
			}

			// > 對於有些tag所附上的url做二次處理
			url = articles[ i ].getAttribute( 'href' );
			if ( url.indexOf( 'http' ) == -1 ) {
				url = 'https://www.setn.com' + url;
			}

			// > 建立第二層
			for ( const data of outputJson ) {
				if ( data.tag == tags[ i ].rawText.trim() ) {
					// > print 出 所有符合條件的文章
					console.log( dates[ i ].rawText, tags[ i ].rawText, articles[ i ].rawText, url );

					// > push article to outputJson.articles array
					data.articles.push( {
						topic: articles[ i ].rawText.trim(),
						dates: dates[ i ].rawText.trim(),
						url: url.trim(),
					} );
				}
			}
			isDone = false;
		}
		// > 當爬取文章的日期已經 < 目標日期，則拋出已完成且離開迴圈
		else {
			// > 跨年且小日
			if (
				Number( dates[ i ].rawText.substr( 0, 2 ) ) - Number( targetDate.substr( 0, 2 ) ) == -11 &&
				Number( dates[ i ].rawText.substr( 3, 2 ) ) - Number( targetDate.substr( 3, 2 ) ) < 0
			) {
				isDone = true;
				break;
			}
			// > 小月且小日
			else if (
				Number( dates[ i ].rawText.substr( 0, 2 ) ) - Number( targetDate.substr( 0, 2 ) ) < 0 &&
				Number( dates[ i ].rawText.substr( 3, 2 ) ) - Number( targetDate.substr( 3, 2 ) ) < 0
			) {
				isDone = true;
				break;
			}
			// > 同月且小日
			else if (
				Number( dates[ i ].rawText.substr( 0, 2 ) ) - Number( targetDate.substr( 0, 2 ) ) == 0 &&
				Number( dates[ i ].rawText.substr( 3, 2 ) ) - Number( targetDate.substr( 3, 2 ) ) < 0
			) {
				isDone = true;
				break;
			}
		}
	}
	return isDone;
}

function Process_BuildJspn() {
	// > 計算各標籤的文章總數
	for ( const data of outputJson ) {
		data.count = data.articles.length;
	}

	// >儲存json;
	fs.writeFile( stuID + '.json', JSON.stringify( outputJson ), function ( err ) {
		if ( err ) throw err;
		console.log( 'Successfully saved to ' + stuID + '.json' );
	} );
}