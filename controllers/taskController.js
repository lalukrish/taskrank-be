const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const taskController = {
  getAllTasks: async (req, res) => {
    try {
      const { userId } = req.params;
      const userIdInt = parseInt(userId, 10);

      if (isNaN(userIdInt)) {
        return res.status(400).json({ message: "Invalid userId" });
      }

      const [tasks, count] = await Promise.all([
        prisma.task.findMany({
          where: { userId: userIdInt },
        }),
        prisma.task.count({
          where: { userId: userIdInt },
        }),
      ]);

      res.status(200).json({ tasks, count });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  createTas: async (req, res) => {
    const { title, description, rank, userId } = req.body;

    const userIdInt = parseInt(userId, 10);

    if (isNaN(userIdInt)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    try {
      const newTask = await prisma.task.create({
        data: {
          title,
          description,
          rank,
          userId: userIdInt,
        },
      });

      res
        .status(201)
        .json({ message: "Task created successfully", task: newTask });
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  updateTask: async (req, res) => {
    const { id } = req.params;
    const { title, description, rank } = req.body;
    try {
      const task = await prisma.task.findUnique({
        where: { id: parseInt(id) },
      });

      if (!task || task.userId !== req.user.id) {
        return res.status(404).json({ message: "Task not found" });
      }
      const updatedTask = await prisma.task.update({
        where: { id: parseInt(id) },
        data: {
          title,
          description,
          rank,
        },
      });
      res
        .status(200)
        .json({ message: "Task updated successfully", task: updatedTask });
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  deleteTask: async (req, res) => {
    const { id } = req.params;
    try {
      const task = await prisma.task.findUnique({
        where: { id: parseInt(id) },
      });

      if (!task || task.userId !== req.user.id) {
        return res.status(404).json({ message: "Task not found" });
      }
      await prisma.task.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateTaskRank: async (req, res) => {
    try {
      const { taskId, newRank } = req.body;
      if (!taskId || newRank === undefined) {
        return res
          .status(400)
          .json({ error: "Task ID and new rank are required" });
      }
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      if (task.rank !== null) {
        if (newRank > task.rank) {
          await prisma.task.updateMany({
            where: { rank: { gt: task.rank, lte: newRank } },
            data: { rank: { decrement: 1 } },
          });
        } else if (newRank < task.rank) {
          await prisma.task.updateMany({
            where: { rank: { gte: newRank, lt: task.rank } },
            data: { rank: { increment: 1 } },
          });
        }
      } else {
        await prisma.task.updateMany({
          where: { rank: { gte: newRank } },
          data: { rank: { increment: 1 } },
        });
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { rank: newRank },
      });
      return res
        .status(200)
        .json({ message: "Task rank updated", task: updatedTask });
    } catch (error) {
      console.error("Error updating task rank:", error);
      return res.status(500).json({ error: "Failed to update task rank" });
    }
  },

  moveToUnranked: async (req, res) => {
    try {
      const { taskId } = req.body;
      if (!taskId) {
        return res.status(400).json({ error: "Task ID is required" });
      }
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      const currentRank = task.rank;
      if (currentRank === null) {
        return res.status(400).json({ error: "Task is already unranked" });
      }

      await prisma.task.updateMany({
        where: { rank: { gt: currentRank } },
        data: { rank: { decrement: 1 } },
      });

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { rank: null },
      });

      return res
        .status(200)
        .json({ message: "Task moved to unranked", task: updatedTask });
    } catch (error) {
      console.error("Error moving task to unranked:", error);
      return res.status(500).json({ error: "Failed to move task to unranked" });
    }
  },

  getAllTasksAsc: async (req, res) => {
    try {
      const tasks = await prisma.task.findMany({
        orderBy: { rank: "asc" },
      });
      return res.status(200).json({ tasks });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return res.status(500).json({ error: "Failed to fetch tasks" });
    }
  },
};

module.exports = taskController;
