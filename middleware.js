const Listing = require("./models/listing");
const Review = require("./models/reviews");
const CustomError = require("./utils/CustomError.js");
const {listingSchema, reviewSchema} = require("./schema.js");

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new CustomError(400, error);
    } else {
        next();
    }
};


module.exports.validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error)
    {
        throw new CustomError(400,error);
    }
    else{
        next();
    }
}

module.exports.isLoggedIn = (req,res,next) => {
    //console.log(req.user); contains info about user from session -> it's empty , if user is not signed in, contains user's info accod to schema if user is logged in  
    if(!req.isAuthenticated())
    {
        req.session.redirectUrl = req.originalUrl;//req.originalUrl contains the path the user was trying to access before it got redirected to the login page. we are storing this url in sessions object as redirectUrl, where we want to redirect our url
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {//passport after login resets the sessions objects to eretain the redirectUrl , save it to locals
    if(req.session.redirectUrl)
    {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req,res,next) => {
   let {id} = req.params;
   let listing = await Listing.findById(id);
   if(!listing.owner._id.equals(res.locals.currUser._id))
    {
        req.flash("error", "You are not owner of this listing.");
        return res.redirect(`/listings/${id}`);
    } 
    next();
}

module.exports.isReviewAuthor = async(req,res,next) => {
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id))
     {
         req.flash("error", "You are not author of this review.");
         return res.redirect(`/listings/${id}`);
     } 
     next();
 }

