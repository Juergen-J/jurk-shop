/**
 * Product catalogue: one product per caliber, based on the BoxLoc ammo box
 * series by Layer51 (MakerWorld, commercial license via Patreon). Only the
 * models from the Notion table "Ammobox" for now.
 *
 * Every variant is "Ausführung" (box size) x "Farbe". Amounts are in EUR and
 * are placeholders until the real prices are set in the admin.
 */
export const PLACEHOLDER_PRICE = 1;

export const COLORS = ["Schwarz", "Oliv", "Sand", "Rot"];

export type CatalogCategory = {
  handle: string;
  name: string;
  name_en: string;
};

export const PARENT_CATEGORY: CatalogCategory = {
  handle: "munitionsboxen",
  name: "Munitionsboxen",
  name_en: "Ammo Boxes",
};

export const CATEGORIES: CatalogCategory[] = [
  { handle: "kurzwaffe", name: "Kurzwaffe", name_en: "Handgun" },
  { handle: "kleinkaliber", name: "Kleinkaliber", name_en: "Rimfire" },
  { handle: "langwaffe", name: "Langwaffe", name_en: "Rifle" },
  { handle: "schrot", name: "Schrot", name_en: "Shotgun" },
];

export type CatalogSize = {
  /** Option value shown to the customer (German) */
  value: string;
  value_en: string;
  /** MakerWorld model id */
  model: number;
  /** Weight of the printed box in grams (Notion "Ammobox") */
  weight: number;
  price?: number;
};

export type CatalogProduct = {
  handle: string;
  caliber: string;
  caliber_en?: string;
  category: string;
  sizes: CatalogSize[];
};

const rounds = (
  count: number | string,
  model: number,
  weight: number
): CatalogSize => ({
  value: `${count} Schuss`,
  value_en: `${count} rounds`,
  model,
  weight,
});

export const PRODUCTS: CatalogProduct[] = [
  {
    handle: "munitionsbox-9mm-luger",
    caliber: "9mm Luger",
    category: "kurzwaffe",
    sizes: [rounds(50, 1986813, 155), rounds(100, 2027911, 285)],
  },
  {
    handle: "munitionsbox-45-acp",
    caliber: ".45 ACP",
    category: "kurzwaffe",
    sizes: [rounds(50, 2013867, 161)],
  },
  {
    handle: "munitionsbox-357-magnum",
    caliber: ".357 Magnum",
    category: "kurzwaffe",
    sizes: [rounds(50, 2113637, 203), rounds(100, 2602392, 348)],
  },
  {
    handle: "munitionsbox-38-special",
    caliber: ".38 Special",
    category: "kurzwaffe",
    sizes: [rounds(50, 2113668, 187)],
  },
  {
    handle: "munitionsbox-22-lr",
    caliber: ".22 LR",
    category: "kleinkaliber",
    sizes: [
      {
        value: "Kompakt, 50–78 Schuss",
        value_en: "Compact, 50–78 rounds",
        model: 2612021,
        weight: 117,
      },
      {
        value: "105–120 Schuss",
        value_en: "105–120 rounds",
        model: 1986888,
        weight: 155,
      },
    ],
  },
  {
    handle: "munitionsbox-223-rem-556",
    caliber: ".223 Rem / 5.56x45",
    category: "langwaffe",
    sizes: [rounds(50, 2117458, 241)],
  },
  {
    handle: "munitionsbox-308-win-762x51",
    caliber: ".308 Win / 7.62x51",
    category: "langwaffe",
    sizes: [rounds(50, 2339308, 243)],
  },
  {
    handle: "munitionsbox-762x39",
    caliber: "7.62x39",
    category: "langwaffe",
    sizes: [rounds(50, 2270208, 211)],
  },
  {
    handle: "munitionsbox-762x54r",
    caliber: "7.62x54R",
    category: "langwaffe",
    sizes: [rounds(36, 2771621, 241)],
  },
  {
    handle: "munitionsbox-300-win-mag",
    caliber: ".300 Win Mag",
    category: "langwaffe",
    sizes: [rounds(40, 2577860, 310), rounds(80, 2600473, 550)],
  },
  {
    handle: "munitionsbox-45-70-govt",
    caliber: ".45-70 Govt",
    category: "langwaffe",
    sizes: [rounds(36, 2577842, 286), rounds(72, 2602306, 551)],
  },
  {
    handle: "munitionsbox-kaliber-12",
    caliber: "Kaliber 12",
    caliber_en: "12 Gauge",
    category: "schrot",
    sizes: [
      {
        value: "15 Patronen",
        value_en: "15 shells",
        model: 2270055,
        weight: 230,
      },
    ],
  },
];

export const SIZE_OPTION = { title: "Ausführung", title_en: "Size" };
export const COLOR_OPTION = { title: "Farbe", title_en: "Color" };

export const COLORS_EN: Record<string, string> = {
  Schwarz: "Black",
  Oliv: "Olive",
  Sand: "Sand",
  Rot: "Red",
};

export const productTitle = (product: CatalogProduct) =>
  `Munitionsbox ${product.caliber}`;

export const productTitleEn = (product: CatalogProduct) =>
  `Ammo Box ${product.caliber_en ?? product.caliber}`;

export const productDescription = (product: CatalogProduct) =>
  `Munitionsbox für ${product.caliber}, jede Patrone sitzt in einem eigenen Fach. Die Box wird nach deiner Bestellung in der gewählten Farbe im 3D-Druck gefertigt.`;

export const productDescriptionEn = (product: CatalogProduct) =>
  `Ammo box for ${product.caliber_en ?? product.caliber}, every round sits in its own slot. The box is 3D printed in your chosen color after you order.`;
