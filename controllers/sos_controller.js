const catchAsync=require("../util/catch-async")
const SOS=require("../modle/sos")
const apierror=require("../util/global-error")
const sms=require("../util/sms")
const APIFeatures=require("../util/apifeatures")
exports.SOSmake=catchAsync(async (req,res,next)=>{
    let sos=await SOS.create(req.body);
    res.status(200).json({status:"success",sos});
});
exports.getSOS=catchAsync(async (req,res,next)=>{
    const features = new APIFeatures(SOS.find(), req.query)
      .filter().or()
      .sort()
      .limitFields()
      .paginate();
    const sos = await features.query;
    res.status(200).json({status:"success",sos});
});
exports.delete=catchAsync(async (req,res,next)=>{
    if(!req.params.id) return next(new apierror("Id param missing",300))
    let sos=await SOS.findByIdAndDelete(req.params.id);
    res.status(200).json({status:"success",sos});
});