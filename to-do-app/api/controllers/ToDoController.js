/**
 * ToDoController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const ToDo = require("sails").models.toDo;

module.exports = {
  // create
  createToDo: async function (req, res) {
    try {
      const userId = req.userData.id;

      const { title, description } = req.body;

      // Validate required fields
      if (!title) {
        return res.status(400).json({
          status: 400,
          data: {},
          err: sails.__("Validation.ToDoMissingFields"),
        });
      }

      // Check if todo already exists
      const findToDo = await ToDo.findOne({
        title: title,
        user_id: userId,
        is_deleted: false,
      });

      if (findToDo) {
        return res.status(400).json({
          status: 400,
          data: {},
          err: sails.__("ToDo.AlreadyExists"),
        });
      }

      const toDoCreate = {
        title: title,
        user_id: userId,
      };

      if (description) {
        toDoCreate.description = description;
      }

      // Create the todo
      const toDo = await ToDo.create(toDoCreate).fetch();

      // Respond with the created todo
      return res.status(201).json({
        status: 201,
        data: toDo,
        msg: sails.__("ToDo.CreatedSuccessfully"),
      });
    } catch (err) {
      console.error("Create error:", err);

      // Handle errors gracefully
      return res.status(500).json({
        status: 500,
        data: {},
        err: sails.__("Server.ErrorOccurred"),
      });
    }
  },

  // update
  updateToDo: async function (req, res) {
    try {
      const userId = req.userData.id;
      const { id } = req.params;
      const { title, description, status } = req.body;

      // Check if todo already exists
      const findToDo = await ToDo.findOne({ _id: id, is_deleted: false });

      if (!findToDo) {
        return res.status(400).json({
          status: 400,
          data: {},
          err: sails.__("ToDo.NotExist"),
        });
      }

      const toDoUpdate = {
        user_id: userId,
      };

      if (title) {
        const duplicateToDo = await ToDo.findOne({
          title,
          id: { "!=": id }, // Exclude the current document
          user_id: userId,
          is_deleted: false,
        });

        if (duplicateToDo) {
          return res.status(400).json({
            status: 400,
            data: {},
            err: sails.__("ToDo.AlreadyExists"),
          });
        }

        toDoUpdate.title = title;
      }

      if (description) {
        toDoUpdate.description = description;
      }

      if (status) {
        toDoUpdate.status = status;
      }

      // Create the todo
      const updatedToDo = await ToDo.updateOne({ _id: id })
        .set(toDoUpdate)
        .fetch();

      // Respond with the updated todo
      return res.status(200).json({
        status: 200,
        data: updatedToDo,
        msg: sails.__("ToDo.UpdatedSuccessfully"),
      });
    } catch (err) {
      console.error("update error:", err);

      // Handle errors gracefully
      return res.status(500).json({
        status: 500,
        data: {},
        err: sails.__("Server.ErrorOccurred"),
      });
    }
  },

  // list
  list: async function (req, res) {
    try {
      const userId = req.userData.id;

      const toDoList = await ToDo.find({ user_id: userId, is_deleted: false });

      // Respond with the list of todo
      return res.status(200).json({
        status: 200,
        data: toDoList,
        msg: sails.__("ToDo.ListSuccessfully"),
      });
    } catch (err) {
      console.error("Error fetching ToDo:", err);

      // Handle errors gracefully
      return res.status(500).json({
        status: 500,
        data: {},
        err: sails.__("Server.ErrorOccurred"),
      });
    }
  },

  // get
  get: async function (req, res) {
    try {
      // Extract userId and id from the request
      const userId = req.userData.id;
      const id = req.params.id;

      // Find the ToDo entry by userId and id (_id)
      const toDoDetails = await ToDo.findOne({
        user_id: userId,
        id: id,
        is_deleted: false,
      });

      // If ToDo not found, return 400
      if (!toDoDetails) {
        return res.status(400).json({
          status: 400,
          data: {},
          err: sails.__("ToDo.NotFound"),
        });
      }

      // Respond with the retrieved ToDo details
      return res.status(200).json({
        status: 200,
        data: toDoDetails,
        msg: sails.__("ToDo.FetchSuccessfully"),
      });
    } catch (err) {
      console.error("Error fetching ToDo:", err);

      // Handle errors gracefully
      return res.status(500).json({
        status: 500,
        data: {},
        err: sails.__("Server.ErrorOccurred"),
      });
    }
  },

  // delete
  delete: async function (req, res) {
    try {
      const userId = req.userData.id;
      const { id } = req.params;

      // Check if todo already exists
      const findToDo = await ToDo.findOne({ _id: id });

      if (!findToDo) {
        return res.status(400).json({
          status: 400,
          data: {},
          err: sails.__("ToDo.NotExist"),
        });
      }

      // delete the todo
      const deletedToDo = await ToDo.updateOne({ _id: id })
        .set({ is_deleted: true })
        .fetch();

      // Respond with the updated todo
      return res.status(200).json({
        status: 200,
        data: deletedToDo,
        msg: sails.__("ToDo.DeletedSuccessfully"),
      });
    } catch (err) {
      console.error("delete error:", err);

      // Handle errors gracefully
      return res.status(500).json({
        status: 500,
        data: {},
        err: sails.__("Server.ErrorOccurred"),
      });
    }
  },
};
