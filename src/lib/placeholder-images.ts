// This file is no longer needed as images are managed locally.
// It is kept to avoid breaking imports, but can be removed in a future cleanup.

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const placeholderImages: ImagePlaceholder[] = [];
