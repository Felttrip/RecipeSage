'use strict';
module.exports = (sequelize, DataTypes) => {
  const MealPlan = sequelize.define('MealPlan', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    title: DataTypes.STRING
  }, {});
  MealPlan.associate = function(models) {
    MealPlan.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'owner',
      onDelete: 'CASCADE',
    });

    MealPlan.belongsToMany(models.User, {
      foreignKey: 'mealPlanId',
      otherKey: 'userId',
      as: 'collaborators',
      through: 'MealPlan_Collaborator',
    });

    MealPlan.hasMany(models.MealPlanItem, {
      foreignKey: 'mealPlanId',
      as: 'items'
    });
  };
  return MealPlan;
};
