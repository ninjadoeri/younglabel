/* YOUNGLABEL catalogue data + tag-driven product store */
const money = (n) => "$" + n.toFixed(0);

/* Canonical product metadata. Every homepage section is generated from these
   flags — nothing is assigned manually. Shape:
   { id, name, price, cat, isNewArrival, isBestSeller, isFeatured, isOnSale, colors } */
const BASE_PRODUCTS = [
  { id: "p01", name: "Tailored Linen Blazer", price: 248, cat: "Co-ord Sets", isNewArrival: true,  isBestSeller: false, isFeatured: true,  isOnSale: false, colors: ["Sand","Ivory","Black"] },
  { id: "p02", name: "Wide-Leg Trouser",      price: 168, cat: "Clothing",    isNewArrival: true,  isBestSeller: false, isFeatured: false, isOnSale: false, colors: ["Sand","Stone"] },
  { id: "p03", name: "Bias-Cut Slip Dress",   price: 196, cat: "Dresses",     isNewArrival: false, isBestSeller: true,  isFeatured: true,  isOnSale: false, colors: ["Champagne","Black"] },
  { id: "p04", name: "Ribbed Knit Tank",      price: 78,  cat: "Clothing",    isNewArrival: false, isBestSeller: false, isFeatured: false, isOnSale: true,  colors: ["Cream","Stone"] },
  { id: "p05", name: "Cropped Knit Vest",     price: 132, cat: "Clothing",    isNewArrival: true,  isBestSeller: false, isFeatured: false, isOnSale: false, colors: ["Oat","Ivory"] },
  { id: "p06", name: "Poplin Maxi Dress",     price: 218, cat: "Dresses",     isNewArrival: false, isBestSeller: true,  isFeatured: false, isOnSale: false, colors: ["Ivory","Sand"] },
  { id: "p07", name: "Relaxed Co-ord Shirt",  price: 124, cat: "Co-ord Sets", isNewArrival: false, isBestSeller: false, isFeatured: false, isOnSale: true,  colors: ["Sand","White"] },
  { id: "p08", name: "Pleated Midi Skirt",    price: 158, cat: "Clothing",    isNewArrival: false, isBestSeller: false, isFeatured: false, isOnSale: false, colors: ["Stone","Black"] },
  { id: "p09", name: "Oversized Wool Coat",   price: 320, cat: "Clothing",    isNewArrival: true,  isBestSeller: false, isFeatured: true,  isOnSale: false, colors: ["Camel","Ivory"] },
  { id: "p10", name: "Silk Halter Top",       price: 96,  cat: "Clothing",    isNewArrival: false, isBestSeller: false, isFeatured: false, isOnSale: true,  colors: ["Champagne"] },
  { id: "p11", name: "Leather Mini Bag",      price: 188, cat: "Accessories", isNewArrival: false, isBestSeller: true,  isFeatured: false, isOnSale: false, colors: ["Tan","Black"] },
  { id: "p12", name: "Strappy Slip Heel",     price: 164, cat: "Accessories", isNewArrival: false, isBestSeller: false, isFeatured: false, isOnSale: false, colors: ["Nude","Black"] },
  { id: "p13", name: "Linen Lounge Set",      price: 176, cat: "Co-ord Sets", isNewArrival: true,  isBestSeller: false, isFeatured: false, isOnSale: false, colors: ["Oat","Sage"] },
  { id: "p14", name: "Column Evening Gown",   price: 298, cat: "Dresses",     isNewArrival: false, isBestSeller: false, isFeatured: true,  isOnSale: false, colors: ["Black","Ivory"] },
  { id: "p15", name: "Cashmere Crew",         price: 210, cat: "Clothing",    isNewArrival: false, isBestSeller: true,  isFeatured: true,  isOnSale: false, colors: ["Cream","Camel"] },
  { id: "p16", name: "Gold Hoop Set",         price: 64,  cat: "Accessories", isNewArrival: false, isBestSeller: false, isFeatured: false, isOnSale: true,  colors: ["Gold"] },
];

/* Editor vocabulary */
const CATEGORIES = ["Dresses", "Co-ord Sets", "Clothing", "Accessories", "Sets", "Other"];
const PRODUCT_TAGS = [
  { key: "isNewArrival", label: "New Arrival" },
  { key: "isBestSeller", label: "Best Seller" },
  { key: "isFeatured",   label: "Featured Product" },
  { key: "isOnSale",     label: "Sale Item" },
];

