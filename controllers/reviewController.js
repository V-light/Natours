const Review = require("../models/reviewModel");
const catchAsync = require("./../utis/catchAsync");
const  AppError = require("./../utis/appError");


exports.getAllReview = catchAsync( async(req, res, next)=>{
    const review = await Review.find();

    res.status(200).json({
        status: 'success',
        data :  {
            review

        }
    })
})
exports.createReview = catchAsync( async( req, res, next)=>{
    if(!req.body.tour){
        req.body.tour = req.params.tourId;
    }
    if(!req.body.user){
        req.body.user = req.user.id
    }
    const review =  await Review.create(req.body);

    res.status(200).json({
        status: 'success',
        data:{
            review 
            
        }
    })
});
