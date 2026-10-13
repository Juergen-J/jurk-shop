import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createTranslationsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * The shop is written in German. This enables de-DE and en-US on the store
 * and adds English translations for the base data. Products are translated by
 * tools/catalog/import.mjs, or in the admin.
 */
const LOCALE = "en-US";

const CATEGORIES: Record<string, string> = {
  munitionsboxen: "Ammo Boxes",
};
const OPTIONS: Record<string, string> = {
  Farbe: "Color",
};
const OPTION_VALUES: Record<string, string> = {
  Schwarz: "Black",
  Oliv: "Olive",
  Sand: "Sand",
  Rot: "Red",
};
const SHIPPING_OPTION_TYPES: Record<string, Record<string, string>> = {
  "dhl-paket": {
    label: "DHL Parcel",
    description: "Delivered 1-2 business days after production.",
  },
};

type TranslationInput = {
  reference_id: string;
  reference: string;
  locale_code: string;
  translations: Record<string, string>;
};

export default async function translations_en({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  // Other migration scripts (e.g. the product catalogue) add their own
  // translations, so only skip records that are translated already.
  const { data: existing } = await query.graph({
    entity: "translation",
    fields: ["reference_id"],
    filters: { locale_code: LOCALE },
  });
  const translated = new Set(existing.map((t) => t.reference_id));

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id"],
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: stores[0].id },
      update: {
        supported_locales: [{ locale_code: "de-DE" }, { locale_code: LOCALE }],
      },
    },
  });

  const translations: TranslationInput[] = [];
  const add = (
    reference: string,
    reference_id: string,
    fields: Record<string, string> | undefined
  ) => {
    if (fields && !translated.has(reference_id)) {
      translations.push({
        reference,
        reference_id,
        locale_code: LOCALE,
        translations: fields,
      });
    }
  };

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
  });
  categories.forEach((category) =>
    add(
      "product_category",
      category.id,
      CATEGORIES[category.handle]
        ? { name: CATEGORIES[category.handle] }
        : undefined
    )
  );

  const { data: options } = await query.graph({
    entity: "product_option",
    fields: ["id", "title", "values.id", "values.value"],
  });
  options.forEach((option) => {
    add(
      "product_option",
      option.id,
      OPTIONS[option.title] ? { title: OPTIONS[option.title] } : undefined
    );
    (option.values ?? []).forEach((value) => {
      if (value && OPTION_VALUES[value.value]) {
        add("product_option_value", value.id, {
          value: OPTION_VALUES[value.value],
        });
      }
    });
  });

  const { data: shippingOptionTypes } = await query.graph({
    entity: "shipping_option_type",
    fields: ["id", "code"],
  });
  shippingOptionTypes.forEach((type) =>
    add("shipping_option_type", type.id, SHIPPING_OPTION_TYPES[type.code])
  );

  if (translations.length) {
    await createTranslationsWorkflow(container).run({
      input: { translations },
    });
  }

  logger.info(`Created ${translations.length} ${LOCALE} translations.`);
}
