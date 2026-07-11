export type AboutMediaType = 'image' | 'video';
export type AboutMediaShape = 'tall' | 'portrait' | 'square' | 'landscape' | 'wide';

export interface AboutMedia {
  id: string;
  type: AboutMediaType;
  /** Add the committed asset path here, for example `/assets/about/portrait.jpg`. */
  src?: string;
  /** Recommended for video tiles so the grid has a clean first frame. */
  poster?: string;
  alt: string;
  shape: AboutMediaShape;
  placeholder: string;
}

export interface AboutInterest {
  id: 'anime' | 'kickboxing' | 'fashion';
  title: string;
  blurb: string;
  media: [AboutMedia, AboutMedia, AboutMedia];
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
    title: 'anime',
    blurb: 'i love a good story, a ridiculous power system, and ranking characters way more seriously than the situation calls for.',
    media: [
      { id: 'anime-01', type: 'image', alt: 'One of Ali\'s favourite anime moments', shape: 'landscape', placeholder: 'favourite scene' },
      { id: 'anime-02', type: 'image', alt: 'Anime art selected by Ali', shape: 'portrait', placeholder: 'character pick' },
      { id: 'anime-03', type: 'image', alt: 'Another anime favourite from Ali', shape: 'square', placeholder: 'current watch' },
    ],
  },
  {
    id: 'kickboxing',
    title: 'kickboxing',
    blurb: 'kickboxing is where i go to get out of my head—pads, footwork, and the kind of tired that fixes everything.',
    media: [
      { id: 'kickboxing-01', type: 'image', alt: 'Ali training kickboxing', shape: 'landscape', placeholder: 'pad work' },
      { id: 'kickboxing-02', type: 'image', alt: 'A kickboxing training detail', shape: 'landscape', placeholder: 'in the gym' },
      { id: 'kickboxing-03', type: 'image', alt: 'Ali during a kickboxing session', shape: 'landscape', placeholder: 'training shot' },
    ],
  },
  {
    id: 'fashion',
    title: 'fashion',
    blurb: 'i like treating an outfit like another build: start with one good piece, overthink the details, then pretend it came together effortlessly.',
    media: [
      { id: 'fashion-01', type: 'image', alt: 'One of Ali\'s favourite outfits', shape: 'portrait', placeholder: 'outfit 01' },
      { id: 'fashion-02', type: 'image', alt: 'A fashion detail selected by Ali', shape: 'portrait', placeholder: 'detail' },
      { id: 'fashion-03', type: 'image', alt: 'Another outfit styled by Ali', shape: 'portrait', placeholder: 'outfit 02' },
    ],
  },
];

/** Reorder, remove, or append entries here; the archive reflows automatically. */
const GALLERY_FILES: Array<[filename: string, type: AboutMediaType, shape: AboutMediaShape]> = [
  ['IMG_2976.JPG', 'image', 'portrait'],
  ['IMG_1174.JPG', 'image', 'portrait'],
  ['082F7EE2-962A-4306-92B5-A22B7FCB918B.mov', 'video', 'tall'],
  ['IMG_2999.JPG', 'image', 'landscape'],
  ['IMG_1517.JPG', 'image', 'portrait'],
  ['IMG_0841.JPG', 'image', 'portrait'],
  ['IMG_2861.JPG', 'image', 'tall'],
  ['IMG_1559.JPG', 'image', 'portrait'],
  ['IMG_1759.JPG', 'image', 'portrait'],
  ['IMG_1138.JPG', 'image', 'portrait'],
  ['8141A2BB-16F4-4207-9F05-40D605FBD4C5-web.mp4', 'video', 'tall'],
  ['IMG_2679.JPG', 'image', 'portrait'],
  ['IMG_2681.JPG', 'image', 'portrait'],
  ['temp_image_6415DD89-DC09-4BD3-A062-C662DB18932F.jpg', 'image', 'tall'],
  ['IMG_2465.JPG', 'image', 'portrait'],
  ['IMG_3093.JPG', 'image', 'tall'],
  ['IMG_2738.JPG', 'image', 'portrait'],
  ['IMG_3379.JPG', 'image', 'tall'],
  ['CC225DFA-EA03-4BEC-9809-3A63217CD863.mp4', 'video', 'tall'],
  ['IMG_2829.JPG', 'image', 'portrait'],
  ['IMG_3380.JPG', 'image', 'tall'],
  ['IMG_3009.JPG', 'image', 'portrait'],
  ['IMG_3381.JPG', 'image', 'tall'],
  ['IMG_3011.JPG', 'image', 'portrait'],
  ['IMG_3185.JPG', 'image', 'portrait'],
  ['IMG_3210.JPG', 'image', 'portrait'],
  ['E0B0A188-EEA1-45D6-A7D9-798ADDCF3FE2.mp4', 'video', 'tall'],
  ['IMG_3370.JPG', 'image', 'portrait'],
  ['6FF93328-30C5-45F6-8585-49E5CC4DAB14.jpg', 'image', 'portrait'],
];

export const ABOUT_GALLERY: AboutMedia[] = GALLERY_FILES.map(([filename, type, shape], index) => ({
  id: `gallery-${filename.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  type,
  src: `/assets/gallery/${filename}`,
  alt: `${type === 'video' ? 'Gallery video' : 'Gallery photo'} ${String(index + 1).padStart(2, '0')}`,
  shape,
  placeholder: type === 'video' ? 'gallery video' : 'gallery photo',
}));
