/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable no-undef */
const  mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto =  require('crypto');
const userSchema = new mongoose.Schema({

    name: {
        type : String,
        trim : true,
        required: [true,"Name is Required"]
    },
    email: {
        type: String,
        trim: true,
        required: [true,"Email is Required"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide valid email"]
    },
    role: {
        type: String,
        enum: ["user", 'guide','lead-guide','admin'],
        default: 'user'
    },
    photo: String,
    x: {
        type: Number
    },
    password:{
        type: String,
        trim : true,
        required: [true,"Password is Required"],
        minlength: 8,
        select: false
    },
    confirmPassword:{
        type: String,
        required: [true, "Please confirm your passowrd"],
        validate : {
            validator : function(el){
                return el===this.password;
            },
            message: "Password Should be same"
        }
     
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken : String,
    passwordResetExpires: Date
    
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.confirmPassword = undefined;
    next();
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")||this.isNew) return next();

    this.passwordChangedAt = Date.now()-1000;
   
    next();
})
userSchema.pre(/^find/, function(next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});


userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return  bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPassword = function(JWTTimestamp){
    
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000, 10);
        
        return JWTTimestamp< changedTimeStamp ;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken  =crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10*60*1000;

    console.log((resetToken), (this.passwordResetToken))
    return resetToken;
}

const User = mongoose.model("User", userSchema);

module.exports = User;