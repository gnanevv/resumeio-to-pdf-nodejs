const BASE_URL = "https://ssr.resume.tools";

export const generateMetadataUrl = (token: string, cacheDate: string): string =>
  `${BASE_URL}/meta/${token}?cache=${cacheDate}`;

export const generateImageUrl = (
  token: string,
  pageId: number,
  cacheDate: string
): string =>
  `${BASE_URL}/to-image/${token}-${pageId}.jpeg?cache=${cacheDate}&size=3000`;
