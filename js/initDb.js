/**
* 数据库模型初始化，按需引入
*/

var {schema}=require('../Utils/utils')
var dbModel={
    User:schema('user'),
    Article:schema('article'),
    Comments:schema('comments')
}
module.exports=dbModel;