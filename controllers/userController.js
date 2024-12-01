const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const { generateToken } = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");

const TOKEN_EXPIRATION_TIME = 3600;

const userController = {
  createUser: async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: email }],
        },
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email or phone number already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });
      return res.status(201).json({
        message: "User created successfully",
        user: newUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  userLogin: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = generateToken(user);
      res.json({
        message: "Successfully logged in",
        user: {
          id: user.id,
          username: user.name,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error", error });
    }
  },
  logoutUser: async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    try {
      // Check if Redis client is open
      //   if (!redisClient.isOpen) {
      //     await redisClient.connect(); // Reconnect if closed
      //   }

      //await redisClient.setEx(`blacklistedToken:${token}`, 3600, "true"); // Example command to blacklist token

      res.status(200).json({ message: "Successfully logged out" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Error during logout" });
    }
  },

  getUserById: async (req, res) => {
    const id = req.params.id;

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: parseInt(id),
        },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
module.exports = userController;
