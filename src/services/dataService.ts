import axios from "axios";
import sharp from "sharp";
import { PageMetadata } from "../types/Types";

export const fetchMetadata = async (url: string): Promise<PageMetadata[]> => {
  try {
    const { data } = await axios.get(url);
    return data.pages;
  } catch (error) {
    throw new Error(`Failed to fetch metadata: ${error}`);
  }
};

export const fetchAndProcessImage = async (url: string): Promise<Buffer> => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(response.data, "binary");

    return await sharp(imageBuffer)
      .resize({
        width: 1240,
        height: 1754,
        fit: "contain",
        withoutEnlargement: true,
      })
      .png({ compressionLevel: 1, adaptiveFiltering: true, quality: 100 })
      .toBuffer();
  } catch (error) {
    throw new Error(`Error processing image: ${error}`);
  }
};
