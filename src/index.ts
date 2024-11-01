// index.ts
import express from "express";
import cors from "cors";
import { renderIndex, downloadResume } from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Routes
app.get("/", renderIndex);
app.get("/download", downloadResume); // Change to GET to match form method

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
