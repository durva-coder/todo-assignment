/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    name: {
      type: "string",
      required: true,
    },
    email: {
      type: "string",
      required: true,
      unique: true,
      isEmail: true,
    },
    password: {
      type: "string",
      required: true,
      custom: function (value) {
        // • be a string
        // • be at least 8 characters long
        // • contain at least one number
        // • contain at least one letter
        return (
          _.isString(value) &&
          value.length >= 8 &&
          value.match(/[a-z]/i) &&
          value.match(/[0-9]/)
        );
      },
    },
    auth_token: {
      type: "string",
      required: false,
      allowNull: true,
    },
    todos: {
      collection: "todo",
      via: "user_id",
    },
  },
};
