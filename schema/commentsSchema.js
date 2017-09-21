var commentsSchema={
    uid:{type:String},
    aid: {type: String},
    content:{type:String},
    re_cid:{type:String},
    sub_re_cid:{type:String},
    sub_re_uid:{type:String},
    create_time:{type:Date}
}

module.exports=commentsSchema;