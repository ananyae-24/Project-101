const express = require("express");
const cookie_parser=require("cookie-parser")
const user_router=require("./router/user_router");
const error=require("./controllers/error")
const app=express();
app.use(cookie_parser());
app.use(express.json({ limit: '10kb' }));
app.use("/api/v1/user",user_router);
app.use(error);
module.exports = app;
