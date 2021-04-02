const catchAsync=require("../util/catch-async")
const User=require("../modle/User")
const apierror=require("../util/global-error")
const APIFeatures=require("../util/apifeatures")
exports.changepassword=catchAsync(async (req,res,next)=>{
    let {password,confirmPassword,email,number,token}=req.body;
    if(!email && !number)return next(new apierror("Invalid inputs",300))
    if(email){
        let user=await User.findOne({email,validtill:{$gte:Date.now()},active:true}).select('+password +passwordChangedAt +confirmPassword')
        if(!user)return next(new apierror("The OTP expired",300))
        if (!await user.comparetoken(token,user.token))return next(new apierror("Invalid OTP enterd",300))
     
        user.password=password;
        user.confirmPassword=confirmPassword;
        user.passwordChangedAt=Date.now();
        user.validtill=null;
        user.token=null;
        await user.save({validateBeforeSave:true});
        res.status(200).json({status:"success",message:"Your password has been changed"})
    }
    else if (number){
        let user=await User.findOne({number,active:true,validtill:{$gte:Date.now()}}).select('+password +passwordChangedAt +confirmPassword')
        if(!user)return next(new apierror("The OTP expired",300))
        if (!await user.comparetoken(token,user.token))return next(new apierror("Invalid OTP enterd",300))
        user.password=password;
        user.confirmPassword=confirmPassword;
        user.passwordChangedAt=Date.now();
        user.validtill=null;
        user.token=null;
        user.save({validateBeforeSave:true});
        res.status(200).json({status:"success",message:"Your password has been changed"})
    }
});
exports.updateuser=catchAsync(async (req,res,next)=>{
    
    delete req.body.password;
    delete req.body.email;
    delete req.body.number;
    delete req.body.active
    delete req.body.active_no;
    delete req.body.role;

    let _id=req.params.id;
    if(req.body.location){
        let [lat,long]=req.body.location.split(",");
        if(!lat ||!long)
        return next(new apierror("invalid inputs to location",300))
        req.body.location = {type:"Point",coordinates:[long,lat]}
        
    }
    let user=await User.findOneAndUpdate({_id},req.body,{
        returnOriginal: false
      });
   if(!user)return next(new apierror("user doesnot exist",300))
    res.status(200).json({status:"success",data:{user}})
});
exports.getUser=catchAsync(async (req,res,next)=>{
    let user=await User.findById(req.params.id);
    if(!user)return next(new apierror("user doesnot exist",300))
    res.status(200).json({status:"success",data:{user}})
})
exports.AllUser=catchAsync(async(req,res,next)=>{
    const features = new APIFeatures(User.find(), req.query)
      .filter("location")
      .sort()
      .limitFields()
      .paginate();
    const users = await features.query;
  
    res.status(200).json({status:"success",data:{users}})
})