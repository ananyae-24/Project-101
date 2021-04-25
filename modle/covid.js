const mongoose = require("mongoose");
const crypto=require ("crypto")
const validator = require("validator");
const bcrypt = require("bcryptjs");
const pointSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  });

const schema=new mongoose.Schema({
    /////////////////////////////////////
    location:{
        type:pointSchema,
        required: true,
    },
    photo:{type:[String]},
    filedAt:{
        type:Date,
        default:Date.now(),   
    },
    // status:{
    //     type:String,
    //     enum:["Resolved","Pending"],
    //     default:"Pending"
    // },
    // filedby:{type:mongoose.ObjectId,
    // required:true},
    // resolvedat:{
    //     type:Date
    // },
    
    number:{type:Number},
    active:{
        type:Boolean,
        default:false,
    },
    name:{type:String },
    entity:{type:String},
    quantity:{type:Number},
    city:{type:String},
    provider_name:{type:String},
    provider_address:{type:String},
    provider_contact:{type:Number},
    link:{type:String},
    description:{type:"String",trim:true},
    verifiedBy:{type:[mongoose.ObjectId],ref:"VERIFIERS"},
       /////////////////////////////////////////////////////////////////
    token:{type:String},
    validtill:{type:Date},

},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  })
schema.methods.comparetoken=async function(usertoken,dbtoken){
    return crypto
    .createHash('sha256')
    .update(usertoken)
    .digest('hex') == dbtoken;
}
schema.methods.generateotp=async function (){
    let token=crypto.randomBytes(3).toString('hex');
    this.token=crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
    this.validtill=Date.now()+2*60*1000;
    return token;
}
// schema.methods.verifiersotp=async function(data){
//     let token=crypto.randomBytes(3).toString('hex');
//     this.verified
//     return token;
// }
model=mongoose.model("COVID",schema);
module.exports=model;
