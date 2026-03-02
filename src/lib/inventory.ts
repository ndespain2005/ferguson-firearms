export type Category = "Accessories" | "Optics" | "Parts" | "Apparel" | "Rifles" | "Handguns" | "Collectibles";

export type InventoryItem = {
  id: string;
  name: string;
  category: Category;
  price: number; // 0 for request-only listings
  image: string;
  tag?: string;
  stock: number; // -1 = request-only
  brand?: string;
  caliber?: string;
  condition?: "New" | "Used";
  sku?: string;
  description?: string;
};

export const INVENTORY: InventoryItem[] = [
  // Accessories
  {
    id: "acc-1",
    name: "Magpul PMAG 30 (5.56)",
    category: "Accessories",
    price: 15,
    image: "/products/accessory-1.png",
    tag: "Top Seller",
    stock: 14,
    brand: "Magpul",
    sku: "FF-ACC-PMAG30",
    condition: "New",
    description: "Durable 30-round polymer magazine. Reliable, lightweight, and proven.",
  },
  {
    id: "acc-2",
    name: "Sling QD Mount Kit",
    category: "Accessories",
    price: 25,
    image: "/products/accessory-2.png",
    tag: "New",
    stock: 12,
    brand: "Ferguson",
    sku: "FF-ACC-QD01",
    condition: "New",
    description: "QD sling mount kit for quick transitions and solid retention.",
  },
  // Optics
  {
    id: "opt-1",
    name: "Micro Red Dot (Example)",
    category: "Optics",
    price: 199,
    image: "/products/optic-1.png",
    tag: "Hot",
    stock: 6,
    brand: "Example",
    sku: "FF-OPT-RD01",
    condition: "New",
    description: "Compact red dot with crisp reticle and durable housing.",
  },
  // Parts
  {
    id: "prt-1",
    name: "AR-15 Enhanced Trigger (Example)",
    category: "Parts",
    price: 129,
    image: "/products/part-1.png",
    tag: "Upgrade",
    stock: 4,
    brand: "Example",
    sku: "FF-PRT-TRG01",
    condition: "New",
    description: "Clean break and fast reset for performance builds.",
  },
  // Apparel
  {
    id: "app-1",
    name: "Ferguson Firearms Tee (Black)",
    category: "Apparel",
    price: 28,
    image: "/products/apparel-1.png",
    tag: "Limited",
    stock: 9,
    brand: "Ferguson",
    sku: "FF-APP-TEE01",
    condition: "New",
    description: "Premium cotton tee with subtle tactical branding.",
  },

  // Rifles (request-only)
  {
    id: "rif-1",
    name: "AR-15 16” (Example Listing)",
    category: "Rifles",
    price: 0,
    image: "/products/rifle-1.png",
    tag: "Request Only",
    stock: -1,
    brand: "Example",
    caliber: "5.56 NATO",
    condition: "New",
    sku: "FF-RIF-AR16",
    description: "Request-only listing. Submit intake and we’ll confirm availability and next steps.",
  },
  {
    id: "rif-2",
    name: "AK Pattern (Example Listing)",
    category: "Rifles",
    price: 0,
    image: "/products/rifle-2.png",
    tag: "Request Only",
    stock: -1,
    brand: "Example",
    caliber: "7.62x39",
    condition: "New",
    sku: "FF-RIF-AK01",
    description: "Request-only listing. Submit intake and we’ll follow up.",
  },

  // Handguns (request-only)
  {
    id: "hg-1",
    name: "Glock 19 Gen 5 (Example Listing)",
    category: "Handguns",
    price: 0,
    image: "/products/handgun-1.png",
    tag: "Request Only",
    stock: -1,
    brand: "Glock",
    caliber: "9mm",
    condition: "New",
    sku: "FF-HG-G19G5",
    description: "Request-only listing. We’ll confirm availability and process as a transfer/pickup.",
  },
  {
    id: "hg-2",
    name: "Sig P320 (Example Listing)",
    category: "Handguns",
    price: 0,
    image: "/products/handgun-2.png",
    tag: "Request Only",
    stock: -1,
    brand: "SIG Sauer",
    caliber: "9mm",
    condition: "New",
    sku: "FF-HG-P320",
    description: "Request-only listing. Submit an intake and we’ll follow up.",
  },

  // Collectibles (request-only)
  {
    id: "col-1",
    name: "Collector Piece (Example Listing)",
    category: "Collectibles",
    price: 0,
    image: "/products/collectible-1.png",
    tag: "Request Only",
    stock: -1,
    brand: "Example",
    condition: "Used",
    sku: "FF-COL-0001",
    description: "Request-only listing for collectors. Intake required.",
  },
];

export function getItemById(id: string) {
  return INVENTORY.find((p) => p.id === id) || null;
}

export function getBrands(items: InventoryItem[]) {
  const set = new Set<string>();
  for (const i of items) if (i.brand) set.add(i.brand);
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function getCalibers(items: InventoryItem[]) {
  const set = new Set<string>();
  for (const i of items) if (i.caliber) set.add(i.caliber);
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
