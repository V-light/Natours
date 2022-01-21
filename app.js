const express = require("express");
const morgan = require("morgan");
const TourRouter = require("./routes/tourRoutes");
const UserRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const appError = require("./utis/appError");
const globalErrorHandler = require('./controllers/errorController');


//  1) MIDDLEWARE
const app = express();

if (process.env.NODE_ENV === "developement") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next)=>{
  
  
  next();
})

app.use("/api/v1/tours", TourRouter);
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/reviews", reviewRouter);

app.get("*", (req, res, next) => {
  
//   const err = new Error(`url  ${req.originalUrl} is not found`);
//   err.statusCode = 404;
//   err.status = "fail";

  next(new appError(`url  ${req.originalUrl} is not found`), 404);
});

app.use(globalErrorHandler);
module.exports = app;
