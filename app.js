const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

const userRouter = require("./routes/userRoute");
const taskRouter = require("./routes/taskRoute");

app.use(cors());
app.use(express.json());

app.use("/user", userRouter);
app.use("/task", taskRouter);

app.listen(8001);
