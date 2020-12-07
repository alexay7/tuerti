var dotenv = require('dotenv');
dotenv.config();

module.exports = {
    config: {

        "development": {

            "username": process.env.DB_USER,

            "password": process.env.DB_PASS,

            "database": process.env.DB_NAME,

            "host": process.env.DB_HOST,

            "dialect": "mysql",

            "logging": false

        },

        "test": {

            "username": "",

            "password": null,

            "database": "",

            "host": "",

            "dialect": "mysql"

        },

        "production": {

            "username": "",

            "password": null,

            "database": "",

            "host": "127.0.0.1",

            "dialect": "mysql"

        }

    }
}