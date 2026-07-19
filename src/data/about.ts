export type AboutMediaType = 'image' | 'video';
export type AboutMediaShape = 'tall' | 'portrait' | 'square' | 'landscape' | 'wide';

export interface AboutMedia {
  id: string;
  type: AboutMediaType;
  /** Add the committed asset path here, for example `/assets/about/portrait.webp`. */
  src?: string;
  /** Recommended for video tiles so the grid has a clean first frame. */
  poster?: string;
  /** Optional clip that plays over the still image while hovered (image tiles only). */
  hoverVideo?: string;
  alt: string;
  /** Name shown in the hover caption on anime / shows strips. Falls back to `alt`. */
  title?: string;
  shape: AboutMediaShape;
  /** Real width/height ratio of the asset. Reserves the tile's height before the
   *  image loads so the archive masonry never reorders. */
  aspect?: number;
  placeholder: string;
}

export interface AboutInterest {
  id: 'anime' | 'fashion' | 'shows';
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
  src: '/assets/IMG_1318.webp',
  alt: 'A candid portrait of Ali',
  shape: 'portrait',
  placeholder: 'candid portrait',
};

export const ABOUT_INTERESTS: AboutInterest[] = [
  {
    id: 'anime',
    caption: 'my favorite animes that changed my brain chemistry.\nhere are some of my favorite moments and art (watch out for spoilers)',
    scroll: 'left',
    mediaTop: [
      { id: 'anime-top-bleach1', type: 'image', src: '/assets/anime/row1/bleach1.webp', hoverVideo: '/assets/anime/row1/videos/bleach1.webm', alt: 'Bleach', shape: 'landscape', placeholder: 'bleach' },
      { id: 'anime-top-bleach2', type: 'image', src: '/assets/anime/row1/bleach2.webp', alt: 'Bleach', shape: 'landscape', placeholder: 'bleach' },
      { id: 'anime-top-bleach3', type: 'image', src: '/assets/anime/row1/bleach3.webp', alt: 'Bleach', shape: 'landscape', placeholder: 'bleach' },
      { id: 'anime-top-bleach4', type: 'image', src: '/assets/anime/row1/bleach4.webp', alt: 'Bleach', shape: 'landscape', placeholder: 'bleach' },
      { id: 'anime-top-goatbeard', type: 'image', src: '/assets/anime/row1/goatbeard.png', hoverVideo: '/assets/anime/row1/videos/goatbeard.webm', alt: 'Whitebeard', title: 'One Piece', shape: 'landscape', placeholder: 'the goat' },
      { id: 'anime-top-opiece1', type: 'image', src: '/assets/anime/row1/opiece1.webp', hoverVideo: '/assets/anime/row1/videos/opiece1.webm', alt: 'One Piece', shape: 'landscape', placeholder: 'one piece' },
      { id: 'anime-top-opiece2', type: 'image', src: '/assets/anime/row1/opiece2.webp', hoverVideo: '/assets/anime/row1/videos/opiece2.webm', alt: 'One Piece', shape: 'landscape', placeholder: 'one piece' },
      { id: 'anime-top-opiece3', type: 'image', src: '/assets/anime/row1/opiece3.webp', hoverVideo: '/assets/anime/row1/videos/opiece3.webm', alt: 'One Piece', shape: 'landscape', placeholder: 'one piece' },
      { id: 'anime-top-opiece4', type: 'image', src: '/assets/anime/row1/opiece4.webp', alt: 'One Piece', shape: 'landscape', placeholder: 'one piece' },
    ],
    media: [
      { id: 'anime-aot', type: 'image', src: '/assets/anime/row2/aot.webp', hoverVideo: '/assets/anime/row2/videos/aot.webm', alt: 'Attack on Titan', shape: 'landscape', placeholder: 'aot' },
      { id: 'anime-code-geass', type: 'image', src: '/assets/anime/row2/code-geass.webp', hoverVideo: '/assets/anime/row2/videos/code-geass.webm', alt: 'Code Geass', shape: 'landscape', placeholder: 'code geass' },
      { id: 'anime-haikyuu', type: 'image', src: '/assets/anime/row2/haikyuu.webp', hoverVideo: '/assets/anime/row2/videos/haikyuu.webm', alt: 'Haikyuu', shape: 'landscape', placeholder: 'haikyuu' },
      { id: 'anime-vinland', type: 'image', src: '/assets/anime/row2/vinland.png', hoverVideo: '/assets/anime/row2/videos/vinland.webm', alt: 'Vinland Saga', shape: 'landscape', placeholder: 'vinland' },
      { id: 'anime-hxh2', type: 'image', src: '/assets/anime/row2/hxh2.webp', hoverVideo: '/assets/anime/row2/videos/hxh2.webm', alt: 'Hunter x Hunter', shape: 'landscape', placeholder: 'hxh' },
      { id: 'anime-naruto', type: 'image', src: '/assets/anime/row2/naruto.webp', alt: 'Naruto', shape: 'landscape', placeholder: 'naruto' },
      { id: 'anime-shinra-tensei', type: 'image', src: '/assets/anime/row2/shinra-tensei.webp', hoverVideo: '/assets/anime/row2/videos/shinra-tensei.webm', alt: 'Shinra Tensei', title: 'Naruto', shape: 'landscape', placeholder: 'shinra tensei' },
    ],
  },
  {
    id: 'shows',
    caption: 'shows and movies that live rent-free in my head',
    scroll: 'right',
    media: [
      { id: 'shows-atlanta', type: 'image', src: '/assets/shows-movies/atlanta.webp', alt: 'Atlanta', shape: 'landscape', placeholder: 'atlanta' },
      { id: 'shows-avengers', type: 'image', src: '/assets/shows-movies/avengers.webp', alt: 'Avengers', shape: 'landscape', placeholder: 'avengers' },
      { id: 'shows-dexter', type: 'image', src: '/assets/shows-movies/dexter.webp', alt: 'Dexter', shape: 'landscape', placeholder: 'dexter' },
      { id: 'shows-django', type: 'image', src: '/assets/shows-movies/django.webp', alt: 'Django Unchained', shape: 'landscape', placeholder: 'django' },
      { id: 'shows-invincible', type: 'image', src: '/assets/shows-movies/invincible.webp', alt: 'Invincible', shape: 'landscape', placeholder: 'invincible' },
      { id: 'shows-longest-yard', type: 'image', src: '/assets/shows-movies/longest-yard.webp', alt: 'The Longest Yard', shape: 'landscape', placeholder: 'longest yard' },
      { id: 'shows-prince-bel-air', type: 'image', src: '/assets/shows-movies/prince-bel-air.webp', alt: 'The Fresh Prince of Bel-Air', shape: 'landscape', placeholder: 'fresh prince' },
      { id: 'shows-snowfall', type: 'image', src: '/assets/shows-movies/snowfall.webp', alt: 'Snowfall', shape: 'landscape', placeholder: 'snowfall' },
      { id: 'shows-spider-verse', type: 'image', src: '/assets/shows-movies/spider-verse.webp', alt: 'Spider-Man: Into the Spider-Verse', shape: 'landscape', placeholder: 'spider-verse' },
      { id: 'shows-the-boys', type: 'image', src: '/assets/shows-movies/the-boys.webp', alt: 'The Boys', shape: 'landscape', placeholder: 'the boys' },
      { id: 'shows-wolf', type: 'image', src: '/assets/shows-movies/wolf-of-wall-street.webp', alt: 'The Wolf of Wall Street', shape: 'landscape', placeholder: 'wolf of wall st' },
    ],
  },
  {
    id: 'fashion',
    caption: 'some of my **favorite outfits & pieces** in my closet',
    scroll: 'left',
    media: [
      { id: 'fashion-outfit2', type: 'image', src: '/assets/fashion/outfit2.webp', alt: 'Outfit photo 2', title: 'calm fit', shape: 'landscape', placeholder: 'outfit 2' },
      { id: 'fashion-polo', type: 'image', src: '/assets/fashion/polo.png', alt: 'Polo shirt', title: 'polo i thrifted', shape: 'portrait', placeholder: 'polo' },
      { id: 'fashion-fav-shirt', type: 'image', src: '/assets/fashion/fav-shirt.png', alt: 'My favorite shirt', title: 'my favorite shirt', shape: 'portrait', placeholder: 'fav shirt' },
      { id: 'fashion-outfit3', type: 'image', src: '/assets/fashion/outfit3.webp', alt: 'Outfit photo 3', title: 'thought this pose was cool', shape: 'portrait', placeholder: 'outfit 3' },
      { id: 'fashion-halfnhalf-zip', type: 'image', src: '/assets/fashion/halfnhalf-zip.png', alt: 'Half-and-half zip-up', title: 'my favorite hoodie', shape: 'portrait', placeholder: 'halfnhalf zip' },
      { id: 'fashion-gats', type: 'image', src: '/assets/fashion/adidas-gats.png', alt: 'Adidas GATs sneakers', title: 'adidas gats 😎', shape: 'square', placeholder: 'the shoes' },
      { id: 'fashion-outfit1', type: 'image', src: '/assets/fashion/outfit1.webp', alt: 'Outfit photo 1', title: 'summer fit', shape: 'portrait', placeholder: 'outfit 1' },
      { id: 'fashion-black-jeans', type: 'image', src: '/assets/fashion/black-jeans.png', alt: 'Black jeans', title: 'go-to jeans', shape: 'portrait', placeholder: 'black jeans' },
      { id: 'fashion-blue-jorts', type: 'image', src: '/assets/fashion/blue-jorts.png', alt: 'Blue jorts', title: 'go-to shorts', shape: 'portrait', placeholder: 'blue jorts' },
    ],
  },
];

