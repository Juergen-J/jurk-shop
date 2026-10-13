import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Production time tiers by total number of boxes in a cart. Stored on the
 * store's metadata as a JSON string so it can be edited in the admin.
 * The last tier has no max and applies to everything above.
 */
const PRODUCTION_TIERS = [
  { max: 2, min_days: 2, max_days: 3 },
  { max: 5, min_days: 4, max_days: 6 },
  { max: null, min_days: 7, max_days: 10 },
];

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  // Migration scripts are tracked by file name, which differs between the
  // dev (.ts) and the production build (.js). Never seed a store twice.
  const { data: existingStores } = await query.graph({
    entity: "store",
    fields: ["id"],
  });
  if (existingStores.length) {
    logger.info("Store already exists, skipping the initial data seed.");
    return;
  }

  const countries = ["de"];

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Webshop",
          description: "Online-Shop",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Storefront",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Jurk Shop",
          supported_currencies: [
            {
              currency_code: "eur",
              is_default: true,
              is_tax_inclusive: true,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
          metadata: {
            production_tiers: JSON.stringify(PRODUCTION_TIERS),
          },
        },
      ],
    },
  });

  logger.info("Seeding region data...");
  await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Deutschland",
          currency_code: "eur",
          countries,
          automatic_taxes: true,
          is_tax_inclusive: true,
          // Manual payment: Vorkasse / Rechnung, marked as paid in the admin.
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
      default_tax_rate: {
        rate: 19,
        code: "MWST19",
        name: "MwSt. 19%",
      },
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Werkstatt",
          address: {
            city: "",
            country_code: "DE",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  // This is created by a migration script in core.
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Versand ab Werkstatt",
    type: "shipping",
    service_zones: [
      {
        name: "Deutschland",
        geo_zones: countries.map((country_code) => ({
          country_code,
          type: "country" as const,
        })),
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "DHL Paket",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "DHL Paket",
          description: "Zustellung 1-2 Werktage nach Fertigstellung.",
          code: "dhl-paket",
        },
        prices: [
          {
            currency_code: "eur",
            amount: 4.99,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });
  logger.info("Finished seeding stock location data.");
  // Categories and products: node tools/catalog/import.mjs (see DEPLOY.md)
}
