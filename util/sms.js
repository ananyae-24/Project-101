const twilio=require("twilio")
module.exports=class SMS{
 constructor(user,OTP){
     this.otp=OTP;
     this.to=user.number;
     this.accountSid=process.env.TWILIO_ACCOUNT_SID;
     this.authToken = process.env.TWILIO_AUTH_TOKEN;
 }
 async send(){
    const client = twilio(this.accountSid, this.authToken);
    await client.messages.create({
     body: `your one time password is ${this.otp}`,
     from: process.env.NUMBER,
     to: `+91${this.to}`
   });
 }
}