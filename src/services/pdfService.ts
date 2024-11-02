import PDFDocument from "pdfkit";
import { Stream } from "stream";
import { PageMetadata, Link } from "../types/Types";
import { generateImageUrl } from "../utils/urlUtils";
import { fetchAndProcessImage } from "./dataService";

const PDF_PAGE_DIMENSIONS = { width: 595, height: 842 };

export const addLinksToPage = (
  pdfDoc: PDFKit.PDFDocument,
  links: Link[],
  pageMetadata: PageMetadata
) => {
  const { width: origWidth, height: origHeight } = pageMetadata.viewport;
  const scaleX = PDF_PAGE_DIMENSIONS.width / origWidth;
  const scaleY = PDF_PAGE_DIMENSIONS.height / origHeight;

  links.forEach(({ left, top, width, height, url }) => {
    const scaledLeft = left * scaleX;
    const scaledTop = (origHeight - top) * scaleY - 13;
    const scaledWidth = width * scaleX;
    const scaledHeight = height * scaleY;
    pdfDoc.link(scaledLeft, scaledTop, scaledWidth, scaledHeight, url);
  });
};

export const generatePDF = async (
  metadata: PageMetadata[],
  token: string,
  cacheDate: string
) => {
  const pdfDoc = new PDFDocument({ autoFirstPage: false });
  const pdfStream = new Stream.PassThrough();
  const pdfBuffer: Buffer[] = [];

  pdfDoc.pipe(pdfStream);

  for (const [index, pageMetadata] of metadata.entries()) {
    const imageUrl = generateImageUrl(token, index + 1, cacheDate);
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
