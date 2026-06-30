import mongoose from "mongoose";
import { ENV } from "./env.js";
import { logger } from "../common/logger/index.js";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(ENV.mongoUri);

    logger.info(
      { database: mongoose.connection.name },
      "MongoDB connected",
    );

    mongoose.connection.on("error", (error) => {
      logger.error({ err: error }, "MongoDB connection error");
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
  } catch (error) {
    logger.fatal({ err: error }, "MongoDB connection failed");
    throw error;
  }
};
