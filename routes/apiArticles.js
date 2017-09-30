var express = require('express');
var fs = require('fs');
var router = express.Router();
var {ExcelParse,writeToFile,compare,comparef,schema,toJSON }=require('../Utils/utils')
// 引入数据库模型
var {User,Article}=require('../js/initDb')
var formidable = require('formidable');

//  /发布文章----------------------------------------------发布前修改路径
router.post('/publish', function (req, res) {
    var jsonAlldata=req.body;
    console.log(jsonAlldata)
        if (jsonAlldata.picArr == '') {
            var newData = {
                userId: jsonAlldata.userInfo._id,
                author: jsonAlldata.userInfo.username,
                date1: jsonAlldata.date1,
                date2: jsonAlldata.date2,
                companyName: jsonAlldata.companyName,
                address:jsonAlldata.address||'暂无',
                region: jsonAlldata.region,
                desc: jsonAlldata.desc,
                picArr: jsonAlldata.picArr,
                publishdate: new Date(),
                replyNums: 0,
                likeNums: 0,
                remark: jsonAlldata.remark || ''
                /* comments: []*/
            }
            console.log(newData)
            var article = new Article(newData)
            article.save(function (err, ress) {
                if (err) {
                    return res.json(toJSON({}, '网络不好，保存失败哟', '-1', '1'))
                } else {
                    return res.json(toJSON({}, '成功', '200', '0'))
                }
            })
        } else {
            for (var i = 0; i < jsonAlldata.picArr.length; i++) {
                var base64 = jsonAlldata.picArr[i].replace(/^data:image\/\w+;base64,/, "");
                var dataBuffer = new Buffer(base64, 'base64'); //把base64码转成buffer对象
                var date = new Date();
                var filename = String(date.getFullYear()) + String(date.getMonth() + 1) + String(date.getDate());
                var path = '../usr/static/images/Article/' + filename + '/';
                var imgSrc = '../usr/static/images/Article/' + filename + '/' + Date.parse(date) + i + '.png'
                /* var path = './img/' + filename + '/';
                 var imgSrc = './img/' + filename + '/' + Date.parse(date) + i + '.png'*/

                var imgname = String(Date.parse(date)) + String(i) + '.png';
                try {
                    writeToFile(i, imgSrc, imgname, filename, dataBuffer, jsonAlldata, res,Article,toJSON)
                } catch (err) {
                    fs.mkdirSync(path)
                    writeToFile(i, imgSrc, imgname, filename, dataBuffer, jsonAlldata, res,Article,toJSON)
                }

            }
        }
})
// 批量导入文章=================发布需要修改路径
router.post('/excelArticle', function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir='../usr/static/upload/article/';
    /*form.uploadDir='./public/upload/article/';*/
    /* var path='./public/upload/article/'*/
    var path='../usr/static/upload/article/'
    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log('文件上传错误！');
            return;
        }
        var filename=files.Filedata.name;
        // 对文件名进行处理，以应对上传同名文件的情况
        var nameArray = filename.split('.');
        var type = nameArray[nameArray.length - 1];
        var name = '';
        for (var i = 0; i < nameArray.length - 1; i++) {
            name = name + nameArray[i];
        }
        var date = new Date();
        var time = '_' + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes();

        var avatarName = name + time + '.' + type;

        var newPath = path + avatarName;
        console.log(newPath);
        fs.renameSync(files.Filedata.path, newPath);  //重命名
        console.log('重命名成功！');
        //对excel文件进行解析读取数据
        /* var newPath = path + files.Filedata.name;*/
        ExcelParse(newPath,fields.username,fields.userId,res,Article,toJSON);
    })
})
//  /获取文章列表
router.post('/getArticleList', function (req, res) {
    var jsonAlldata=req.body
        var pageSize = jsonAlldata.pageSize;                   //一页多少条
        var currentPage = jsonAlldata.currentPage;                //当前第几页
        var sort = {'publishdate': -1};        //排序（按登录时间倒序）
        var condition = {};                 //条件
        var skipnum = (currentPage - 1) * pageSize;   //跳过数
        var count=0
        Article.count({ }, function (err, count) {
            if (err){
            }else{
                count=count;
                Article.find(condition).skip(skipnum).limit(pageSize).sort(sort).exec(function (err, ress) {
                    if (err) {
                        console.log("Error:" + err);
                    }
                    else {
                        var ress=ress;
                        if (ress != '') {
                            var total=1
                            var articles=[];
                            for(let i=0;i<ress.length;i++){
                                var findUser={'_id':ress[i].userId}
                                User.find(findUser, function (err, res_user) {
                                    if (err) {
                                        console.log("Error:" + err);
                                    }
                                    else {

                                        var data={
                                            address:ress[i].address,
                                            author:ress[i].username,
                                            userPhoto:res_user[0].userPhoto,
                                            date1:ress[i].date1,
                                            date2:ress[i].date2,
                                            desc:ress[i].desc,
                                            likeNums:ress[i].likeNums,
                                            picArr:ress[i].picArr,
                                            publishdate:ress[i].publishdate,
                                            region:ress[i].region,
                                            remark:ress[i].remark,
                                            replyNums:ress[i].replyNums,
                                            userId:ress[i].userId,
                                            _id:ress[i]._id,
                                            companyName:ress[i].companyName,
                                        }
                                        articles.push(data)
                                        if(total==ress.length){
                                            var sortObj = articles.sort(comparef("publishdate"));
                                            return res.json(toJSON(sortObj, '成功', '200', '0',count))
                                        }
                                        total++
                                    }
                                })

                            }
                        } else {
                            console.log('没找到')
                            return res.json(toJSON({}, '用户名或密码错误', '-1', '1'))
                        }
                    }
                })
            }

        });
})
// 获取文章搜索列表
router.post('/articleSearchList', function (req, res) {
    var jsonAlldata=req.body
        var companyName=jsonAlldata.queryParam
        Article.find({'companyName':new RegExp(companyName)},function (err, ress) {
            if (err) {
                console.log("Error:" + err);
            }
            else {
                var ress=ress;
                if (ress != '') {
                    return res.json(toJSON(ress, '成功', '200', '0'))
                } else {
                    console.log('没找到')
                    return res.json(toJSON({}, '无此公司', '-1', '1'))
                }
            }
        })
})
// 获取具体文章
router.post('/getArticle',function (req,res) {
    var jsonAlldata=req.body
        var wherestr = {'_id': jsonAlldata.aid};
        Article.find(wherestr, function (err, ress) {
            if (err) {
                console.log("Error:" + err);
            }
            else {
                if (ress != '') {
                    console.log("找到文章了")
                    return res.json(toJSON(ress[0], '成功', '200', '0'))
                } else {
                    console.log('没找到')
                    return res.json(toJSON({}, '文章不存在', '-1', '1'))
                }
            }
        })
})
// 文章回复数量统计
router.post('/addReplyNum',function (req,res) {


    var jsonAlldata=req.body
        var findArticle={'_id':jsonAlldata.aid}
        Article.find(findArticle, function (err, ress) {
            if (err) {
                console.log("Error:" + err);
            }
            else {
                console.log("返回", ress)
                if (ress != '') {
                    var replyNums=ress[0].replyNums+1;
                    Article.update({'_id': jsonAlldata.aid}, {'replyNums': replyNums}, function (err, resss) {
                        if (err) {
                            console.log("Error:" + err);
                        }
                        else {
                            return res.json(toJSON({}, '回复成功', '200', '0'))
                        }
                    })

                } else {
                    console.log('没找到')
                    return res.json(toJSON({}, 'token错误', '-1', '1'))
                }
            }
        })
})
// 文章点赞
router.post('/addLike',function (req,res) {
    var jsonAlldata=req.body
        var findArticle={'_id':jsonAlldata.aid}
        Article.find(findArticle, function (err, ress) {
            if (err) {
                console.log("Error:" + err);
            }
            else {
                console.log("返回", ress)
                if (ress != '') {
                    var likeNums=ress[0].likeNums+1;
                    console.log("数量",ress[0].likeNums,likeNums)
                    Article.update({'_id': jsonAlldata.aid}, {'likeNums': likeNums}, function (err, resss) {
                        if (err) {
                            console.log("Error:" + err);
                        }
                        else {
                            return res.json(toJSON({}, '点赞成功', '200', '0'))
                        }
                    })

                } else {
                    console.log('没找到')
                    return res.json(toJSON({}, 'token错误', '-1', '1'))
                }
            }
        })
})

module.exports = router;