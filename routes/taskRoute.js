const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/get-all-task", authenticate, taskController.getAllTasks);
router.post("/create-task", authenticate, taskController.createTas);
router.put("/update-task/:id", authenticate, taskController.updateTask);
router.delete("/delete-task/:id", authenticate, taskController.deleteTask);
router.patch("/update-rank", taskController.updateTaskRank);
router.patch("/move-to-unranked", taskController.moveToUnranked);
router.get("/get-all-task-asc", taskController.getAllTasksAsc);

module.exports = router;
