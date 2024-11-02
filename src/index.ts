// index.ts
import express from "express";
import cors from "cors";
import { downloadResume, renderIndex } from "./controllers/pdfController";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Routes
app.get("/", renderIndex);
app.get("/download", downloadResume);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
