module.exports = function(sequelize, Sequelize) {

    var EventGuest = sequelize.define('eventguest', {
        guestId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        eventId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'events',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        promise: {
            type: Sequelize.ENUM('none', 'yes', 'maybe'),
            defaultValue: "none"
        },
        notifications: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        }
    });

    return EventGuest;

}