const Listing = require("./models/Listing");
const Review = require("./models/review");
const { listingSchema,reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
      //store the url they are requesting
      req.session.redirectUrl=req.originalUrl;
        req.flash('error','You must be logged in to create a new listing!');
       return res.redirect('/login');
      }
        next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
}


module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (!res.locals.currentUser) {
    req.flash("error", "You need to be logged in!");
    return res.redirect("/login");
  }

  if (!listing.Owner.equals(res.locals.currentUser._id)) {
    req.flash("error", "You are not the owner of this listing!");
    return res.redirect(`/listings/${id}`);
  }

  next(); 
};


module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(errMsg, 400);
  } else {
    next();
  }
};


module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(errMsg, 400);
  } else {
    next();
  }
};



module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect("/listings");
  }

  if (!res.locals.currentUser) {
    req.flash("error", "You need to be logged in!");
    return res.redirect("/login");
  }

  if (!review.author.equals(res.locals.currentUser._id)) {
    req.flash("error", "You are not the author of this review!");
    return res.redirect(`/listings/${id}`);
  }

  next(); 
};
