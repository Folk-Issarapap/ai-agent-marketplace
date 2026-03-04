import { createEnv } from "@t3-oss/env-nextjs";
import { keys as admin } from "./keys";

export const env = createEnv({
  extends: [admin()],
  runtimeEnv: process.env,
});
