const mongoose = require("mongoose");
const crypto=require ("crypto")
const validator = require("validator");
const bcrypt = require("bcryptjs");


const schema=new mongoose.Schema({
 question:{type:String,required:true},
filed_at:{type:Date,default:Date.now()},
answers:{
    type:[String]
}
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  })

model=mongoose.model("FAQ",schema);
module.exports=model;