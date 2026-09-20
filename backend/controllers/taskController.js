const Task = require("../models/Task");

const toPublicTask = (task) => ({
    id: task._id.toString(),
    title: task.title,
    done: task.done,
    created_at: task.created_at
});

const getTasks = async (req, res) => {
    try {
        const tasks = await Task
            .find({ customerId: req.user.id })
            .sort({ created_at: -1 });

        res.json({
            success: true,
            tasks: tasks.map(toPublicTask)
        });

    } catch (error) {
        console.error("Get tasks error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch tasks."
        });
    }
};

const createTask = async (req, res) => {
    try {
        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Task title is required."
            });
        }

        const task = await Task.create({
            customerId: req.user.id,
            title: title.trim()
        });

        res.status(201).json({
            success: true,
            task: toPublicTask(task)
        });

    } catch (error) {
        console.error("Create task error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create task."
        });
    }
};

const toggleTask = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, customerId: req.user.id });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        task.done = !task.done;
        await task.save();

        res.json({
            success: true,
            task: toPublicTask(task)
        });

    } catch (error) {
        console.error("Toggle task error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update task."
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        const result = await Task.deleteOne({ _id: req.params.id, customerId: req.user.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        res.json({
            success: true,
            message: "Task deleted."
        });

    } catch (error) {
        console.error("Delete task error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete task."
        });
    }
};

module.exports = {
    getTasks,
    createTask,
    toggleTask,
    deleteTask
};
