var express = require('express');
var router = express.Router();
var send = require('../js/email');
var { schema,toJSON }=require('../Utils/utils')
var {User,Article,Comments}=require('../js/initDb')
// 发送激活邮件
router.post('/activeEmail', function (req, res) {
    var jsonAlldata=req.body
        console.log("active", jsonAlldata)
        var url = "https://api.only1314.cn/apiEmails/sureActiveEmail?token=" + jsonAlldata.hash + "&username=" + jsonAlldata.username;
        var html='<div style="width: 100%;height: 300px;background: url(https://only1314.cn/static/images/email_bg.jpg) no-repeat center;background-size: cover;overflow: hidden;">'+
            '<h1 style="text-align: center;margin: 20px;">来自ONLY1314的激活邮件</h1>'+
            '<p style="text-align: center;color: #ffffff;margin-top: 75px;">感谢您注册并即将激活ONLY1314.cn的账号,本站将竭诚为您服务</p>'+
            '<div><a style="text-align: center;display: block;color: #ff4163;font-weight: 600;text-decoration: none;" href="'+url+'">戳我激活邮箱（快来愉快的玩耍~）</a></div>'+
            '</div>'
        var mailOptions = {
            from: 'ONLY1314 <admin@only1314.cn>', // 如果不加<xxx@xxx.com> 会报语法错误
            to: jsonAlldata.email, // list of receivers
            subject: '请点击链接激活您的邮箱~', // Subject line
            html: html// html body
        };
        console.log("mailOptions",mailOptions)
        send(mailOptions);
        return res.json(toJSON({}, '邮件发送成功', '200', '0'))

})
// 确定激活
router.get('/sureActiveEmail', function (req, res) {
    var wherestr = {'username': req.query.username};
    User.find(wherestr, function (err, ress) {
        if (err) {
            console.log("Error:" + err);
        }
        else {
            console.log("返回", ress)
            if (ress != '' && ress[0].hash == req.query.token) {
                console.log("找到了")
                User.update({'username': req.query.username}, {'activeStatus': true}, function (err, resss) {
                    if (err) {
                        console.log("Error:" + err);
                    }
                    else {
                        console.log("Res:" + resss);
                        res.redirect('https://only1314.cn/activeSuccess.html');
                    }
                })

            } else {
                console.log('没找到')
                return res.json(toJSON({}, 'token错误', '-1', '1'))
            }
        }
    })
    /*console.log("/del_user 响应 DELETE 请求");
     res.send('删除页面');*/
})
// 是否成功激活
router.post('/isActiveSuccess', function (req, res) {
    var jsonAlldata=req.body
        var wherestr = {'username': jsonAlldata.username};
        User.find(wherestr, function (err, ress) {
            if (err) {
                console.log("Error:" + err);
            }
            else {
                console.log("返回", ress)
                if (ress != '' && ress[0].activeStatus == false) {
                    console.log("未激活")
                    res.json(toJSON({}, '未激活', '-1', '1'))

                } else {
                    console.log('激活')
                    return res.json(toJSON(ress[0], '已激活', '200', '0'))
                }
            }
        })
})
module.exports = router;
