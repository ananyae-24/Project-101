const catchAsync=require("../util/catch-async")
const User=require("../modle/User")
const apierror=require("../util/global-error")
const mailer=require("../util/mailer")
const sms=require("../util/sms")
exports.activateaccount=catchAsync(async (req,res,next)=>{
    let token=req.params.token;
    let email=req.params.email;
    //console.log(token,email)
    let user=await User.findOne({email,validtill:{$gte:Date.now()}})
    if (!user) return next(new apierror("The token expired",300))
    if (! await user.comparetoken(token,user.token)) return next(new apierror("The token expired",300))
    user.active=true;
    user.token=null;
    user.validtill=null;
    user.save({validateBeforeSave:false});
    res.status(200).json({status:"success",data:{user}})
})
exports.activateaccount_no=catchAsync(async (req,res,next)=>{
    let token=req.params.token;
    let number=req.params.number;
    
    let user=await User.findOne({number,validtill:{$gte:Date.now()}})
   
    if (!user) return next(new apierror("The token expired",300))
    if (! await user.comparetoken(token,user.token)) return next(new apierror("The token expired",300))
    user.active_no=true;
    user.token=null;
    user.validtill=null;
    user.save({validateBeforeSave:false});
    res.status(200).json({status:"success",data:{user}})
})
exports.signup=catchAsync(async (req,res,next)=>{
    /// check theat mail is given in req body
    
    if (!req.body.email && !req.body.number) return next(new apierror("Email/Number required",300));
    if (req.body.active || req.body.active_no) {req.body.active=false;req.body.active_no=false;}
    if (req.body.role) req.body.role="user";
    /// find if the user already exist in db
    if(req.body.email){
    let user=await User.findOne({email:req.body.email})
    if (user)
    {
        if (user.active==true) return next(new apierror("The user already exists",300))
        else user = await User.deleteOne({_id:user._id},(err)=>console.log(err));
    }
    /// make new user
    user=await User.create(req.body);
    let token =await user.generatetoken();
    await user.save({ validateBeforeSave: false });
    let url=""
    try{
        await new mailer(user,url,token).welcomemail();
        res.status(200).json({
            status:"success",
            message:"mail sent"
        })
    }
    catch(err){
        await User.findByIdAndDelete(user._id)
        res.status(500).json({
            message:err,status:"fail"})
    }}
    if(req.body.number){
        let user=await User.findOne({number:req.body.number})
    if (user)
    {
        if (user.active) return next(new apierror("The user already exists",300))
        else  await User.deleteOne({_id:user._id},(err)=>console.log(err));
        
    }
    user=await User.create(req.body);
    let token =await user.generateotp();
    await user.save({ validateBeforeSave: false });
    try{
        await new sms(user,token).send();
        res.status(200).json({
            status:"success",
            message:"sms sent"
        })
    }
    catch(err){
        await User.findByIdAndDelete(user._id)
        res.status(500).json({
            message:err,status:"fail"})
    }
    }
})
exports.activatenumber=catchAsync(async (req,res,next)=>{
    let user= await User.findById(req.body._id)
    if(user.active_no) return next(new apierror("The number is already verified",300))
    let token =await user.generateotp();
    await user.save({ validateBeforeSave: false });
    try{
        await new sms(user,token).send();
        res.status(200).json({
            status:"success",
            message:"sms sent"
        })
    }
    catch(err){
        await User.findByIdAndDelete(user._id)
        res.status(500).json({
            message:err,status:"fail"})
    }

})