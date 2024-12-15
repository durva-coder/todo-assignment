/**
 * ToDo.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    title: {
      type: "string",
      required: true,
      unique: true,
    },
    description: {
      type: "string",
      allowNull: true,
    },
    state: {
      type: "string",
      isIn: ["completed", "incomplete"],
      defaultsTo: "incomplete",
    },
    is_deleted: {
      type: "boolean",
      defaultsTo: false,
    },
    user_id: {
      model: "user",
      required: true,
    },
  },
};
