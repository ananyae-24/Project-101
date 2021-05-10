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
    
    // number:{type:String },
    active:{
        type:Boolean,
        default:false,
    },
    name:{type:String },
    entity:{type:String},
    city:{type:String},
    state:{type:String},
    address:{type:String},
    contact:{type:String,required:true},
    link:{type:String},
    description:{type:"String",trim:true},
    verifiedBy:{type:[mongoose.ObjectId],ref:"VERIFIERS"},
    description:{type:String},
    vote:{type:Object,default:{upvote:0,downvote:0,remarks:[],reasons:[]}},
       /////////////////////////////////////////////////////////////////
    token:{type:String},
    validtill:{type:Date},

},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  });
  schema.index({entity:1,city:1}) 
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