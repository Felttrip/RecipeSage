'use strict';
module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    location: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    key: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    json: {
      allowNull: false,
      type: DataTypes.JSONB,
    }
  }, {});
  Image.associate = function(models) {
    Image.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        allowNull: false
      },
      onDelete: 'CASCADE',
    });

    Image.belongsToMany(models.Recipe, {
      foreignKey: 'imageId',
      otherKey: 'recipeId',
      as: 'recipes',
      through: models.Recipe_Image
    });
  };
  return Image;
};
