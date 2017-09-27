var express = require('express');
var router = express.Router();
var Api=require('../js/weather')
var request = require('request');
var {toJSON }=require('../Utils/utils')
router.post('/getWeather', function (req, res) {
  /*  var jsonAlldata=req.body*/


 /*   var ip=req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress||'125.71.132.213'*/
    var ip='125.71.132.213'
    console.log(ip)
    const UID = "U295BB6845"; // 测试用 用户ID，请更换成您自己的用户ID
    const KEY = "qds5rkfqvq3ckkw3"; // 测试用 key，请更换成您自己的 Key
    request('http://ip.taobao.com/service/getIpInfo.php?ip='+ip, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(typeof body) // Show the HTML for the baidu homepage.
            var LOCATION = JSON.parse(body).data.city; // 除拼音外，还可以使用 v3 id、汉语等形式
            console.log(LOCATION)
            var argv = require('optimist').default('l', LOCATION).argv;
             var api = new Api(UID,KEY);
             api.getWeatherNow(argv.l).then(function(data) {
             var date=new Date(),hour=date.getHours(), r_back={};
             console.log(JSON.stringify(data))
             console.log(hour)
                 if(hour>=19){
                    r_back={
                        code:110,
                        w_text:data.results[0].now.text,
                        text:'夜晚来临，忙碌一天，请多陪陪家人~',
                        name:data.results[0].location.name,
                        temperature:data.results[0].now.temperature
                    }
                 }else{
                     r_back={
                         code:data.results[0].now.code,
                         w_text:data.results[0].now.text,
                         text:'新的一天，加油~',
                         name:data.results[0].location.name,
                         temperature:data.results[0].now.temperature
                     }
                 }

                 return res.json(toJSON(r_back, '天气', '200', '0'))
             }).catch(function(err) {
             console.log(err.error.status);
             });
        }
    })
   /* var api = new Api(UID,KEY);
    api.getWeatherNow(argv.l).then(function(data) {
        console.log(JSON.stringify(data, null, 4));
    }).catch(function(err) {
        console.log(err.error.status);
    });*/
   /* console.log('43432423',x);*/
    /*return res.json(toJSON({}, '邮件发送成功', '200', '0'))*/

})
module.exports = router;