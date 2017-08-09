const commonUtil = require('./util/common')
const _ = require('lodash')
const request = require('request')

const TelegramBot = require('node-telegram-bot-api');
//
if(!process.env.TELEGRAM_API_TOKEN){
    console.log("Telegram Bot Token Missing")
    process.exit(1)
}
//
const token = process.env.TELEGRAM_API_TOKEN
// const token = '414024453:AAHQg3QrU-_WG77FHUyB9WIuTYKJXl_l10E' //production
// const token = '433274725:AAEb_5Mv6r23atBuYG42iib0Ma7011mx4e8' //dev


Object.defineProperty(Array.prototype, 'chunk_inefficient', {
    value: function(chunkSize) {
        var array=this;
        return [].concat.apply([],
            array.map(function(elem,i) {
                return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
            })
        );
    }
});



// '433274725:AAEb_5Mv6r23atBuYG42iib0Ma7011mx4e8' //dev
// '414024453:AAHQg3QrU-_WG77FHUyB9WIuTYKJXl_l10E' //production




//
// let App = {
//     alarmList: [],
//     koreanPremium:{
//         btc:0.0,
//         eth:0.0
//     },
//     getAlarmList: () => this.alarmList
// }
//
// let Alarm = {
//     owner:"",
//     setTime:""
// }

const Predicate = function(type, comparator ,value){
    if(!(this instanceof Predicate)) return new Alarm(type, comparator, value)

    this.type = type
    this.comparator = comparator
    this.value = value

    this.check = function(){
        if(this.type === "KrwPremium"){
            calcKoreanPremium()
            let lastEthRate = last_koreanPremium.eth
            if(this.comparator === "Greater"){
                if(this.value < lastEthRate)
                    return true
            }
            else if (this.comparator === "Less"){
                if(lastEthRate < this.value){
                    return true
                }
            }
            else if (this.comparator === "Equal"){
                if(lastEthRate === this.value){
                    return true
                }
            } else return false

        } else if(this.type === "Market"){

        }
    }
}

const Alarm = function(owner, chatId, predicate, freq){
    if(!(this instanceof Alarm)) return new Alarm(owner, chatId, predicate, freq)

    this.owner = owner;
    this.chatId = chatId;
    this.predicate = predicate
    this.freq = freq

    this.pop = function(){
        if(this.predicate.type === "KrwPremium"){
            bot.sendMessage(this.chatId, "<b>ALARM KOREAN PREMIUM!!! by " +this.owner + "</b>\r\n" +
                "🔥🔥🔥🔥🔥🔥🔥\r\n" + calcKoreanPremium() + "\r\n" +
                "🔥🔥🔥🔥🔥🔥🔥", {parse_mode : "HTML"})

        }
    }
}

const Exchange = function(name, markets, apis){
    if(!(this instanceof Exchange)) return new Exchange(name, markets, apis)
}
let alarms =[]

// alarms.push(new Alarm("test", "test2"))


setInterval(() => {
    _.each(alarms, (alarm,idx) => {
        // console.log(idx)
        if(alarm.predicate.check()){
            alarm.pop()
            // console.log(alarm.predicate.check())
            alarms.splice(idx,1)
        }
    })
}, 10000)

let global_market = {

}
let bittrex_ticker = {

}

let korbit_ticker = {
    btc:{
    },
    eth:{
    },
    etc:{
    },
    xrp:{

    },
    bch:{
    }
}
let poloniex_ticker = {
}


let current_usdt_btc = 0.0;
let current_usdt_eth = 0.0;
let prev_usdt_btc = 0.0;
let prev_usdt_eth = 0.0;

let bithumb_ticker = {

}
let bittrex_markets = [];



function run_coinmarketcap_global_data() {
    request('https://api.coinmarketcap.com/v1/global/', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(JSON.parse(body))
            global_market = JSON.parse(body)


        }
    })
}



function run_bittrex_ticker() {
    request('https://bittrex.com/api/v1.1/public/getmarketsummaries', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(JSON.parse(body))
            bittrex_ticker = JSON.parse(body).result
            current_usdt_btc = _.find(bittrex_ticker, {'MarketName':'USDT-BTC'}).Last
            current_usdt_eth = _.find(bittrex_ticker, {'MarketName':'USDT-ETH'}).Last
            // console.log(bittrex_ticker.result) // Print the google web page.
            prev_usdt_btc = _.find(bittrex_ticker, {'MarketName':'USDT-BTC'}).PrevDay
            prev_usdt_eth = _.find(bittrex_ticker, {'MarketName':'USDT-ETH'}).PrevDay

        }
    })
}

