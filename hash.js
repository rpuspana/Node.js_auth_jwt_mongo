const bcrypt = require('bcrypt');
const {MD5} = require('crypto-js');
const jwt = require('jsonwebtoken');

// how to hash a password with method provided by decrypt

// create salt
// p1 - how many times teh salt will be generated to increase randomnesss
// p2 = callback, with the error and the generated salt
// bcrypt.genSalt(10, (err, salt) => {
//     console.log(salt);

//     if (err) return next(err);

//     // err = error when generating hash, hash = the hashed password    
//     bcrypt.hash('password123', salt, (err, hash) => {
//         if (err) return next(err);

//         console.log(hash);
//     })
// })


// ### JWT theory ###

// password only we know
// const secret = 'supersecretpassword';

// // salt the seecret
// const secretSalted = 'lsdjbvlajbfavifabdfadv8';

// var user = {
//     id: 1,

//     // create token with MD5 encryption
//     token: MD5('password123').toString() + secretSalted
// }

// const receivedToken = '482c811da5d5b4bc6d497ffa98491e38lsdjbvlajbfavifabdfadv8';

// if (receivedToken === user.token) {
//     console.log('move forward');
// }

// console.log(user.token);


// ### JWT practice ###

// payload = id of user
const id = '1000';

// secret password
const secret = 'supersecretpassword';


// encoding = singn()

// eccypt and give the token
const token = jwt.sign(id, secret); 

console.log(token);


// decoding = verify()

const receivedToken = 'eyJhbGciOiJIUzI1NiJ9.MTAwMA.GT8hJlOFah8ifZJ1UG4JhsnYQqfheH4q2sdAvGRAGSc'

// grab the token that the user's browser is providing
// see if the token is correct and the secret is correct
const decodeToken = jwt.verify(receivedToken, secret);

// const decodeToken = jwt.verify(receivedToken, secret + 'g');
// => JsonWebTokenError: invalid signature

console.log(decodeToken);