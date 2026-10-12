import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { updateTaxRatesWorkflow } from "@medusajs/medusa/core-flows";
import { COMPANY } from "../legal/company";

/**
 * Kleinunternehmer (§ 19 UStG): the default German tax rate becomes 0 %, so
 * Medusa charges and shows no VAT. Prices stay the same final prices.
 */
export default async function kleinunternehmer_tax({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  if (!COMPANY.smallBusiness) {
    logger.info("Not a Kleinunternehmer, keeping the tax rates.");
    return;
  }

  const taxService = container.resolve(Modules.TAX);
  const regions = await taxService.listTaxRegions({ country_code: "de" });
  const rates = (
    await taxService.listTaxRates({
      tax_region_id: regions.map((r) => r.id),
    })
  ).filter((rate) => rate.is_default);

  if (!rates.length) {
    logger.warn("No default tax rate for Germany found.");
    return;
  }

  await updateTaxRatesWorkflow(container).run({
    input: {
      selector: { id: rates.map((r) => r.id) },
      update: {
        rate: 0,
        code: "KU19",
        name: "Kleinunternehmer (§ 19 UStG)",
      },
    },
  });

  logger.info(`Set ${rates.length} German tax rate(s) to 0 % (§ 19 UStG).`);
}
