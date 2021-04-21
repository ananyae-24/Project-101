const catchAsync=require("../util/catch-async")
const Verifiers=require("../modle/Verifiers")
const apierror=require("../util/global-error")
const APIFeatures=require("../util/apifeatures")
const sms=require("../util/sms")
const COVID=require("../modle/covid");
exports.makeverifier=catchAsync(async (req,res,next)=>{
    if(!req.body.id) return next(new apierror("Id parameter missing",300));
    let covid=await COVID.findById(req.body.id)
    if(!covid || !covid.active) return next(new apierror("Wrong Id provided",300));
    let body=req.body;
    body.place=covid._id;
    delete body.id;
    if(body.active)
    body.active=false;
    let user=await Verifiers.create(body);
    let token=await user.generateotp();
    await user.save({ validateBeforeSave: false });
    try{
        await new sms(user,token).send();
        covid.verifiedBy.push(user._id);
        await covid.save({ validateBeforeSave: false });
        res.status(200).json({
            status:"success",
            message:"sms sent"
        })
    }
    catch(err){
        await Verifiers.findByIdAndDelete(user._id)
        res.status(500).json({
            message:err,status:"fail"})
    }
})
exports.activateaccount_no=catchAsync(async (req,res,next)=>{
    let token=req.params.token;
    let number=req.params.number;
    let user=await Verifiers.findOne({number,validtill:{$gte:Date.now()}}).populate('COVID')
    if (!user) return next(new apierror("The token expired",300))
    if (! await user.comparetoken(token,user.token)) return next(new apierror("The token expired",300))
    user.active=true;
    user.token=null;
    user.validtill=null;
    user.save({validateBeforeSave:false});
    res.status(200).json({status:"success",data:{verifier:user}})
});
exports.getAll=catchAsync(async (req,res,next)=>{
    const features = new APIFeatures(Verifiers.find({active:true}).populate('place'), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  let problems = await features.query;
  res.status(200).json({status:"success",data:{Verifiers:problems}})
});
