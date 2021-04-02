const catchAsync=require("../util/catch-async")
const Problems=require("../modle/Problem")
const apierror=require("../util/global-error")
const APIFeatures=require("../util/apifeatures")
const User=require("../modle/User")
exports.makeproblem=catchAsync(async (req,res,next)=>{
    let id=req.user._id;
    if(req.body.location){
        let [lat,long]=req.body.location.split(",");
        if(!lat ||!long)
        return next(new apierror("invalid inputs to location",300))
        req.body.location = {type:"Point",coordinates:[long,lat]}
        
    }
    req.body.filedby=id;
    let problem=await Problems.create(req.body)
    res.status(200).json({status:"success",data:{problem}})
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
    res.status(200).json({status:"success",data:{problem}})
     
});
exports.getallproblem=catchAsync(async(req,res,next)=>{
    const features = new APIFeatures(Problems.find(), req.query)
    .filter("location")
    .sort()
    .limitFields()
    .paginate();
  const problems = await features.query;

  res.status(200).json({status:"success",data:{problems}})
});
exports.problemresolved=catchAsync(async(req,res,next)=>{
    let problem=await Problems.findByIdAndUpdate(req.params.id,{status:req.body.status},{returnOriginal: false});
    res.status(200).json({status:"success",data:{problem}})
})