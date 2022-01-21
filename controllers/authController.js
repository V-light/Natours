/* eslint-disable arrow-body-style */
const User = require("../models/userModel");
const catchAsync = require("./../utis/catchAsync");
const jwt = require("jsonwebtoken");
const  AppError = require("./../utis/appError");
const  sendEmail = require("./../utis/email");
const crypto =  require('crypto');

const {promisify} = require('util')
const signToken = id =>{
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn : "90d"
    });
}
exports.signup = catchAsync(async(req, res, next)=>{
    
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        confirmPassword: req.body.confirmPassword,
        passwordChangedAt: req.body.passwordChangedAt
    });
    // const newUser = await User.create(req.body);
    const token = signToken(newUser._id);

    
    res.status(201).json({
        status: "Success",
        token,
        data: {
            user: newUser
        }
    })
    
})

exports.login = catchAsync (async (req, res, next)=>{

    const {email, password} = req.body;

    if(!email||!password){
       return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({email}).select('+password');
    

    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Incorrect email or password', 401)); 
    }

    const token = signToken(user.id);
    res.status(200).json({
        status: "success",
        token
    });
});

exports.protect = catchAsync(async (req, res , next)=>{

    let token;
    
    if(req.headers.authorization&&req.headers.authorization.startsWith("Bearer")){
       
        token =   req.headers.authorization.split(' ')[1];
    }
    

    if(!token){
        return next(new AppError("You are not logged in please log in", 401));
    }
    
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    

    const freshUser = await User.findById(decoded.id);

    if(!freshUser){
        return next(new AppError("The token does no longer exists", 401))
    }
    
    if(freshUser.changedPassword(decoded.iat)){
        return next(new AppError("Password Changed!!Login Again", 401));
    }

    req.user = freshUser;
    
    next();
})

exports.restrictTo= (...roles)=>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return next(new AppError("you do not have permission to perform this action", 403));
        }

        next();
    }
};

exports.forgotPassword = catchAsync (async(req, res, next)=>{
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new AppError("User does not exist with that email adress", 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    
    const resetURL = `${req.protocol}//:${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message  = `Forgot your password? submit a patch request with your new password and password confirm to ${resetURL} if didn't forgot password ignore mail`;
    try{
        await sendEmail({
            email: user.email,
            subject: "Your password token is valid for 10 minutes",
            message 
        });
    
        res.status(200).json({
            status: "success",
            message: 'Token sent to mail'
        })
    }catch(err){
        user.psswordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError("There was an error in sending mail . Try again"));

    }



});

exports.resetPassword = catchAsync( async(req, res, next)=>{
    const hashedToken =  crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({passwordResetToken: hashedToken,passwordResetExpires: {$gt: Date.now()}});

    if(!user){
        return next(new AppError("Token is invalid or Expired", 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = signToken(user.id);
    res.status(200).json({
        status: "success",
        token
       
    });


});

exports.updatePassword = catchAsync( async (req, res, nex)=>{
    const user = await User.findById(req.user.id).select("+password");

    if(! (await user.correctPassword(req.body.currentPassword, user.password))){
        return next(AppError("Currenr Password is wrong", 401));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    const token = signToken(user.id);
    res.status(200).json({
        status: "success",
        token
       
    });

});