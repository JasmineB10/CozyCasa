const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken : mapToken});
module.exports.index = async(req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings})
};

module.exports.renderNewForm = (req,res)=> {
    res.render("listings/newListing.ejs");
};

module.exports.showListing = async(req,res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: 'reviews',
        populate: {
            path: "author"
        }
    });
    if(!listing){
        req.flash("error", "Listing you requested for doesn't exist.");
        res.redirect("/listings");
    }
    else
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async(req,res,next) => {

    let response = await geocodingClient.forwardGeocode({
        query: req.body.location+","+req.body.country,
        limit: 1
      })
      .send();
      console.log(req.body);
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        location: req.body.location,
        country : req.body.country,
        owner: req.user._id
    });
    newListing.image = {url,filename}; 
    newListing.geometry = response.body.features[0].geometry; 
     
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async(req,res) => {
    let {id} = req.params;
    const editList = await Listing.findById(id);
    if(!editList)
    {
        req.flash("error", "Listing you requested for doesn't exist.");
        res.redirect("/listings");
    }
    let originalUrl = editList.image.url;
    originalUrl.replace("/upload", "/upload/q_70/h_250/w_250");
    res.render("listings/edit.ejs", {editList, originalUrl});
};

module.exports.updateListing = async(req,res) => {
    let{id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body});
    
    if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
    
};