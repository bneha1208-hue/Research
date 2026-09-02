/**
 * Shareable Image Generation Service
 * Matches Section 5 of Legal Dictionary API Contract
 */

const { getTermById } = require('./term.service');

const VARIANTS_CONFIG = {
  story: { width: 1080, height: 1920, format: "png", description: "WhatsApp Status, Instagram Stories (9:16)" },
  square: { width: 1080, height: 1080, format: "png", description: "Instagram feed post, WhatsApp DM (1:1)" },
  post: { width: 1080, height: 1350, format: "png", description: "Instagram portrait feed post (4:5)" }
};

async function getShareImages(termId, variant) {
  const term = await getTermById(termId);
  if (!term) return null;

  const baseUrl = "https://cdn.legaldictionary.app/cards";
  
  if (variant && VARIANTS_CONFIG[variant]) {
    const spec = VARIANTS_CONFIG[variant];
    return {
      termId: term.id,
      images: [
        {
          variant,
          format: spec.format,
          url: `${baseUrl}/${term.id}_${variant}.png`,
          width: spec.width,
          height: spec.height
        }
      ]
    };
  }

  // Return all variants if omitted
  const images = Object.keys(VARIANTS_CONFIG).map(v => ({
    variant: v,
    format: VARIANTS_CONFIG[v].format,
    url: `${baseUrl}/${term.id}_${v}.png`,
    width: VARIANTS_CONFIG[v].width,
    height: VARIANTS_CONFIG[v].height
  }));

  return {
    termId: term.id,
    images
  };
}

module.exports = {
  getShareImages,
  VARIANTS_CONFIG
};
