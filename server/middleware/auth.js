// MIDDLEWARE FOR THE USER AUTHENTICATION

const {User} = require('./../models/user');

// middleware - we must use next()
let auth = (req, res, next) => {

    // get the token from the header
    const token = req.header('x-token');

    // send (err, user){} callback to findByToken()
    User.findByToken(token, (err, user) => {
        if (err) throw err;

        if (!user) return res.status(400).send();

        // add a variable called user to the request and store the actual user there
        req.token = token;

        req.user = user;

        // go to the next line in the app aka call the callback (req, res) => {}
        // inside GET request for route /user/profile 
        next();
    });
}

// export the function
module.exports = {auth};