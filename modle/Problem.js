const mongoose = require("mongoose");
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
    filedAt:{
        type:Date,
        default:Date.now(),   
    },
    status:{
        type:String,
        enum:["Resolved","Pending"],
        default:"Pending"
    },
    filedby:{type:mongoose.ObjectId,
    required:true},
    resolvedat:{
        type:Date
    },
    photo:{type:[String]},
    probtype:{type:String,
    enum:["garbage","electrical","road"]},
    description:{type:"String",trim:true}

},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  })
 
  model=mongoose.model("Problem",schema);
module.exports=model;