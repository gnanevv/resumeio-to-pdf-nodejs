import { Request, Response } from "express";
import axios from "axios";
import PDFDocument from "pdfkit";
import sharp from "sharp";
import { Stream } from "stream";

// Helper function to construct URLs
const METADATA_URL = (rendering_token: string, cache_date: string) =>
  `https://ssr.resume.tools/meta/${rendering_token}?cache=${cache_date}`;

const IMAGES_URL = (rendering_token: string, page_id: number, cache_date: string) =>
  `https://ssr.resume.tools/to-image/${rendering_token}-${page_id}.jpeg?cache=${cache_date}&size=3000`;

// Function to generate PDF
const generatePDF = async (rendering_token: string) => {
  const cache_date = new Date().toISOString();
  const metadataUrl = METADATA_URL(rendering_token, cache_date);

  try {
    // Fetch metadata to get page details
    const metadataResponse = await axios.get(metadataUrl);
    const metadata = metadataResponse.data.pages;

    // Create a PDF document
    const pdfDoc = new PDFDocument({ autoFirstPage: false });
    const pdfStream = new Stream.PassThrough();
    const pdfBuffer: Buffer[] = [];

    pdfDoc.pipe(pdfStream);

    for (let i = 0; i < metadata.length; i++) {
      // Fetch each image page and add it to the PDF
      const imageUrl = IMAGES_URL(rendering_token, i + 1, cache_date);
      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });

      if (imageResponse.status !== 200) {
        throw new Error(`Failed to fetch image from ${imageUrl}`);
      }

      const imageBuffer = Buffer.from(imageResponse.data, "binary");

      // Resize image using sharp with the highest possible quality settings
      const resizedImage = await sharp(imageBuffer)
        .resize({
          width: 1240,
          height: 1754,
          fit: "contain",
          withoutEnlargement: true,
        })
        .png({ 
          compressionLevel: 1, // Lower compression for higher quality
          adaptiveFiltering: true,
          quality: 100 // Ensure highest possible quality setting in Sharp
        })
        .toBuffer();

      pdfDoc.addPage({ size: "A4" });
      pdfDoc.image(resizedImage, 0, 0, { width: 595, height: 842 });

      // Logging the original dimensions of the metadata page
      const originalWidth = metadata[i].viewport.width;
      const originalHeight = metadata[i].viewport.height;

      // Calculate scaling factors
      const scaleX = 595 / originalWidth;
      const scaleY = 842 / originalHeight;

      // Optional: Add links if any exist
      const links = metadata[i]?.links || [];
      for (const link of links) {
        const { left, top, width, height, url } = link;

        // Validate and scale the link data
        if (
          typeof left === "number" &&
          typeof top === "number" &&
          typeof width === "number" &&
          typeof height === "number" &&
          typeof url === "string"
        ) {
          // Scale coordinates to fit the PDF page dimensions
          const scaledLeft = left * scaleX;
          const scaledTop = (originalHeight - top) * scaleY - 13;
          const scaledWidth = width * scaleX;
          const scaledHeight = height * scaleY;

          // Add the link annotation to the PDF
          pdfDoc.link(scaledLeft, scaledTop, scaledWidth, scaledHeight, url);
        }
      }
    }

    pdfDoc.end();

    pdfStream.on("data", (chunk) => pdfBuffer.push(chunk));

    return new Promise<Buffer>((resolve, reject) => {
      pdfStream.on("end", () => resolve(Buffer.concat(pdfBuffer)));
      pdfStream.on("error", (error) => reject(error));
    });
  } catch (error: any) {
    console.error("Error generating PDF:", error.message);
    throw error;
  }
};

// Route to download the resume
export const downloadResume = async (req: Request, res: Response) => {
  const rendering_token = req.query.rendering_token as string;

  try {
    const pdfBytes = await generatePDF(rendering_token);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${rendering_token}.pdf"`,
    });
    res.send(pdfBytes);
  } catch (error: any) {
    console.error("Error downloading resume:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Route to render the index page
export const renderIndex = (req: Request, res: Response) => {
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