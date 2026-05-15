import { createBackendApp } from "./app";
import { getBackendPort } from "./config/env";

const app = createBackendApp();
const port = getBackendPort();

app.listen(port, () => {
  console.log(`BudgetApp backend listening on http://127.0.0.1:${port}`);
});
