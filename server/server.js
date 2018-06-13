const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

// in heroku by default this var process.env.NODE_ENV will have the value production => config=production
// if the app is not deployed in heroku, config = default
const config = require('./config/config').get(process.env.NODE_ENV);

// SERVER CREATION
const app = express();
const port = process.env.PORT || 3000;


// DB
// mongoose doesn't have promisses so we must use the default promomise
// global = nodeJS scope object which contains all nodejS  common properties
// and methods such as require(), module, exports, console...
mongoose.Promise = global.Promise;

// connect to the db
mongoose.connect(config.DATABASE);

const {User} = require('./models/user');

const {auth} = require('./middleware/auth');

// MIDDLEWARE
app.use(bodyParser.json());


// ROUTES

// user registers for the first time - generate user's token so that he can log in
app.post('/api/user', (req, res) => {

    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    user.save((err, doc) => {
        if (err) res.status(400).send(err);

        user.generateToken(

            // send this callback as argument
            // exeecute it only when it's called from inside generateToken()
            (err, user) => {
                if (err) res.status(400).send(err);

                // shouldn't send anything, sending the user is just for testing
                res.header('x-token', user.token).send(user);

        });
    });
});

// login the user - generate teh token after successfull login
app.post('/api/user/login', (req, res) => {
    
    // see if the user's email is in the db
    User.findOne({'email': req.body.email}, (err, user) => {
        if (!user) res.json({message: 'Auth failed. User not found'});

        // user has all the methods that we are using inside the schema, including the comparePassword()
        // the function(...) will be passed through as an argument, and will not run here
        user.comparePassword(req.body.password, function (err, isMatch) {
            if (err) throw err;

            if(!isMatch) return res.json({message: 'Wrong password'});

            // when the user logs in we want to generate a token 
            user.generateToken((err, user) => {
                if (err) throw err;

                // set a custom header x-nameCustomHeaders and send response
                // don't do send(user), do send()
                res.header('x-token', user.token).send(user);
            })
            
        })
    });
});


// restrict user from accessing a route
// auth(req, res, next){...} above will run before this (req, res){...}
app.get('/user/profile', auth, (req, res) => {

     // all ok, sending the user object back to the browser is done just for testing. send() for prod
     res.status(200).send(req.token);
})

// logout - delete the user's token
// auth(req, res, next){...} above will run before this (req, res){...}
app.delete('/user/logout', auth, (req, res) => {

    // use has logged in(because it passes the validation in the auth function)

    req.user.deleteToken(req.token, (err, user) => {
        if (err) return res.status(400).send(err);

        res.status(200).send();
    });
});


// whenever the server is running, call the callback
app.listen(port, () => {
    console.log(`Started on port ${config.PORT}`);
});