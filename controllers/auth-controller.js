const catchAsync=require("../util/catch-async")
const User=require("../modle/User")
const apierror=require("../util/global-error")
const mailer=require("../util/mailer")
const sms=require("../util/sms")
const jwt=require("jsonwebtoken")
const { promisify } = require('util');
exports.activateaccount=catchAsync(async (req,res,next)=>{
    let token=req.params.token;
    let email=req.params.email;
    //console.log(token,email)
    let user=await User.findOne({email,validtill:{$gte:Date.now()}}).select("+passwordChangedAt")
    if (!user) return next(new apierror("The token expired",300))
    if (! await user.comparetoken(token,user.token)) return next(new apierror("The token expired",300))
    user.active=true;
    user.token=null;
    user.validtill=null;
    user.passwordChangedAt=Date.now();
    user.save({validateBeforeSave:false});
    res.status(200).json({status:"success",data:{user}})
})
exports.activateaccount_no=catchAsync(async (req,res,next)=>{
    let token=req.params.token;
    let number=req.params.number;
    
    let user=await User.findOne({number,validtill:{$gte:Date.now()}}).select("+passwordChangedAt")
   
    if (!user) return next(new apierror("The token expired",300))
    if (! await user.comparetoken(token,user.token)) return next(new apierror("The token expired",300))
    user.active_no=true;
    user.token=null;
    user.validtill=null;
    user.passwordChangedAt=Date.now();
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
    if(req.body.number)
    delete req.body.number
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
    else{
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
    let number=req.body.number;
    let user= await User.findById(req.body._id);
    let old_number=user.number;
    if(user.active_no && old_number==number) return next(new apierror("The number is already verified",300))
    user.number=number;user.active_no=false;
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
        user.token=null;
        user.validtill=null;
        user.number=old_number;
        active_no=true;
        user.save({validateBeforeSave:false});
        res.status(500).json({
            message:err,status:"fail"})
    }

})
exports.login=catchAsync(async(req,res,next)=>{
    console.log(req.body)
let {email,password,number}=req.body
    console.log(email,password,number)
    if (!email&&!number) return next(new apierror("Invalid  request",300))
    let user=''
    if(email)
    user=await User.findOne({email,active:true}).select("+password");
    else if (number)
    user=await User.findOne({email,active_no:true}).select("+password");
    if (!user) return next(new apierror("Incorrect password or Email/Number"))
    
    if(!await user.correctPassword(password,user.password)) return next(new apierror("Incorrect password or Email/Number"))
    let token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_TIME,
      });
      res.cookie('jwt', token, {
        expires: new Date(Date.now + process.env.COOKIE_EXP * 60 * 24 * 60 * 1000),
        secure: false,
        httpOnly: true,
      });
      res.status(200).json({ status: 'success', data:{token} });
})
exports.isProtected = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization) {
      if (req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }
    }
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
  
    if (!token) return next(new apierror('not logged in', 401));
    const data = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    let user = await User.findById(data._id);
    
    //  console.log(user,"isProtected");
    if (!user)
      return next(new apierror('user was deleated please login again', 401));
    if (await user.changepassword(data.iat))
      return next(new apierror('password was changed please login again', 401));
    req.user = user;
    next();
  });
  exports.restrictTo = (options) => {
    return (req, res, next) => {
      if (!options.includes(req.user.role))
        return next(
          new apierror('You are not allowed to access this route', 400)
        );
      next();
    };
  };
exports.forgetpassword=catchAsync(async (req,res,next)=>{
    let val=req.params.value;
    let email=null;
    let number=null;
    if (isNaN(val))
    email=val;
    else 
    number=val;
    if(!email && !number) return next(new apiError("Invalid request",300))
    if(email){
      user=await User.findOne({email,active:true})
      if (!user)return next(new apierror("The user does not exist",300))
      token=await user.generatetoken()
      await user.save({ validateBeforeSave: false });
      try{
          await new mailer(user,"",token).forgetpassword();
          res.status(200).json({status:"success",message:"Mail sent"})
      }catch(err){
        user.token=null;
        user.validtill=null;
        user.save({validateBeforeSave:false});
        res.status(500).json({
            message:err,status:"fail"})
      }
    }
    else if (number){
        user=await User.findOne({number,active_no:true})
      if (!user)return next(new apierror("The user does not exist",300))
      token=await user.generateotp()
      await user.save({ validateBeforeSave: false });
      try{
        await new sms(user,token).send();
        res.status(200).json({
            status:"success",
            message:"sms sent"
        })
    }
    catch(err){
        user.token=null;
        user.validtill=null;
        user.save({validateBeforeSave:false});
        res.status(500).json({
            message:err,status:"fail"})
    }
    }
})