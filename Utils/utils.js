/**
 *工具类
 * @param  对象
 */
var fs = require('fs');
var node_xlsx = require('node-xlsx');
var utils={
    /**
    * 返回给前端json数据
    */
    toJSON:function (data = {}, message = '', status = '', code = '',count) {
        return {data, message, status, code,count}
    },
    copyFile:function (oldPath,newPath) {
        console.log('--------开始读取文件--------');
        fs.readFile(oldPath, function(err, data) {
            if (err) {
                console.log("读取失败");
            } else {
                fs.writeFile(newPath,data,function(error){
                    if(error){
                        throw error;
                    }else{
                        console.log("文件已保存");
                    }
                });
            }
        });
    },
    /**
    * 比较后升序
    */
    compare:function (property) {
        return function(obj1,obj2){
            var value1 = obj1[property];
            var value2 = obj2[property];
            return value1 - value2;     // 升序
        }
    },
    /**
    * 比较后降序
    */
    comparef:function (property) {
        return function(obj1,obj2){
            var value1 = obj1[property];
            var value2 = obj2[property];
            return value2 - value1;     // 降序
        }
    },
    /**
    * 对excel批量上传的处理
    */
    ExcelParse:function (newPath,username,userId,res,Article,toJSON) {
        var obj = node_xlsx.parse(newPath);
        var excelObj = obj[0].data;//取得第一个excel表的数据
        //循环遍历表每一行的数据
        console.log("条数",excelObj.length)
        for(var i=0;i<excelObj.length-1;i++) {
            var rdata = excelObj[i];
            var newData = {
                userId: userId,
                author: username,
                date1: '',
                date2: '',
                companyName:  rdata[0],
                address:rdata[1]||'暂无',
                region: '互联网',
                desc: rdata[2],
                picArr: 'https://static.only1314.cn/public/images/s.jpg',
                publishdate: new Date(),
                replyNums: 0,
                likeNums: 0,
                remark:'此为批量导入，信息由19652站提供，在此，十分感谢',
                comments: []
            }
            var article = new Article(newData)
            article.save(function (err, ress) {
                if (err) {
                    return res.json(toJSON({}, '网络不好，保存失败哟', '-1', '1'))
                } else {

                    /*return res.json(toJSON({}, '成功', '200', '0'))*/
                }
            })
        }
    },

    /**
    *  写入图片文件
    */
    writeToFile:function(i, imgSrc, imgname, filename, dataBuffer, jsonAlldata, res,Article,toJSON) {
        fs.writeFileSync(imgSrc, dataBuffer)
        jsonAlldata.picArr[i] = 'https://static.only1314.cn/images/Article/' + filename + '/' + imgname;
        console.log(i, jsonAlldata.picArr.length)
        if (i == jsonAlldata.picArr.length - 1) {
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
        }
    },
    /**
    * 返回状态值的判断
    */
    dataStatus:function (data,message,type) {
        if(type==1){
            return {
                status:'200',
                code:'0',
                message:message,
                data:data
            }
        }else{
            return{
                status:'-1',
                code:'1',
                message:message,
                data:data
            }
        }
    },
    /**
     *数据库相关
     * 开始
     */
    schema:function (schemaName) {
        var mongoose=require('mongoose');
        var DB_URL = 'mongodb://localhost:27017/wuhao';
        mongoose.Promise = Promise;
        /**
         * 创建一个数据库链接
         */
       var db= mongoose.connect(DB_URL,{useMongoClient:true});
       /**
       * 引入Schema配置文件
       */
       var schemaConf=require('../schema/'+schemaName+'Schema.js');
        /**
        * 生成一个schema
        */
        var Schema=new mongoose.Schema(schemaConf);
        /**
        * 根据Schema生成模型
        */
        var Model=db.model(schemaName,Schema)
        return Model;
    }
    /**
     *数据库相关
     * 结束
     */

}
module.exports = utils;