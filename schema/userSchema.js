var userSchema={
    username:{type:String},
    userPhoto:{type:String},
    userpwd:{type:String},
    email:{type:String},
    hash:{type:String},
    activeStatus:{type:Boolean},
    logindate:{type:Date}
}
module.exports=userSchema;