/** Reorder, remove, or append entries here; the archive reflows automatically.
 *  `aspect` = real width/height of the asset (measured from the file) so the tile
 *  reserves its exact height before loading and the masonry never reorders. */
const GALLERY_FILES: Array<[filename: string, type: AboutMediaType, shape: AboutMediaShape, aspect: number]> = [
  ['IMG_2976.webp', 'image', 'portrait', 0.75],
  ['IMG_1174.webp', 'image', 'portrait', 0.75],
  ['082F7EE2-962A-4306-92B5-A22B7FCB918B.mov', 'video', 'tall', 0.5625],
  ['IMG_2999.webp', 'image', 'landscape', 1.3333],
  ['IMG_1517.webp', 'image', 'portrait', 0.75],
  ['IMG_0841.webp', 'image', 'portrait', 0.75],
  ['IMG_2861.webp', 'image', 'tall', 0.5625],
  ['IMG_1559.webp', 'image', 'portrait', 0.75],
  ['IMG_1759.webp', 'image', 'portrait', 0.6807],
  ['IMG_1138.webp', 'image', 'portrait', 0.75],
  ['8141A2BB-16F4-4207-9F05-40D605FBD4C5-web.mp4', 'video', 'tall', 0.5625],
  ['IMG_2681.webp', 'image', 'portrait', 0.75],
  ['temp_image_6415DD89-DC09-4BD3-A062-C662DB18932F.webp', 'image', 'tall', 0.5625],
  ['IMG_2465.webp', 'image', 'portrait', 0.75],
  ['IMG_8033.webp', 'image', 'portrait', 0.75],
  ['IMG_3093.webp', 'image', 'tall', 0.5625],
  ['IMG_2738.webp', 'image', 'portrait', 0.75],
  ['IMG_3379.webp', 'image', 'tall', 0.5625],
  ['CC225DFA-EA03-4BEC-9809-3A63217CD863.mp4', 'video', 'tall', 0.5625],
  ['IMG_2829.webp', 'image', 'portrait', 0.75],
  ['IMG_3380.webp', 'image', 'tall', 0.5625],
  ['IMG_3009.webp', 'image', 'portrait', 0.75],
  ['IMG_3011.webp', 'image', 'portrait', 0.75],
  ['IMG_3185.webp', 'image', 'portrait', 0.7025],
  ['IMG_3210.webp', 'image', 'portrait', 0.75],
  ['E0B0A188-EEA1-45D6-A7D9-798ADDCF3FE2.mp4', 'video', 'tall', 0.5625],
  ['IMG_3370.webp', 'image', 'portrait', 0.75],
  ['6FF93328-30C5-45F6-8585-49E5CC4DAB14.webp', 'image', 'portrait', 0.75],
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
