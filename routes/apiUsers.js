var express = require('express');
var fs = require('fs');
var crypto = require('crypto');
var router = express.Router();
var { copyFile,schema,toJSON }=require('../Utils/utils')
var {User}=require('../js/initDb')
/* GET users listing. */
router.post('/userCenter',function (req,res) {
    var jsonAlldata=req.body
        if(jsonAlldata.type=='switchPhoto'){
            var userPhoto=jsonAlldata.picArr[0];
            var uid=jsonAlldata.uid;
            var pic=jsonAlldata.pic;
            var base64 = userPhoto.replace(/^data:image\/\w+;base64,/, "");
            var dataBuffer = new Buffer(base64, 'base64'); //把base64码转成buffer对象
            var date = new Date();
            var filename = String(date.getFullYear()) + String(date.getMonth() + 1) + String(date.getDate());
            var imgSrc = '../usr/share/nginx/html/'+pic;
          /*  var path = './img/photo/' + filename + '/';
           var imgSrc = './img/photo/' + filename + '/' + Date.parse(date)+ '.png'*/
            fs.writeFileSync(imgSrc, dataBuffer)
            var findUser={'_id':uid}
            User.find(findUser, function (err, res_user) {
                if (err) {
                    console.log("Error:" + err);
                }
                else {
                    if (res_user != '') {
                        return res.json(toJSON(res_user[0], '成功', '200', '0'))
                    } else {
                        console.log('没找到')
                        return res.json(toJSON({}, '用户不存在', '-1', '1'))
                    }
                }
            })

        }

})
// 注册
router.post('/regist', function (req, res) {
    var jsonAlldata=req.body
        const hmac = crypto.createHmac('sha256', 'signup')
        hmac.update(jsonAlldata.email + Date.now())
        const hashcode = hmac.digest('hex')
        var data = {
            username: jsonAlldata.username,
            userpwd: jsonAlldata.password,
            userPhoto:'',
            email: jsonAlldata.email,
            hash: hashcode,
            activeStatus: false,
            logindate: new Date()
        }
        console.log(data)
        var wherestr = {'username': jsonAlldata.username};
        User.find(wherestr, function (err, ress) {
            if (err) {
                console.log("Error:" + err);
            }
            else {
                console.log("返回", ress)
                if (ress != '') {
                    console.log("找到了")
                    return res.json(toJSON({}, '用户名已存在', '-1', '1'))

                } else {
                    var user = new User(data)
                    user.save(function (err, ress) {
                        if (err) {
                            console.log("Error")
                        } else {
                            var oldPath='../usr/share/nginx/html/static/images/photo.png';
                            var date = Date.parse(new Date())
                            fs.mkdirSync('../usr/share/nginx/html/images/User/'+ress._id+'/')
                            var newPath='../usr/share/nginx/html/images/User/'+ress._id+'/'+ress._id+'_'+date+'.png'
                            copyFile(oldPath,newPath)
                            User.update({'_id': ress._id}, {'userPhoto':'https://only1314.cn/images/User/'+ress._id+'/'+ress._id+'_'+date+'.png'}, function (err, resss) {
                                if (err) {
                                    console.log("Error:" + err);
                                }
                                else {
                                    ress.userPhoto='https://only1314.cn/images/User/'+ress._id+'/'+ress._id+'_'+date+'.png';
                                    return res.json(toJSON(ress, '成功', '200', '0'))
                                }
                            })
                        }
                    })


                }
            }
        })

      /*res.write(alldata)
       res.end();*/

})
// 登陆
router.post('/login', function (req, res) {
    var jsonAlldata=req.body
        var wherestr = {'username': jsonAlldata.username};
        User.find(wherestr, function (err, ress) {
            if (err) {
                console.log("Error:" + err);
            }
            else {
                if (ress != '' && ress[0].userpwd == jsonAlldata.password) {
                    console.log("找到了")
                    return res.json(toJSON(ress[0], '成功', '200', '0'))
                } else {
                    console.log('没找到')
                    return res.json(toJSON({}, '用户名或密码错误', '-1', '1'))
                }
            }
        })
})
module.exports = router;
