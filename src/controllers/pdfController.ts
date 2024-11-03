// src/controllers/pdfController.ts
import { Request, Response } from "express";
import { generatePDF } from "../services/pdfService";
import { generateMetadataUrl } from "../utils/urlUtils";
import { fetchMetadata } from "../services/dataService";
import axios from "axios";
import { renderIndexView } from "../views/renderIndexView";

export const downloadResume = async (req: Request, res: Response) => {
  const renderingToken = req.query.rendering_token as string;
  const cacheDate = new Date().toISOString();
  const metadataUrl = generateMetadataUrl(renderingToken, cacheDate);

  try {
    const metadata = await fetchMetadata(metadataUrl);
    const pdfBytes = await generatePDF(metadata, renderingToken, cacheDate);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${renderingToken}.pdf"`,
    });
    res.send(pdfBytes);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error downloading resume:", error.message);
      res.status(500).send("Internal Server Error");
    } else {
      throw error;
    }
  }
};

export const renderIndex = (_req: Request, res: Response) => {
  res.send(renderIndexView());
};
