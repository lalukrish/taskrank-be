const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
// const redisClient = require("../redisClient");
const prisma = new PrismaClient();

const TOKEN_EXPIRATION_TIME = 3600;

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, jti: `token-${user.id}-${Date.now()}` },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
};

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "User has no access" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "User not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const isBlacklisted = await redisClient.get(`blacklist:${decoded.jti}`);
    // if (isBlacklisted) {
    //   return res.status(401).json({ message: "Token has been invalidated" });
    // }
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { generateToken, authenticate };