function run_bittrex_markets() {
    request('https://bittrex.com/api/v1.1/public/getmarkets', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(JSON.parse(body))
            bittrex_markets = JSON.parse(body).result


        }
    })
}

run_bittrex_markets()
run_bittrex_ticker()
setInterval(run_bittrex_ticker, 5000)
setInterval(run_bittrex_markets, 60000)



function run_poloniex_ticker() {
    request('https://poloniex.com/public?command=returnTicker', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let data = JSON.parse(body)
            poloniex_ticker = data
            // console.log(poloniex_ticker)

        }
    })
}

run_poloniex_ticker()
setInterval(run_poloniex_ticker, 5000)


run_coinmarketcap_global_data()
setInterval(run_coinmarketcap_global_data, 10000)

let usd = 0;

function getKWRUSDRate(){
    request('http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%3D%22USDKRW%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
        function(err, response, body){
            if (!err && response.statusCode == 200) {
                // console.log(JSON.parse(body))
                let data = JSON.parse(body)
                // console.log(bittrex_ticker.result) // Print the google web page.
                usd = parseFloat(data['query']['results']['rate']['Rate']);
                console.log(usd);

            }
        })
}

getKWRUSDRate()
setInterval(getKWRUSDRate, 5000)



// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});


function korbit_ticker_xrp() {
    request('https://api.korbit.co.kr/v1/ticker?currency_pair=xrp_krw', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body) // Print the google web page.
            korbit_ticker.xrp = JSON.parse(body)
        }
    })
}


function korbit_ticker_btc() {
    request('https://api.korbit.co.kr/v1/ticker?currency_pair=btc_krw', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body) // Print the google web page.
            korbit_ticker.btc = JSON.parse(body)
        }
    })
}

function korbit_ticker_eth() {
    request('https://api.korbit.co.kr/v1/ticker?currency_pair=eth_krw', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body) // Print the google web page.
            korbit_ticker.eth = JSON.parse(body)

        }
    })
}

function korbit_ticker_etc() {
    request('https://api.korbit.co.kr/v1/ticker?currency_pair=etc_krw', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body) // Print the google web page.
            korbit_ticker.etc = JSON.parse(body)

        }
    })
}

function korbit_ticker_bch() {
    request('https://api.korbit.co.kr/v1/ticker?currency_pair=bcc_krw', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body) // Print the google web page.
            korbit_ticker.bch = JSON.parse(body)

        }
    })
}

function run_korbit_ticker(){
    korbit_ticker_btc()
    korbit_ticker_etc()
    korbit_ticker_eth()
    korbit_ticker_xrp()
    korbit_ticker_bch()
}

run_korbit_ticker()
setInterval(run_korbit_ticker, 10000)



function bithum_ticker_parse(data){

    return _.each(data, (d) => d.last = d.closing_price)
    // Object.keys(data).forEach(function (key) {
    //     data[key].last = data[key].closing_price;
    //     delete data[key].closing_price;
    // });
    // console.log(data);
    // return data
}

function bithumb_ticker_all(){
    request('https://api.bithumb.com/public/ticker/ALL', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body) // Print the google web page.
            bithumb_ticker = bithum_ticker_parse(JSON.parse(body).data)
        }
    })
}


bithumb_ticker_all()
setInterval(bithumb_ticker_all, 6000)



bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

// send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

function getHowManyEmoji(e, v){
    if(Math.abs(v) > 0 && 9.999 > Math.abs(v) ){
        return e
    }
    if(Math.abs(v) > 10 && 19.999 > Math.abs(v)){
        return e + e
    }
    if(Math.abs(v > 20))
        return e + e + "🔥"
}

