export type AboutMediaType = 'image' | 'video';
export type AboutMediaShape = 'tall' | 'portrait' | 'square' | 'landscape' | 'wide';

export interface AboutMedia {
  id: string;
  type: AboutMediaType;
  /** Add the committed asset path here, for example `/assets/about/portrait.jpg`. */
  src?: string;
  /** Recommended for video tiles so the grid has a clean first frame. */
  poster?: string;
  /** Optional clip that plays over the still image while hovered (image tiles only). */
  hoverVideo?: string;
  alt: string;
  shape: AboutMediaShape;
  /** Real width/height ratio of the asset. Reserves the tile's height before the
   *  image loads so the archive masonry never reorders. */
  aspect?: number;
  placeholder: string;
}

export interface AboutInterest {
  id: 'anime' | 'kickboxing' | 'fashion';
  /** Single handwritten line shown under the film strip. No section title. */
  caption: string;
  /** Direction the strip auto-scrolls. Alternate per row for rhythm. */
  scroll: 'left' | 'right';
  /** Any number of frames; the strip loops seamlessly regardless of count. */
  media: AboutMedia[];
  /** Optional extra film row shown ABOVE the main strip, with no caption of its
   *  own — the interest's single caption then reads under both rows. Scrolls
   *  opposite the main strip. */
  mediaTop?: AboutMedia[];
}

export const ABOUT_HERO: AboutMedia = {
  id: 'hero-portrait',
  type: 'image',
  alt: 'A candid portrait of Ali',
  shape: 'portrait',
  placeholder: 'candid portrait',
};

export const ABOUT_INTERESTS: AboutInterest[] = [
  {
    id: 'anime',
    caption: 'ranking characters far more seriously than the situation calls for',
    scroll: 'left',
    mediaTop: [
      { id: 'anime-top-bleach1', type: 'image', src: '/assets/anime/row1/bleach1.jpg', hoverVideo: '/assets/anime/row1/videos/bleach1.webm', alt: 'Bleach', shape: 'landscape', placeholder: 'bleach' },
      { id: 'anime-top-bleach2', type: 'image', src: '/assets/anime/row1/bleach2.jpeg', alt: 'Bleach', shape: 'landscape', placeholder: 'bleach' },
      { id: 'anime-top-bleach3', type: 'image', src: '/assets/anime/row1/bleach3.jpeg', alt: 'Bleach', shape: 'landscape', placeholder: 'bleach' },
      { id: 'anime-top-bleach4', type: 'image', src: '/assets/anime/row1/bleach4.jpg', alt: 'Bleach', shape: 'landscape', placeholder: 'bleach' },
      { id: 'anime-top-goatbeard', type: 'image', src: '/assets/anime/row1/goatbeard.png', hoverVideo: '/assets/anime/row1/videos/goatbeard.webm', alt: 'Whitebeard', shape: 'landscape', placeholder: 'the goat' },
      { id: 'anime-top-opiece1', type: 'image', src: '/assets/anime/row1/opiece1.jpg', hoverVideo: '/assets/anime/row1/videos/opiece1.webm', alt: 'One Piece', shape: 'landscape', placeholder: 'one piece' },
      { id: 'anime-top-opiece2', type: 'image', src: '/assets/anime/row1/opiece2.jpg', hoverVideo: '/assets/anime/row1/videos/opiece2.webm', alt: 'One Piece', shape: 'landscape', placeholder: 'one piece' },
      { id: 'anime-top-opiece3', type: 'image', src: '/assets/anime/row1/opiece3.jpg', hoverVideo: '/assets/anime/row1/videos/opiece3.webm', alt: 'One Piece', shape: 'landscape', placeholder: 'one piece' },
      { id: 'anime-top-opiece4', type: 'image', src: '/assets/anime/row1/opiece4.jpg', alt: 'One Piece', shape: 'landscape', placeholder: 'one piece' },
    ],
    media: [
      { id: 'anime-aot', type: 'image', src: '/assets/anime/row2/aot.jpg', alt: 'Attack on Titan', shape: 'landscape', placeholder: 'aot' },
      { id: 'anime-code-geass', type: 'image', src: '/assets/anime/row2/code-geass.jpg', alt: 'Code Geass', shape: 'landscape', placeholder: 'code geass' },
      { id: 'anime-haikyuu', type: 'image', src: '/assets/anime/row2/haikyuu.jpg', alt: 'Haikyuu', shape: 'landscape', placeholder: 'haikyuu' },
      { id: 'anime-hxh1', type: 'image', src: '/assets/anime/row2/hxh1.jpg', alt: 'Hunter x Hunter', shape: 'landscape', placeholder: 'hxh' },
      { id: 'anime-hxh2', type: 'image', src: '/assets/anime/row2/hxh2.jpg', alt: 'Hunter x Hunter', shape: 'landscape', placeholder: 'hxh' },
      { id: 'anime-naruto', type: 'image', src: '/assets/anime/row2/naruto.jpg', alt: 'Naruto', shape: 'landscape', placeholder: 'naruto' },
      { id: 'anime-shinra-tensei', type: 'image', src: '/assets/anime/row2/shinra-tensei.jpg', alt: 'Shinra Tensei', shape: 'landscape', placeholder: 'shinra tensei' },
    ],
  },
  {
    id: 'kickboxing',
    caption: 'pads, footwork, and the kind of tired that fixes everything',
    scroll: 'right',
    media: [
      { id: 'kickboxing-01', type: 'image', alt: 'Ali training kickboxing', shape: 'landscape', placeholder: 'pad work' },
      { id: 'kickboxing-02', type: 'image', alt: 'A kickboxing training detail', shape: 'landscape', placeholder: 'in the gym' },
      { id: 'kickboxing-03', type: 'image', alt: 'Ali during a kickboxing session', shape: 'landscape', placeholder: 'training shot' },
      { id: 'kickboxing-04', type: 'image', alt: 'Kickboxing footwork detail', shape: 'landscape', placeholder: 'footwork' },
      { id: 'kickboxing-05', type: 'image', alt: 'After a kickboxing round', shape: 'landscape', placeholder: 'round done' },
    ],
  },
  {
    id: 'fashion',
    caption: 'an outfit is just another build — then pretend it was effortless',
    scroll: 'left',
    media: [
      { id: 'fashion-01', type: 'image', alt: 'One of Ali\'s favourite outfits', shape: 'landscape', placeholder: 'outfit 01' },
      { id: 'fashion-02', type: 'image', alt: 'A fashion detail selected by Ali', shape: 'landscape', placeholder: 'the details' },
      { id: 'fashion-03', type: 'image', alt: 'Another outfit styled by Ali', shape: 'landscape', placeholder: 'outfit 02' },
      { id: 'fashion-04', type: 'image', alt: 'A styled look from Ali', shape: 'landscape', placeholder: 'one good piece' },
      { id: 'fashion-05', type: 'image', alt: 'An outfit Ali put together', shape: 'landscape', placeholder: 'outfit 03' },
    ],
  },
];

