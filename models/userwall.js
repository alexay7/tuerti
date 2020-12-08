module.exports = function (sequelize, Sequelize) {

    var UserWall = sequelize.define('userwall', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        ownerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        writerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        parentId: { // if it is a post or comment
            type: Sequelize.INTEGER,
            references: {
                model: 'userwalls',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        content: {
            type: Sequelize.TEXT,
            notEmpty: true
        },
        type: {
            type: Sequelize.ENUM('status', 'comment', 'response', 'post')
        }
    });

    return UserWall;
}