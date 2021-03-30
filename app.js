const express = require("express");
const user_router=require("./router/user_router");
const error=require("./controllers/error")
const app=express();
app.use(express.json({ limit: '10kb' }));
app.use("/api/v1/user",user_router);
app.use(error);
module.exports = app;
