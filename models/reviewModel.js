const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "review is required"]
    },
    rating:{
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour:{
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, 'Review must belong to tour']
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Review must belong to User"]
    }
}, 
{
    toJSON : {virtuals: true},
    toObject : {virtuals: true},
});

reviewSchema.pre(/^find/, function(next) {
    // this points to the current query
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
  });

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;