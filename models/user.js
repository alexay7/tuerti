module.exports = function (sequelize, Sequelize) {

    var User = sequelize.define('user', {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        firstname: {
            type: Sequelize.STRING,
            notEmpty: true
        },
        lastname: {
            type: Sequelize.STRING,
            notEmpty: true
        },
        gender: {
            type: Sequelize.ENUM('m', 'f', 'o')
        },
        occupation: {
            type: Sequelize.ENUM('school', 'college', 'working')
        },
        university: {
            type: Sequelize.BOOLEAN
        },
        admin: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        avatar: {
            type: Sequelize.STRING,
            defaultValue: "default"
        },
        visits: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        status: {
            type: Sequelize.TEXT('tiny'),
            defaultValue: 'Soy nuevo en Tuenti!'
        },
        email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true
            }
        },
        city: {
            type: Sequelize.STRING,
            notEmpty: true
        },
        country: {
            type: Sequelize.STRING,
            notEmpty: true
        },
        web: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        last_activity: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        birthday: {
            type: Sequelize.DATE,
            notEmpty: true
        },
        status_change: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    });

    return User;

}