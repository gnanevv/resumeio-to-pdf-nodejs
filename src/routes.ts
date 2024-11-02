import { Request, Response } from "express";
import axios from "axios";
import PDFDocument from "pdfkit";
import sharp from "sharp";
import { Stream } from "stream";

// Constants for URL construction
const BASE_URL = "https://ssr.resume.tools";
const PDF_PAGE_DIMENSIONS = { width: 595, height: 842 };
const IMAGE_DIMENSIONS = { width: 1240, height: 1754 };

// Types
interface Link {
  left: number;
  top: number;
  width: number;
  height: number;
  url: string;
}

interface PageMetadata {
  viewport: {
    width: number;
    height: number;
  };
  links?: Link[];
}

// Helper to generate metadata and image URLs
const generateMetadataUrl = (token: string, cacheDate: string): string =>
  `${BASE_URL}/meta/${token}?cache=${cacheDate}`;

const generateImageUrl = (
  token: string,
  pageId: number,
  cacheDate: string
): string =>
  `${BASE_URL}/to-image/${token}-${pageId}.jpeg?cache=${cacheDate}&size=3000`;

// Fetch metadata for resume pages
const fetchMetadata = async (url: string): Promise<PageMetadata[]> => {
  try {
    const { data } = await axios.get(url);
    return data.pages;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch metadata: ${error.message}`);
    } else {
      throw error;
    }
  }
};

// Fetch and process each resume page image
const fetchAndProcessImage = async (url: string): Promise<Buffer> => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    if (response.status !== 200)
      throw new Error(`Failed to fetch image from ${url}`);
    const imageBuffer = Buffer.from(response.data, "binary");

    return await sharp(imageBuffer)
      .resize({
        width: IMAGE_DIMENSIONS.width,
        height: IMAGE_DIMENSIONS.height,
        fit: "contain",
        withoutEnlargement: true,
      })
      .png({
        compressionLevel: 1,
        adaptiveFiltering: true,
        quality: 100,
      })
      .toBuffer();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error processing image: ${error.message}`);
    } else {
      throw error;
    }
  }
};

// Add links to the PDF page
const addLinksToPage = (
  pdfDoc: PDFKit.PDFDocument,
  links: Link[],
  pageMetadata: PageMetadata
) => {
  const { width: origWidth, height: origHeight } = pageMetadata.viewport;
  const scaleX = PDF_PAGE_DIMENSIONS.width / origWidth;
  const scaleY = PDF_PAGE_DIMENSIONS.height / origHeight;

  links.forEach(({ left, top, width, height, url }) => {
    if ([left, top, width, height, url].every((val) => val !== undefined)) {
      const scaledLeft = left * scaleX;
      const scaledTop = (origHeight - top) * scaleY - 13;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;
      pdfDoc.link(scaledLeft, scaledTop, scaledWidth, scaledHeight, url);
    }
  });
};

// Generate PDF with pages and links
const generatePDF = async (renderingToken: string): Promise<Buffer> => {
  const cacheDate = new Date().toISOString();
  const metadataUrl = generateMetadataUrl(renderingToken, cacheDate);
  const metadata = await fetchMetadata(metadataUrl);

  const pdfDoc = new PDFDocument({ autoFirstPage: false });
  const pdfStream = new Stream.PassThrough();
  const pdfBuffer: Buffer[] = [];

  pdfDoc.pipe(pdfStream);

  for (const [index, pageMetadata] of metadata.entries()) {
    const imageUrl = generateImageUrl(renderingToken, index + 1, cacheDate);
    const resizedImage = await fetchAndProcessImage(imageUrl);

    pdfDoc.addPage({ size: "A4" });
    pdfDoc.image(resizedImage, 0, 0, PDF_PAGE_DIMENSIONS);
    if (pageMetadata.links)
      addLinksToPage(pdfDoc, pageMetadata.links, pageMetadata);
  }

  pdfDoc.end();

  return new Promise<Buffer>((resolve, reject) => {
    pdfStream.on("data", (chunk) => pdfBuffer.push(chunk));
    pdfStream.on("end", () => resolve(Buffer.concat(pdfBuffer)));
    pdfStream.on("error", (error) =>
      reject(new Error(`PDF generation error: ${error.message}`))
    );
  });
};

// Route to download the resume PDF
export const downloadResume = async (req: Request, res: Response) => {
  const renderingToken = req.query.rendering_token as string;

  try {
    const pdfBytes = await generatePDF(renderingToken);
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

// Render a simple index page with form
export const renderIndex = (_req: Request, res: Response) => {
  res.send(`
    <html>
      <body>
        <h1>Welcome to the Resume Download Service</h1>
        <form action="/download" method="GET">
          <input type="text" name="rendering_token" placeholder="Rendering Token" required />
          <button type="submit">Download Resume</button>
        </form>
      </body>
    </html>
  `);
};
