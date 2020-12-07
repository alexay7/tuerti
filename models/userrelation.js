module.exports = function(sequelize, Sequelize) {

    var UserRelation = sequelize.define('userrelation', {
        userOneId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        userTwoId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        status: {
            type: Sequelize.ENUM('friends', 'pending', 'blocked')
        }
    });

    return UserRelation;

}