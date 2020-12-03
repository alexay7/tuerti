module.exports = function (sequelize, Sequelize) {

    var UserBlog = sequelize.define('userblog', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        index: {
            type: Sequelize.INTEGER
        },
        ownerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { // User belongsTo Company 1:1
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        title: {
            type: Sequelize.STRING,
            notEmpty: true
        },
        type: {
            type: Sequelize.ENUM('youtube', 'text')
        },
        content: {
            type: Sequelize.TEXT('tiny')
        }
    });

    return UserBlog;

}