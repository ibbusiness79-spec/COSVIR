import { createApp } from "./app";
import { assertConfig, config } from "./config";
import { logger } from "./shared/logger";

assertConfig();

const app = createApp();
app.listen(config.port, () => {
  logger.info("server_started", { port: config.port });
});
