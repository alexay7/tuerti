module.exports = function (sequelize, Sequelize) {

    var UserBlog = sequelize.define('userblog', {
        id: {
            autoIncrement: true,
            primaryKey: true,
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
            type: Sequelize.ENUM('video', 'text', 'image')
        },
        content: {
            type: Sequelize.TEXT('tiny')
        }
    });

    return UserBlog;

}