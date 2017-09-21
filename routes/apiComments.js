var express = require('express');
var fs = require('fs');
var router = express.Router();
var { compare,schema,toJSON }=require('../Utils/utils')
var {User,Article,Comments}=require('../js/initDb')
// 根据文章id获取评论
router.post('/getComments',function (req,res) {
    var jsonAlldata=req.body
        var wherestr = {'aid': jsonAlldata.aid};
        console.log(jsonAlldata.aid)
        Comments.find(wherestr).sort({'create_time':1}).exec(function (err, ress) {
            if (err) {
                console.log("Error:" + err);
            }
            else {
                if (ress != '') {
                    console.log("找到评论了",ress)
                    /*var data=[{name:'wuhao',commentdate:'2017-10-10',tetx:'dswdwd',subComment:[{name:'',commentdata:'2016',text:'23232'}]}]*/
                    var comments=[]
                    /*ress.forEach(function (v,i,a) {*/
                    var total=1
                    for(let i=0;i<ress.length;i++){
                        if(ress[i].sub_re_cid!='0'){
                            console.log("ghjhgjhjkhjkh")
                            console.log(ress[i].sub_re_uid)
                            var findUser={'$or':[{'_id':ress[i].uid},{'_id':ress[i].sub_re_uid}]}
                            /* User.find(findUser, function (err, res_user) {
                             if (err) {
                             console.log("Error:" + err);
                             }
                             else {
                             if (res_user != '' ) {
                             console.log("找到了2")
                             console.log("res_user",res_user)

                             var data={
                             uid:res_user[0]._id,
                             name:res_user[0].username,
                             userPhoto:res_user[0].userPhoto,
                             commentdate:ress[i].create_time,
                             aid:ress[i].aid,
                             content:ress[i].content,
                             cid:ress[i]._id,
                             re_cid:ress[i].re_cid,
                             sub_re_cid:ress[i].sub_re_cid,
                             sub_re_name:res_user[1].username
                             }
                             comments.push(data)
                             if(total==ress.length){
                             /!* console.log(comments)*!/
                             var sortObj = comments.sort(compare("commentdate"));
                             return res.json(toJSON(sortObj, '成功', '200', '0'))
                             }
                             total++
                             } else {
                             console.log('没找到')
                             /!* return res.json(toJSON({}, '无此用户', '-1', '1'))*!/
                             }
                             }
                             })*/
                        }else {
                            var findUser={'_id':ress[i].uid}

                        }
                        User.find(findUser, function (err, res_user) {
                            if (err) {
                                console.log("Error:" + err);
                            }
                            else {
                                if (res_user != '' ) {
                                    console.log("找到了")
                                    console.log("res_user",res_user)
                                    if(res_user[0]._id!=ress[i].uid&&res_user[1]){
                                        var temp=res_user[0];
                                        res_user[0]=res_user[1];
                                        res_user[1]=temp
                                    }
                                    var sub_re_name=''
                                    try {
                                        sub_re_name=res_user[1].username
                                    }catch(err) {}
                                    var data={
                                        uid:res_user[0]._id,
                                        name:res_user[0].username,
                                        userPhoto:res_user[0].userPhoto,
                                        commentdate:ress[i].create_time,
                                        aid:ress[i].aid,
                                        content:ress[i].content,
                                        cid:ress[i]._id,
                                        re_cid:ress[i].re_cid,
                                        sub_re_cid:ress[i].sub_re_cid,
                                        sub_re_name:sub_re_name
                                    }
                                    comments.push(data)
                                    if(total==ress.length){
                                        /* console.log(comments)*/
                                        var sortObj = comments.sort(compare("commentdate"));
                                        return res.json(toJSON(sortObj, '成功', '200', '0'))
                                    }
                                    total++
                                } else {
                                    console.log('没找到')
                                    /* return res.json(toJSON({}, '无此用户', '-1', '1'))*/
                                }
                            }
                        })

                    }

                } else {
                    console.log('没找到')
                    return res.json(toJSON({}, '文章不存在', '-1', '1'))
                }
            }
        })
})
// 对文章的回复接口
router.post('/z_reply', function (req, res) {
    var jsonAlldata=req.body
        console.log(jsonAlldata)
        var newReply = {
            uid: jsonAlldata.uid,
            aid: jsonAlldata.aid,
            content: jsonAlldata.content,
            create_time: new Date(),
            re_cid: jsonAlldata.re_cid,
            sub_re_cid:jsonAlldata.sub_re_cid,
            sub_re_uid:jsonAlldata.sub_re_uid
        }
        console.log(typeof newReply.uid)
        var comment = new Comments(newReply)
        comment.save(function (err, ress) {
            if (err) {
                console.log("Error")
            } else {
                console.log("comment保存成功",ress)
                var ress=ress;
                var wherestr = {'_id': ress.uid};
                User.find(wherestr, function (err, resss) {
                    if (err) {
                        console.log("Error:" + err);
                    }
                    else {
                        if (resss != '') {
                            /*  console.log("找到用户",resss)
                             ress.userPhoto=resss[0].userPhoto;
                             ress.username=resss[0].username;*/
                            var data={
                                aid:jsonAlldata.aid,
                                cid:ress._id,
                                commentdate:ress.create_time,
                                content:ress.content,
                                name:resss[0].username,
                                re_cid:'0',
                                sub_re_cid:'0',
                                sub_re_name:'',
                                uid:resss[0]._id,
                                userPhoto:resss[0].userPhoto,
                                subComments:[]
                            }
                            console.log("组合之后",data)
                            return res.json(toJSON(data, '成功', '200', '0'))

                        } else {
                            console.log("无此用户")

                        }
                    }
                })

            }
        })

        /*var data=[{name:'wuhao',commentdate:'2017-10-10',tetx:'dswdwd',subComment:[{name:'',commentdata:'2016',text:'23232'}]}]*/

})
// 对某一条回复的接口
router.post('/s_reply', function (req, res) {
    var jsonAlldata=req.body
        var newReply = {
            uid: jsonAlldata.uid,
            aid: jsonAlldata.aid,
            content: jsonAlldata.content,
            create_time: new Date(),
            re_cid: jsonAlldata.re_cid,
            sub_re_cid:jsonAlldata.sub_re_cid,
            sub_re_uid:jsonAlldata.sub_re_uid
        }
        var comment = new Comments(newReply)
        comment.save(function (err, ress) {
            if (err) {
                console.log("Error")
            } else {
                console.log("comment保存成功",ress)
                var ress=ress;
                console.log("ssssss",ress)
                if(jsonAlldata.sub_re_cid!='0'){
                    var wherestr={'$or':[{'_id':ress.uid},{'_id':ress.sub_re_uid}]}
                }else {
                    var wherestr={'_id':ress.uid}
                }
                User.find(wherestr, function (err, resss) {
                    if (err) {
                        console.log("Error:" + err);
                    }
                    else {
                        if (resss != '') {
                            if(resss[0]._id!=ress.uid){
                                var temp=resss[0];
                                resss[0]=resss[1];
                                resss[1]=temp
                            }
                            var sub_re_name=''
                            try {
                                sub_re_name=resss[1].username
                            }catch(err) {}
                            var data={
                                aid:jsonAlldata.aid,
                                cid:ress._id,
                                commentdate:ress.create_time,
                                content:ress.content,
                                name:resss[0].username,
                                re_cid:jsonAlldata.re_cid,
                                sub_re_cid:jsonAlldata.sub_re_cid,
                                sub_re_name:sub_re_name,
                                uid:resss[0]._id,
                                userPhoto:resss[0].userPhoto,
                                subComments:[]
                            }
                            console.log("组合之后",data)
                            return res.json(toJSON(data, '成功', '200', '0'))

                        } else {
                            console.log("无此用户")

                        }
                    }
                })

            }
        })
        /*var data=[{name:'wuhao',commentdate:'2017-10-10',tetx:'dswdwd',subComment:[{name:'',commentdata:'2016',text:'23232'}]}]*/

})
module.exports = router;
