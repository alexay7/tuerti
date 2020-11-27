module.exports = function(sequelize, Sequelize) {

    var Event = sequelize.define('event', {
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
        name: {
            type: Sequelize.STRING,
            notEmpty: true
        },
        created: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        target: {
            type: Sequelize.DATE,
            notEmpty: true
        },
        description: {
            type: Sequelize.TEXT,
            notEmpty: true
        },
        type: {
            type: Sequelize.ENUM('event', 'birthday', 'sponsored')
        },
        place: {
            type: Sequelize.STRING
        },
        direction: {
            type: Sequelize.STRING
        },
        allday: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        webpage: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        },
        privacy: {
            type: Sequelize.ENUM('private', 'public'),
            defaultValue: "public"
        }
    });

    return Event;

}