function bittrextStringParse(tickerData){
    // console.log(tickerData)
    if(tickerData !== undefined){
        let marketTitle = tickerData.MarketName

        let change = parseFloat((tickerData.Last / tickerData.PrevDay * 100.0) - 100.0).toFixed(4)

        let key = commonUtil.getKeySymbol(marketTitle,"-")

        let lastUSD;
        let prevUSD;
        let usdChange;

        if(key==="BTC"){
            lastUSD = " $" + (parseFloat(tickerData.Last) * current_usdt_btc).toFixed(4)
            prevUSD = " $" + (parseFloat(tickerData.PrevDay)* prev_usdt_btc).toFixed(4)

            usdChange = (parseFloat(tickerData.Last) * current_usdt_btc) / (parseFloat(tickerData.PrevDay)* prev_usdt_btc).toFixed(4) * 100 - 100
        }
        if(key==="ETH"){
            lastUSD = " $" + (parseFloat(tickerData.Last) * current_usdt_eth).toFixed(4)
            prevUSD = " $" + (parseFloat(tickerData.PrevDay) * prev_usdt_eth).toFixed(4)
            usdChange = (parseFloat(tickerData.Last) * current_usdt_eth) / (parseFloat(tickerData.PrevDay)* prev_usdt_eth).toFixed(4) * 100 - 100
        }
        if(key==="USDT"){
            lastUSD =" $" + parseFloat(tickerData.Last).toFixed(4)
            prevUSD =" $" + parseFloat(tickerData.PrevDay).toFixed(4)
            usdChange = (parseFloat(tickerData.Last)) / (parseFloat(tickerData.PrevDay)).toFixed(4) * 100 - 100

        }



        let changeText;
        if( change < 0.0 ){
            changeText = "Change: <b>" +change+ "%</b>"+getHowManyEmoji("😭", change)+"\r\n"
        }else{
            changeText = "Change: <b>" +change+ "%</b>" +getHowManyEmoji("🤑", change)+"\r\n"
        }

        let usdChangeText;
        // let usdChange = parseFloat(lastUSD / prevUSD).toFixed(4)
        if(usdChange < 0.0){
            usdChangeText = "USD Change: <b>" +usdChange.toFixed(4)+ "%</b>" +getHowManyEmoji("😭", usdChange.toFixed(4)) +"\r\n"
        }else{
            usdChangeText = "USD Change: <b>" +usdChange.toFixed(4)+ "%</b>"+getHowManyEmoji("🤑", usdChange.toFixed(4))+"\r\n"
        }


        let msg = "" +
            "최근 BTC: 💲<b>" + commonUtil.numberWithCommas(current_usdt_btc) + "</b>\r\n" +
            "어제 BTC: 💲<b>" + commonUtil.numberWithCommas(prev_usdt_btc) + "</b>\r\n" +
            "BTC USD Change: " + (current_usdt_btc / prev_usdt_btc * 100 - 100).toFixed(4) + "%\r\n" +
            "\r\n" +
            "최근 ETH: 💲<b>" + commonUtil.numberWithCommas(current_usdt_eth) + "</b>\r\n" +
            "어제 ETH: 💲<b>" + commonUtil.numberWithCommas(prev_usdt_eth) + "</b>\r\n" +
            "ETH USD Change: " + (current_usdt_eth / prev_usdt_eth * 100 - 100).toFixed(4) + "%\r\n"+

            "=============\r\n" +
            "Market: <b>" +tickerData.MarketName + "</b>\r\n" +
            "최근: <b>" + parseFloat(tickerData.Last).toFixed(8) + ` ${key}` + lastUSD +"</b>\r\n" +
            "어제: <b>" + parseFloat(tickerData.PrevDay).toFixed(8) +` ${key}`+ prevUSD +"</b>\r\n" +
            changeText  +"" +
            usdChangeText + "" +
            "Volume: " + tickerData.Volume + "\r\n" +
            "OpenBuyOrders: "+ tickerData.OpenBuyOrders +"\r\n" +
            "OpenSellOrders: "+ tickerData.OpenSellOrders +"\r\n" +
            "=============\r\n"

        return msg
    } else {
        return "Can not find Market"
    }

}

let last_koreanPremium = {
    dash:{

    },
    eth:{

    },
    btc:{

    }
}
function calcKoreanPremium(){
    let usdDash = parseFloat(_.find(bittrex_ticker, {'MarketName':'USDT-DASH'}).Last)
    let krwDash = parseFloat(bithumb_ticker.DASH.last)

    let usdBtc = parseFloat(_.find(bittrex_ticker, {'MarketName':'USDT-BTC'}).Last)
    let usdEth = parseFloat(_.find(bittrex_ticker, {'MarketName':'USDT-ETH'}).Last)
    let krwEth = parseFloat(bithumb_ticker.ETH.last)
    let krwBtc = parseFloat(bithumb_ticker.BTC.last)

    let usdKrwDash = usdDash * usd
    let usdKrwEth = usdEth * usd
    let usdKrwBtc = usdBtc * usd


    let rate = krwDash / usdKrwDash * 100 - 100
    let rateIcon, ethRateIcon, btcRateIcon;


    let ethRate = krwEth / usdKrwEth * 100 - 100
    let btcRate = krwBtc / usdKrwBtc * 100 - 100

    if(rate > 0.0){
        rateIcon = "👍"
    } else {
        rateIcon = "👎"
    }

    if(ethRate > 0.0){
        ethRateIcon = "👍"
    } else {
        ethRateIcon = "👎"
    }
    if(btcRate > 0.0){
        btcRateIcon = "👍"
    } else {
        btcRateIcon = "👎"
    }
    last_koreanPremium.eth = ethRate
    last_koreanPremium.btc = btcRate
    last_koreanPremium.dash = rate

    let m = "KRW USD 환율: 1$ = "+ usd + "원\r\n" +
        "🇰🇷😈  Bittrex:Bithumb\r\n" +
        "DASH :<b>" + rate.toFixed(4)  + "% </b>" +rateIcon+ "\r\n" +
        "ETH  :<b> USD: $"+usdEth +"(₩"+ commonUtil.numberWithCommas(usdEth * usd) +") KRW: ₩"+ commonUtil.numberWithCommas(krwEth) +"  DIFF:" + ethRate.toFixed(4) + "% </b>" +ethRateIcon+ "\r\n" +
        "BTC  :<b>" + btcRate.toFixed(4) + "% </b>" + btcRateIcon

    return m;
}

