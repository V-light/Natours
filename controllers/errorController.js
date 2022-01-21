const AppError = require('./../utis/appError');


const sendErrorDev =(err, res)=>{
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack : err.stack
      });
}

const sendErrorProd = (err, res)=>{
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      }); 
}


const handleCastError = (err)=>{
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDublicateErrorDB= (err)=>{
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Dublicate Field Value : ${value}`;

    return new AppError(message,400)
}
const handleValidationError= err =>{
    const error = Object.values(err.errors).map(el => el.message);


    const message = `Invalid input Data ${error.join('. ')}`;
    return new AppError(message , 400);
}

const handleJWTError = err=>{
    return new AppError("Invalid token. Please login again", 401);
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    // if(process.env.NODE_ENV ==='developement'){
    //     sendErrorDev(err, res);
    // }else if(process.env.NODE_ENV==='production'){
    //     sendErrorProd(err, res);
    // }
  

    if(err.name ==='CastError'){
        err =  handleCastError(err);
    }
    if(err.code === 11000){
        err = handleDublicateErrorDB(err);
    }

    if(err.name === "ValidationError"){
        err = handleValidationError(err)
    }
    if(err.name ==="JsonWebTokenError"){
        err = handleJWTError(err);
    }
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack : err.stack
      });

  };