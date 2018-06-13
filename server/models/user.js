const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// in heroku by default this var process.env.NODE_ENV will have the value production => config=production
// if the app is not deployed in heroku, config = default
const config = require('./../config/config').get(process.env.NODE_ENV);

// salt iteration
const SALT_I = 10

const userSchema = mongoose.Schema({
    email: {
        type: String,
        require: true,
        trim: true,

        // prevent duplicate emails in teh db, 1=true
        unique: 1
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    // user has only one token to enter a restricted area
    token: {
        type: String,
        require: true
    }
});

// run before 'save'-ing
// encrypt user password
// Middleware (also called pre and post hooks) are functions which are passed control during execution of asynchronous functions
// in document middleware functions, this refers to the document.
userSchema.pre('save', function(next) {

    // this = user send in the request body
    var user = this
    console.log(`!!!!!!!!! user !!!!! ${this}`);

    // check if the password was changed
    if (user.isModified('password')) {

        // password was changed

        // generate teh salt
        bcrypt.genSalt(SALT_I, function(err, salt) {

            // next(err) move to the next line of code and pass the error
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err);

                // grab the hash and store it as a password
                user.password = hash;

                // move forward in the app to the next line of code
                next();
            });
        });
    }
    // the password was not changed
    else {
        // move forward in the app to the next line of code
        next();
    }

});

// candidatePassword = user entered password in the form
// cb = a function that will be passed
userSchema.methods.comparePassword = function(candidatePassword, cb) {

    // this = userSchema
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {

        // call the function function (err, isMatch) inside app.post(), passing err as the only argument
        if (err) return cb(err);

        // call the function function (err, isMatch) inside app.post(), passing null and isMatch
        cb(null, isMatch);
    })
}

// generate user password
// cb = callback function passed as argument
userSchema.methods.generateToken = function(cb) {

    // this = user
    let user = this;

    // generate token
    // 'supersecret' = secret password
    let token = jwt.sign(user._id.toHexString(), config.SECRET);

    user.token = token;

    // save thse user
    user.save((err, user) => {

        // in case of err during save, pass the error when calling cb
        if (err) return cb(err);

        // in case of success, pass the user object to the cb
        cb(null, user);
    })
}

userSchema.statics.findByToken = function(token, cb) {

    // this = user
    const user = this;

    // verify token async
    // decode = the decoded user id
    jwt.verify(token, config.SECRET, (err, decode) => {

        // if there are no errors, find the id and the token
        // search for a user
        // after the search is done return an error or the found user document
        user.findOne({'_id': decode, 'token': token}, (err, user) => {
            if (err) return cb(err);

            // call the function passed as a parameter
            cb(null, user);
        })
    })
}

userSchema.methods.deleteToken = function(token, cb) {

    const user = this;

    // remove property token and it's value from the current user document
    user.update({$unset: {token:1}}, (err, doc) => {
        if (err) return cb(err);

        cb(null, doc);
    })
}

const User = mongoose.model('User', userSchema);

module.exports = {
    User
};