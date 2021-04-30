const catchAsync=require("../util/catch-async")
const FAQ=require("../modle/faq")
const apierror=require("../util/global-error")
const sms=require("../util/sms")
const APIFeatures=require("../util/apifeatures")
exports.make=catchAsync(async (req,res,next)=>{
    let faq=await FAQ.create(req.body);
    res.status(200).json({status:"success",faq});
});
exports.get=catchAsync(async (req,res,next)=>{
    const features = new APIFeatures(FAQ.find(), req.query)
      .filter().or()
      .sort()
      .limitFields()
      .paginate();
    const faq = await features.query;
    res.status(200).json({status:"success",faq});
});
exports.delete=catchAsync(async (req,res,next)=>{
    if(!req.params.id) return next(new apierror("Id param missing",300))
    let faq=await FAQ.findByIdAndDelete(req.params.id);
    res.status(200).json({status:"success",faq});
});
exports.answer=catchAsync(async (req,res,next)=>{

    if(!req.params.id) return next(new apierror("Id param missing",300))
    let faq=await FAQ.findById(req.params.id)
    if(!faq) return next(new apierror("Invalid Id",300));
    faq.answers.push(req.body.answer);
    await faq.save({validateBeforeSave:false});
    res.status(200).json({status:"success",faq});
});