/* Tag-driven "views" used by the PLP + collection cards. Each predicate
   selects products purely from their metadata. */
const TAG_VIEWS = {
  new:      { label: "New Arrivals", kicker: "Fresh In",    pred: (p) => p.isNewArrival },
  best:     { label: "Best Sellers", kicker: "Most Wanted", pred: (p) => p.isBestSeller },
  featured: { label: "Featured",     kicker: "Editor's Picks", pred: (p) => p.isFeatured },
  sale:     { label: "Sale",         kicker: "Last Chance", pred: (p) => p.isOnSale },
};

/* ---- Persisted overrides (admin edits survive reload) ---- */
const STORE_KEY = "yl-products-v1";
function readOverrides() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {}; }
  catch (e) { return {}; }
}
function loadProducts() {
  const ov = readOverrides();
  return BASE_PRODUCTS.map((p) => ({ ...p, ...(ov[p.id] || {}) }));
}
function saveProductOverride(id, patch) {
  const ov = readOverrides();
  ov[id] = { ...(ov[id] || {}), ...patch };
  try { localStorage.setItem(STORE_KEY, JSON.stringify(ov)); } catch (e) {}
}

/* Collection cards on the homepage — each links to a tag-view or category. */
const COLLECTIONS = [
  { key: "new",   title: "New Arrivals", sub: "Fresh in this week",        slot: "col-new",   nav: { view: "new" } },
  { key: "best",  title: "Best Sellers", sub: "Loved by the community",    slot: "col-best",  nav: { view: "best" } },
  { key: "dress", title: "Dresses",      sub: "Day to evening",            slot: "col-dress", nav: { filter: "Dresses" } },
  { key: "sets",  title: "Co-ord Sets",  sub: "Effortlessly put together", slot: "col-sets",  nav: { filter: "Co-ord Sets" } },
];

const STYLES = [
  { name: "Casual",      desc: "Everyday pieces made effortless", slot: "st-casual" },
  { name: "Workwear",    desc: "Polished looks for every desk",   slot: "st-work" },
  { name: "Evening",     desc: "Statement styles for your night", slot: "st-eve" },
  { name: "Lounge",      desc: "Comfort that looks chic",          slot: "st-lounge" },
  { name: "Denim",       desc: "Timeless staples, reimagined",     slot: "st-denim" },
  { name: "Accessories", desc: "The finishing touches",            slot: "st-acc" },
];

const REVIEWS = [
  { q: "The blazer fits like it was made for me. The fabric feels impossibly luxurious for the price.", name: "Amara S.", item: "Tailored Linen Blazer" },
  { q: "Finally a brand that gets modern minimalism right. Every piece works with everything else.",     name: "Lena K.",  item: "Wide-Leg Trouser" },
  { q: "I've worn the slip dress to three events already. Endless compliments, every time.",             name: "Priya R.", item: "Bias-Cut Slip Dress" },
];

const HERO_SLIDES = [
  { kicker: "New Arrivals",  h: ["Timeless Style.", "Made for You."], side: ["Effortless.","Elevated.","Everyday."] },
  { kicker: "The Linen Edit", h: ["Wear Confidence.", "Stay Young."], side: ["Soft.","Structured.","Sublime."] },
  { kicker: "Evening Collection", h: ["After Dark,", "Undone."], side: ["Quiet.","Luxe.","Unforgettable."] },
  { kicker: "Co-ord Sets", h: ["One Decision.", "Fully Styled."], side: ["Matched.","Modern.","Made simple."] },
];

/* badge shown on a card — first matching tag wins */
function productBadge(p) {
  if (p.isOnSale) return { label: "Sale", kind: "sale" };
  if (p.isNewArrival) return { label: "New", kind: "new" };
  if (p.isBestSeller) return { label: "Bestseller", kind: "best" };
  if (p.isFeatured) return { label: "Featured", kind: "feat" };
  return null;
}

window.DATA = {
  money, BASE_PRODUCTS, PRODUCTS: BASE_PRODUCTS,
  CATEGORIES, PRODUCT_TAGS, TAG_VIEWS,
  loadProducts, saveProductOverride, productBadge,
  COLLECTIONS, STYLES, REVIEWS, HERO_SLIDES,
};
