const express = require("express");
const apierror=require("./util/global-error")
const compression = require('compression');
const ratelimiter = require('express-rate-limit');
const mongosanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
const helmet = require('helmet');
const hpp = require('hpp');
const cors=require('cors');
const cookie_parser=require("cookie-parser")
const user_router=require("./router/user_router");
const problem_router=require("./router/problem_router")
const covid_router=require("./router/covid_router");
const error=require("./controllers/error")
/////////////////////
const limiter = ratelimiter({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'too many request',
  });
///////////////////
const app=express();
app.use(cors());
app.set('view engine', 'pug');
app.use(cookie_parser());
app.use(express.json({ limit: '10kb' }));
app.use("/public/images",express.static(path.join(__dirname, '/public/images')));
app.use(mongosanitize());
app.use(xss());
app.use(helmet());
app.use(
  hpp({
    whitelist: ['name', 'email', 'post'],
  })
);
///////////////////////////////
app.use("/api/v1/user",user_router);
app.use("/api/v1/problem",problem_router);
app.use("/api/v1/covid",covid_router);
app.all('*', (req, res, next) => {
   console.log(req.url)
    return next(new apierror('invalid api request', 400));
  });
app.use(error);
module.exports = app;
