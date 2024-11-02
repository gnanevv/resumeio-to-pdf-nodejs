export interface Link {
  left: number;
  top: number;
  width: number;
  height: number;
  url: string;
}

export interface PageMetadata {
  viewport: {
    width: number;
    height: number;
  };
  links?: Link[];
}