function defaultKeyboard(chatId) {
    bot.sendMessage(chatId, "What can I do for you? Stay a while and listen.", {
        "reply_markup": {
            "keyboard": [
                ["CAP","USDT-ETH", "USDT-BTC"],
                ["ETH-BAT", "ETH-SNT","ETH-OMG"],
                ["코빗","빗썸","김프","POLO"],["BITTREX"]]
        }
    });
}

bot.onText(/\/start/, (msg) => {
    defaultKeyboard(msg.chat.id)
});

bot.onText(/\alarm/,(msg) => {
    bot.sendMessage(msg.chat.id, "What do you want?", {
        "reply_markup": {
            "keyboard": [
                ["AlarmList"],
                ["AddAlarm", "RemoveAlarm"],
                ["Cancel"]]
        }
    });
})

let current_alarm_processing;
let current_alarm_type;
let current_alarm_comparator;
let current_alarm_value;
let current_alarm_freq;

let percents = [15.0, 10.0, 5.0, 2.0, 1.0, 0.0 ,-1.0, -2.0, -5.0, -10.0, -15.0]
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log(msg)

    if(msg.text ==="Cancel"){
        defaultKeyboard(msg.chat.id)
        return
    }
    else if (msg.text === "BITTREX"){

        let market_array = _.map(bittrex_markets,'MarketName').chunk_inefficient(5)
        market_array.push(['Cancel'])
        console.log(market_array)
        bot.sendMessage(msg.chat.id, "Whice one?", {
            "reply_markup": {
                "keyboard":market_array


            }
        })

    }
    else if(msg.text === "Equal" || msg.text === "Greater" || msg.text === "Less"){
        current_alarm_comparator = msg.text
        bot.sendMessage(msg.chat.id, "Select % Value", {
            "reply_markup": {
                "keyboard": [
                    ["15.0","10.0", "5.0", "2.0", "1.0"],
                    ["-15.0", "-10.0", "-5.0", "-2.0", "-1.0"],
                    ["0.0"],
                ["BackToAlarm", "Cancel"]]
            }
        })
        return
    }
    else if (msg.text==="SaveAlarm"){
        let predicate = new Predicate(current_alarm_type, current_alarm_comparator, current_alarm_value)
        let alarm = new Alarm(msg.from.first_name + msg.from.last_name, chatId, predicate, 1)

        alarms.push(alarm)
        bot.sendMessage(chatId, 'Alarm Saved! Total Alarm Count:' + alarms.length)

        defaultKeyboard(msg.chat.id)

        return
    }
    else if(percents.find(x => x===parseFloat(msg.text)) !== undefined){

        current_alarm_value = parseFloat(msg.text).toFixed(1)

        bot.sendMessage(msg.chat.id, "Type:" +current_alarm_type +"\r\n Comparator:" + current_alarm_comparator+
            "\r\n Value:"+ current_alarm_value + "\r\n Is that Okay?" , {
            "reply_markup": {
                "keyboard": [
                    ["SaveAlarm"],
                    ["BackToAlarm", "Cancel"]]
            }
        })
        return
        // console.log(msg.text +"aaa")
    }
    else if(msg.text === "KrwPremium") {
        current_alarm_type = "KrwPremium"
        bot.sendMessage(msg.chat.id, "Select Comparator", {
            "reply_markup": {
                "keyboard": [
                    ["Equal","Greater", "Less"],
                    ["BackToAlarm", "Cancel"]]
            }
        })
        return
    }
    else if(msg.text === "AlarmList"){
        bot.sendMessage(chatId,"test")

        console.log(alarms[0].owner)
        bot.sendMessage(chatId, alarms[0]['owner'])
        return
    }
    else if(msg.text === "AddAlarm"){
        if(alarms.length > 2){
            bot.sendMessage(chatId, "")
        }
        bot.sendMessage(msg.chat.id, "Which Type?.", {
            "reply_markup": {
                "keyboard": [
                    ["KrwPremium"],
                    ["Market"],
                ["BackToAlarm","Cancel"]]
            }
        })
        return
    }
    else if(msg.text ==="BackToAlarm") {
        bot.sendMessage(msg.chat.id, "What do you want?", {
            "reply_markup": {
                "keyboard": [
                    ["AlarmList"],
                    ["AddAlarm", "RemoveAlarm"],
                    ["Cancel"]]
            }
        });
        return
    }

    else if(msg.text==='/korbit' || msg.text==='/코빗' || msg.text==='코빗'){
        let m =
            "Korbit KRW-BTC: ￦" + commonUtil.numberWithCommas(korbit_ticker.btc.last) + "\r\n" +
            "Korbit KRW-ETH: ￦" + commonUtil.numberWithCommas(korbit_ticker.eth.last) + "\r\n" +
            "Korbit KRW-ETC: ￦" + commonUtil.numberWithCommas(korbit_ticker.etc.last) + "\r\n" +
            "Korbit KRW-XRP: ￦" + commonUtil.numberWithCommas(korbit_ticker.xrp.last) + "\r\n" +
            "Korbit KRW-BCH: ￦" + commonUtil.numberWithCommas(korbit_ticker.bch.last) + "\r\n"

        bot.sendMessage(chatId, m)

    }
    else if (msg.text ==="COINONE"){

    }
    else if(msg.text === "POLONIEX" || msg.text === "/poloniex" || msg.text==="POLO" || msg.text==="/polo" || msg.text==="poloniex"){
        let usdtEth = poloniex_ticker['USDT_ETH']
        let usdtBtc = poloniex_ticker['USDT_BTC']

        // console.log(usdtEth.last)
        // console.log(usdtBtc.last)

        let m =
            "Poloniex USDT-BTC: $" + parseFloat(usdtBtc['last']).toFixed(4) + "\r\n" +
            "Poloniex USDT-ETH: $" + parseFloat(usdtEth['last']).toFixed(4) + "\r\n"

        bot.sendMessage(chatId,m)

    }
    else if(msg.text==='/bt' || msg.text==='/빗썸' || msg.text==='빗썸'){
        let m =
            "Bithumb KRW-BTC: ￦" + commonUtil.numberWithCommas(bithumb_ticker.BTC.last) + "\r\n" +
            "Bithumb KRW-ETH: ￦" + commonUtil.numberWithCommas(bithumb_ticker.ETH.last) + "\r\n" +
            "Bithumb KRW-ETC: ￦" + commonUtil.numberWithCommas(bithumb_ticker.ETC.last) + "\r\n" +
            "Bithumb KRW-XRP: ￦" + commonUtil.numberWithCommas(bithumb_ticker.XRP.last) + "\r\n" +
            "Bithumb KRW-DASH: ￦" + commonUtil.numberWithCommas(bithumb_ticker.DASH.last) + "\r\n" +
            "Bithumb KRW-BCH: ￦" + commonUtil.numberWithCommas(bithumb_ticker.BCH.last) + "\r\n"

        bot.sendMessage(chatId, m)


    }
    else if(msg.text==="/김프" || msg.text==="김프"){
        // bot.sendMessage(chatId, "<b><i>김치가 좋아</i></b>", {parse_mode : "HTML"})

        bot.sendMessage(chatId, calcKoreanPremium(), {parse_mode : "HTML"})
    }
    else if(msg.text==="/cap" || msg.text==="CAP" || msg.text==="/CAP") {
        let marketCap = commonUtil.numberWithCommas(global_market.total_market_cap_usd)
        let bitPercentage = global_market.bitcoin_percentage_of_market_cap

        let m = "Total Market Cap Usd: $" + marketCap + "\r\n" +
            "BTC Dominance: " + bitPercentage + "%"

        bot.sendMessage(chatId, m)

    }
    else{
        if(_.find(bittrex_markets, {'MarketName':msg.text.replace('/','').toUpperCase()}) === undefined)
            return;

        let photoUrl = _.find(bittrex_markets, {'MarketName':msg.text.replace('/','').toUpperCase()}).LogoUrl

        if(photoUrl!==null){
            bot.sendPhoto(chatId,photoUrl);
        }


        let returnMsg = bittrextStringParse(_.find(bittrex_ticker, {'MarketName':msg.text.replace('/','').toUpperCase()}))
        bot.sendMessage(chatId, returnMsg,{parse_mode : "HTML"})

        defaultKeyboard(msg.chat.id)

    }



});