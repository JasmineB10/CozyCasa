const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");
//router.use(upload.single("image"));

//show all listings-> index route
//create a new listing
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn,  upload.single("image"), validateListing, wrapAsync(listingController.createListing));


//send new listing form
router.get("/new", isLoggedIn, listingController.renderNewForm);

//show particular listing
router.get("/:id", wrapAsync(listingController.showListing));

//edit listing form
//edit existing list
router
  .route("/edit/:id")
  .get(isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm))
  .put(isLoggedIn, isOwner, upload.single("image"), validateListing, wrapAsync(listingController.updateListing));


//delete listing
router.delete("/delete/:id", isLoggedIn, isOwner, listingController.destroyListing);

module.exports = router;