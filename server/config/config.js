const config = {
    // Heroku env variables
    production: {
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI,
        PORT: process.env.PORT
    },
    default: {
        SECRET: 'DFASFAS',
        DATABASE: 'mongodb://localhost:27017/auth',
        PORT: 3000
    }
}

exports.get = function get(env) {

    // return the medium specified by the user or the default configuration
    return config[env] || config.default;
}