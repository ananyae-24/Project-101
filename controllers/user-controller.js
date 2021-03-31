const catchAsync=require("../util/catch-async")
const User=require("../modle/User")
const apierror=require("../util/global-error")
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
})