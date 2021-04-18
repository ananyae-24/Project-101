const catchAsync=require("../util/catch-async")
const Problems=require("../modle/Problem")
const apierror=require("../util/global-error")
const APIFeatures=require("../util/apifeatures")
const User=require("../modle/User")

const multer = require('multer');
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
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
   
     if(req.files.photo)
   { let body=req.files.photo.map(el=>el.filename)
    
    req.body.photo=body}
    next()
})

exports.makeproblem=catchAsync(async (req,res,next)=>{
    let id=req.user._id;
    if(req.body.location){
        let [lat,long]=req.body.location.split(",");
        if(!lat ||!long)
        return next(new apierror("invalid inputs to location",300))
        req.body.location = {type:"Point",coordinates:[long,lat]}
        
    }
    req.body.filedby=id;
    let problem=await Problems.create(req.body);
    const URL = `${req.protocol}://${req.get(
    'host'
  )}/public/images/`
   let temp=modifyobj(URL,problem.toObject({ getters: true }))
 
    res.status(200).json({status:"success",data:{problem:temp}})
});
exports.updateproblem=catchAsync(async(req,res,next)=>{
     let userid=req.user._id;
     let problemid=req.params.id;
     let problem= await Problems.findById(problemid);
     if(String(userid) != String(problem.filedby))return next(new apierror("You are not allowed to access this route",300))
     if(req.body.location){
        let [lat,long]=req.body.location.split(",");
        if(!lat ||!long)
        return next(new apierror("invalid inputs to location",300))
        req.body.location = {type:"Point",coordinates:[long,lat]}
        
    }
    for (let keys in req.body)
    {
        problem[keys]=req.body[keys]
    }
    await problem.save({validateBeforeSave:false})
    const URL = `${req.protocol}://${req.get(
        'host'
      )}/public/images/`
      problem=modifyobj(URL,problem.toObject({ getters: true }))
    res.status(200).json({status:"success",data:{problem}})
     
});
exports.getallproblem=catchAsync(async(req,res,next)=>{
    const features = new APIFeatures(Problems.find(), req.query)
    .filter("location")
    .sort()
    .limitFields()
    .paginate();
  let problems = await features.query;
  const URL = `${req.protocol}://${req.get(
    'host'
  )}/public/images/`;
  problems=problems.map(el=>modifyobj(URL,el.toObject({ getters: true })))
  res.status(200).json({status:"success",data:{problems}})
});
exports.problemresolved=catchAsync(async(req,res,next)=>{
    let problem=await Problems.findByIdAndUpdate(req.params.id,{status:req.body.status},{returnOriginal: false});
    const URL = `${req.protocol}://${req.get(
        'host'
      )}/public/images/`
      problem=modifyobj(URL,problem.toObject({ getters: true }))
    res.status(200).json({status:"success",data:{problem}})
})
const modifyobj= function(string,obj){
    if(obj.photo.length>0)
    return {...obj,photo:obj.photo.map(el=>string+el)}
    return obj
  }
