import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  createTranslationsWorkflow,
  deleteProductOptionsWorkflow,
  deleteProductsWorkflow,
  updateProductOptionsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows";
import {
  CATEGORIES,
  COLOR_OPTION,
  COLORS,
  COLORS_EN,
  PARENT_CATEGORY,
  PLACEHOLDER_PRICE,
  PRODUCTS,
  SIZE_OPTION,
  productDescription,
  productDescriptionEn,
  productTitle,
  productTitleEn,
} from "../catalog/boxloc";

const LOCALE = "en-US";

/** Sample product and options from the first seed, replaced by the catalogue. */
const SAMPLE_PRODUCT_HANDLE = "patronenbox";
const SAMPLE_OPTIONS = ["Kaliber", "Größe"];

const toSkuPart = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]+/g, "");

type TranslationInput = {
  reference_id: string;
  reference: string;
  locale_code: string;
  translations: Record<string, string>;
};

/**
 * Creates the categories and products from src/catalog/boxloc.ts with English
 * translations. Idempotent: existing categories, option values and products
 * (by handle) are left alone, so prices and texts edited in the admin stay.
 */
export default async function product_catalog({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "default_sales_channel_id"],
  });
  if (!stores.length) {
    logger.info("No store yet, skipping the product catalogue.");
    return;
  }
  const salesChannelId = stores[0].default_sales_channel_id;

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });

  const translations: TranslationInput[] = [];
  const translate = (
    reference: string,
    reference_id: string,
    fields: Record<string, string>
  ) =>
    translations.push({
      reference,
      reference_id,
      locale_code: LOCALE,
      translations: fields,
    });

  // Replace the sample product of the first seed.
  const { data: samples } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { handle: SAMPLE_PRODUCT_HANDLE },
  });
  if (samples.length) {
    await deleteProductsWorkflow(container).run({
      input: { ids: samples.map((product) => product.id) },
    });
    logger.info("Deleted the sample product.");
  }
  const { data: sampleOptions } = await query.graph({
    entity: "product_option",
    fields: ["id"],
    filters: { title: SAMPLE_OPTIONS },
  });
  if (sampleOptions.length) {
    await deleteProductOptionsWorkflow(container).run({
      input: { ids: sampleOptions.map((option) => option.id) },
    });
  }

  // Categories: Munitionsboxen > Kurzwaffe, Kleinkaliber, ...
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
  });
  const categoryIds = new Map(
    existingCategories.map((category) => [category.handle, category.id])
  );
  if (!categoryIds.has(PARENT_CATEGORY.handle)) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          {
            name: PARENT_CATEGORY.name,
            handle: PARENT_CATEGORY.handle,
            is_active: true,
          },
        ],
      },
    });
    categoryIds.set(PARENT_CATEGORY.handle, result[0].id);
    translate("product_category", result[0].id, {
      name: PARENT_CATEGORY.name_en,
    });
  }
  const newCategories = CATEGORIES.filter(
    (category) => !categoryIds.has(category.handle)
  );
  if (newCategories.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: newCategories.map((category, rank) => ({
          name: category.name,
          handle: category.handle,
          parent_category_id: categoryIds.get(PARENT_CATEGORY.handle),
          is_active: true,
          rank,
        })),
      },
    });
    result.forEach((category) => {
      categoryIds.set(category.handle, category.id);
      translate("product_category", category.id, {
        name: CATEGORIES.find((c) => c.handle === category.handle)!.name_en,
      });
    });
  }

  // Shared options "Ausführung" and "Farbe". Each product links only the
  // sizes it is made in.
  const sizeValues = new Map<string, string>();
  PRODUCTS.forEach((product) =>
    product.sizes.forEach((size) => sizeValues.set(size.value, size.value_en))
  );
  const colorValues = new Map(COLORS.map((color) => [color, COLORS_EN[color]]));

  // Values are ranked in catalogue order and options carry metadata.rank, so
  // the storefront shows "Ausführung" before "Farbe" and sizes small to large.
  const ensureOption = async (
    option: { title: string; title_en: string },
    values: Map<string, string>,
    rank: number
  ) => {
    const fetchOption = async () => {
      const { data } = await query.graph({
        entity: "product_option",
        fields: ["id", "values.id", "values.value"],
        filters: { title: option.title },
      });
      return data[0];
    };
    const ranks = Object.fromEntries(
      Array.from(values.keys()).map((value, index) => [value, index])
    );
    const translateValues = (
      optionValues: { id: string; value: string }[],
      only?: string[]
    ) =>
      optionValues
        .filter((value) => !only || only.includes(value.value))
        .forEach((value) =>
          translate("product_option_value", value.id, {
            value: values.get(value.value)!,
          })
        );

    let existing = await fetchOption();
    if (!existing) {
      await createProductOptionsWorkflow(container).run({
        input: {
          product_options: [
            {
              title: option.title,
              values: Array.from(values.keys()),
              ranks,
              metadata: { rank },
            },
          ],
        },
      });
      existing = await fetchOption();
      translate("product_option", existing.id, { title: option.title_en });
      translateValues(existing.values as { id: string; value: string }[]);
    } else {
      const known = existing.values.map((value) => value!.value);
      const missing = Array.from(values.keys()).filter(
        (value) => !known.includes(value)
      );
      await updateProductOptionsWorkflow(container).run({
        input: {
          selector: { id: existing.id },
          update: {
            ...(missing.length ? { values: [...known, ...missing] } : {}),
            ranks,
            metadata: { rank },
          },
        },
      });
      if (missing.length) {
        existing = await fetchOption();
        translateValues(
          existing.values as { id: string; value: string }[],
          missing
        );
      }
    }

    return {
      id: existing.id,
      valueIds: new Map(
        existing.values.map((value) => [value!.value, value!.id])
      ),
    };
  };

  const sizeOption = await ensureOption(SIZE_OPTION, sizeValues, 0);
  const colorOption = await ensureOption(COLOR_OPTION, colorValues, 1);

  // Products
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["handle"],
    filters: { handle: PRODUCTS.map((product) => product.handle) },
  });
  const existingHandles = new Set(
    existingProducts.map((product) => product.handle)
  );
  const newProducts = PRODUCTS.filter(
    (product) => !existingHandles.has(product.handle)
  );

  if (newProducts.length) {
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: newProducts.map((product) => ({
          title: productTitle(product),
          subtitle: "3D-gedruckt nach Bestellung",
          description: productDescription(product),
          handle: product.handle,
          category_ids: [categoryIds.get(product.category)!],
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfiles[0]?.id,
          metadata: {
            caliber: product.caliber,
            design: "BoxLoc by Layer51",
            // Set to true once AI-edited photos are uploaded; the storefront
            // then labels them as such.
            ai_images: false,
          },
          options: [
            {
              id: sizeOption.id,
              value_ids: product.sizes.map(
                (size) => sizeOption.valueIds.get(size.value)!
              ),
            },
            {
              id: colorOption.id,
              value_ids: COLORS.map((color) => colorOption.valueIds.get(color)!),
            },
          ],
          // Printed on demand: no inventory, every variant can be ordered.
          variants: product.sizes.flatMap((size) =>
            COLORS.map((color) => ({
              title: `${size.value} / ${color}`,
              sku: `MB-${toSkuPart(product.caliber)}-${toSkuPart(size.value)}-${toSkuPart(color)}`,
              manage_inventory: false,
              weight: size.weight,
              metadata: { makerworld_id: size.model },
              options: {
                [SIZE_OPTION.title]: size.value,
                [COLOR_OPTION.title]: color,
              },
              prices: [
                {
                  amount: size.price ?? PLACEHOLDER_PRICE,
                  currency_code: "eur",
                },
              ],
            }))
          ),
          sales_channels: salesChannelId ? [{ id: salesChannelId }] : [],
        })),
      },
    });

    result.forEach((created) => {
      const product = PRODUCTS.find((p) => p.handle === created.handle)!;
      translate("product", created.id, {
        title: productTitleEn(product),
        subtitle: "3D printed to order",
        description: productDescriptionEn(product),
      });
    });
  }

  // Fill in weights of existing variants that have none (weights edited in
  // the admin are kept).
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "weight", "product.handle", "options.value"],
    filters: { weight: null },
  });
  const weightUpdates = variants.flatMap((variant) => {
    const product = PRODUCTS.find((p) => p.handle === variant.product?.handle);
    const values = (variant.options ?? []).map((option) => option?.value);
    const size = product?.sizes.find((s) => values.includes(s.value));
    return size ? [{ id: variant.id, weight: size.weight }] : [];
  });
  if (weightUpdates.length) {
    await updateProductVariantsWorkflow(container).run({
      input: { product_variants: weightUpdates },
    });
  }

  if (translations.length) {
    await createTranslationsWorkflow(container).run({
      input: { translations },
    });
  }

  logger.info(
    `Product catalogue: ${newProducts.length} products created, ${existingHandles.size} already existed, ${weightUpdates.length} variant weights set.`
  );
}