/** Reorder, remove, or append entries here; the archive reflows automatically.
 *  `aspect` = real width/height of the asset (measured from the file) so the tile
 *  reserves its exact height before loading and the masonry never reorders. */
const GALLERY_FILES: Array<[filename: string, type: AboutMediaType, shape: AboutMediaShape, aspect: number]> = [
  ['IMG_2976.JPG', 'image', 'portrait', 0.75],
  ['IMG_1174.JPG', 'image', 'portrait', 0.75],
  ['082F7EE2-962A-4306-92B5-A22B7FCB918B.mov', 'video', 'tall', 0.5625],
  ['IMG_2999.JPG', 'image', 'landscape', 1.3333],
  ['IMG_1517.JPG', 'image', 'portrait', 0.75],
  ['IMG_0841.JPG', 'image', 'portrait', 0.75],
  ['IMG_2861.JPG', 'image', 'tall', 0.5625],
  ['IMG_1559.JPG', 'image', 'portrait', 0.75],
  ['IMG_1759.JPG', 'image', 'portrait', 0.6807],
  ['IMG_1138.JPG', 'image', 'portrait', 0.75],
  ['8141A2BB-16F4-4207-9F05-40D605FBD4C5-web.mp4', 'video', 'tall', 0.5625],
  ['IMG_2679.JPG', 'image', 'portrait', 0.6608],
  ['IMG_2681.JPG', 'image', 'portrait', 0.75],
  ['temp_image_6415DD89-DC09-4BD3-A062-C662DB18932F.jpg', 'image', 'tall', 0.5625],
  ['IMG_2465.JPG', 'image', 'portrait', 0.75],
  ['IMG_3093.JPG', 'image', 'tall', 0.5625],
  ['IMG_2738.JPG', 'image', 'portrait', 0.75],
  ['IMG_3379.JPG', 'image', 'tall', 0.5625],
  ['CC225DFA-EA03-4BEC-9809-3A63217CD863.mp4', 'video', 'tall', 0.5625],
  ['IMG_2829.JPG', 'image', 'portrait', 0.75],
  ['IMG_3380.JPG', 'image', 'tall', 0.5625],
  ['IMG_3009.JPG', 'image', 'portrait', 0.75],
  ['IMG_3381.JPG', 'image', 'tall', 0.5625],
  ['IMG_3011.JPG', 'image', 'portrait', 0.75],
  ['IMG_3185.JPG', 'image', 'portrait', 0.7025],
  ['IMG_3210.JPG', 'image', 'portrait', 0.75],
  ['E0B0A188-EEA1-45D6-A7D9-798ADDCF3FE2.mp4', 'video', 'tall', 0.5625],
  ['IMG_3370.JPG', 'image', 'portrait', 0.75],
  ['6FF93328-30C5-45F6-8585-49E5CC4DAB14.jpg', 'image', 'portrait', 0.75],
];

export const ABOUT_GALLERY: AboutMedia[] = GALLERY_FILES.map(([filename, type, shape, aspect], index) => ({
  id: `gallery-${filename.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  type,
  src: `/assets/gallery/${filename}`,
  alt: `${type === 'video' ? 'Gallery video' : 'Gallery photo'} ${String(index + 1).padStart(2, '0')}`,
  shape,
  aspect,
  placeholder: type === 'video' ? 'gallery video' : 'gallery photo',
}));
