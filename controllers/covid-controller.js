const catchAsync=require("../util/catch-async")
const COVID=require("../modle/covid")
const apierror=require("../util/global-error")
const sms=require("../util/sms")
const APIFeatures=require("../util/apifeatures")
const multer = require('multer');
const crypto = require('crypto');
const { Console } = require("console")
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${crypto.randomBytes(20).toString('hex')}-${Date.now()}.${ext}`);
  },
});
const multerfilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new apierror('invalid file type', 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerfilter });

exports.uploadmultipleimages=upload.fields([{name:"photo",maxCount:5}])
exports.reqbodyupadate=catchAsync(async(req,res,next)=>{
   
     if(req.files && req.files.photo)
   { let body=req.files.photo.map(el=>el.filename)
    
    req.body.photo=body}
    next()
})
exports.makenotification=catchAsync(async (req,res,next)=>{
    let body=req.body;
    if(body.active)
    body.active=false;
    if(!body.number)
    return next(new apierror("Not a valid number",300));
    let [lat,long]=body.location.split(",");
    if(!lat || !long)
    return next(new apierror("invalid inputs to location",300))
    body.location = {type:"Point",coordinates:[long,lat]}
    res_=await COVID.create(req.body);
    let token =await res_.generateotp();
    await res_.save({ validateBeforeSave: false });
    try{
        await new sms(res_,token).send();
        res.status(200).json({
            status:"success",
            message:"sms sent"
        })
    }
    catch(err){
        await COVID.findByIdAndDelete(res._id)
        res.status(500).json({
            message:err,status:"fail"})
    }
});
exports.getnotification=catchAsync(async (req,res,next)=>{
  // console.log("Hi")
    const features = new APIFeatures(COVID.find({active:true}).populate("verifiedBy"), req.query)
    .filter("location").or()
    .sort()
    .limitFields()
    .paginate();
    // console.log(features.query)
  let problems = await features.query;//COVID.find({active:true}).populate("verifiedBy")
  //  console.log(problems.length)
  const URL = `${req.protocol}://${req.get(
    'host'
  )}/public/images/`;
  problems=problems.map(el=>modifyobj(URL,el.toObject({ getters: true })))
  res.status(200).json({status:"success",data:{covid:problems}})
})
exports.activateaccount_no=catchAsync(async (req,res,next)=>{
    let token=req.params.token;
    let number=req.params.number;
    
    let user=await COVID.findOne({number,validtill:{$gte:Date.now()}})
    if (!user) return next(new apierror("The token expired",300))
    if (! await user.comparetoken(token,user.token)) return next(new apierror("The token expired",300))
    user.active=true;
    user.token=null;
    user.validtill=null;
    user.save({validateBeforeSave:false});
    res.status(200).json({status:"success",data:{covid:user}})
})
exports.deletenotification=catchAsync(async (req,res,next)=>{
    let id=req.params.id;
    if(!id)
    return next(new apierror("invalid Request",300))
    let covid=await COVID.findById(id);
    if(!covid)
    return next(new apierror("invalid Request",300))
    covid.active=false;
    await covid.save({validateBeforeSave:false});
    res.status(200).json({status:"success",data:{covid}})
})
const modifyobj= function(string,obj){
    if(obj.photo.length>0)
    return {...obj,photo:obj.photo.map(el=>string+el)}
    return obj
  }
exports.makenotificationwithoutotp=catchAsync(async (req,res,next)=>{
    // console.log(req.body)
    let body=req.body;
    body.active=true;
    // if(!body.provider_contact)
    // return next(new apierror("Not a valid number",300));
    let [lat,long]=body.location.split(",");
    if(!lat || !long)
    return next(new apierror("invalid inputs to location",300))
    body.location = {type:"Point",coordinates:[long,lat]};
    let covid=await COVID.create(req.body);
    res.status(200).json({message:"success",covid})
})
exports.activatenotification=catchAsync(async (req,res,next)=>{
  let id=req.params.id;
  if(!id)
  return next(new apierror("invalid Request",300))
  let covid=await COVID.findById(id);
  if(!covid)
  return next(new apierror("invalid Request",300))
  covid.active=true;
  await covid.save({validateBeforeSave:false});
  res.status(200).json({status:"success",data:{covid}})
});
exports.differententity=catchAsync(async(req,res,next)=>{
  let match=req.params.match.substring(1,req.params.match.length-1);
  let t=new Object();
  t[match.substring(0,match.indexOf(","))]=match.substring(match.indexOf(",")+1)
  match=t;
  let group=req.params.group;
  const agg=await COVID.aggregate([{$match: match},{$group:{_id: "$"+group,count: { $sum: 1 } }}])
  res.status(200).json({status:"success",agg})
})