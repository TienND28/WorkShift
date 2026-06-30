import pino from "pino";

const nodeEnv = process.env.NODE_ENV ?? "development";
const logLevel = process.env.LOG_LEVEL ?? "info";

const devTransport = {
  target: "pino-pretty",
  options: {
    colorize: true,
    translateTime: "SYS:standard",
    ignore: "pid,hostname",
  },
};

export const logger =
  nodeEnv === "development"
    ? pino({
        level: logLevel,
        transport: devTransport,
        base: { env: nodeEnv, service: "workshift-api" },
      })
    : pino({
        level: logLevel,
        base: { env: nodeEnv, service: "workshift-api" },
      });

export type Logger = typeof logger;
