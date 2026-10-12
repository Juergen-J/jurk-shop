import { COMPANY, companyAddressLines, SMALL_BUSINESS_NOTE } from "./company"

/**
 * Legal texts of the shop. Single source for the storefront pages
 * (GET /store/legal/:slug) and the texts attached to order emails.
 * German is the binding language.
 */
export type LegalBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "lines"; lines: string[] }
  | { type: "list"; items: string[] }

export type LegalDocument = {
  slug: LegalSlug
  title: string
  updated: string
  blocks: LegalBlock[]
}

export type LegalSlug =
  | "impressum"
  | "datenschutz"
  | "agb"
  | "widerrufsbelehrung"

const UPDATED = "12.10.2026"
const WITHDRAWAL_URL = `${COMPANY.shopUrl}/de/widerruf`

const contactLines = () => [
  ...companyAddressLines(),
  `Telefon: ${COMPANY.phone}`,
  `E-Mail: ${COMPANY.email}`,
]

const impressum: LegalDocument = {
  slug: "impressum",
  title: "Impressum",
  updated: UPDATED,
  blocks: [
    { type: "h2", text: "Angaben gemäß § 5 DDG" },
    { type: "lines", lines: companyAddressLines() },
    { type: "h2", text: "Kontakt" },
    { type: "lines", lines: [`Telefon: ${COMPANY.phone}`, `E-Mail: ${COMPANY.email}`] },
    ...(COMPANY.vatId
      ? ([
          { type: "h2", text: "Umsatzsteuer-ID" },
          {
            type: "p",
            text: `Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: ${COMPANY.vatId}`,
          },
        ] as LegalBlock[])
      : []),
    ...(COMPANY.smallBusiness
      ? ([
          { type: "h2", text: "Umsatzsteuer" },
          {
            type: "p",
            text: `Kleinunternehmer im Sinne von § 19 Abs. 1 UStG. ${SMALL_BUSINESS_NOTE}`,
          },
        ] as LegalBlock[])
      : []),
    { type: "h2", text: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV" },
    {
      type: "lines",
      lines: [COMPANY.owner, COMPANY.street, `${COMPANY.postalCode} ${COMPANY.city}`],
    },
    { type: "h2", text: "Verbraucherstreitbeilegung" },
    {
      type: "p",
      text: "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
    },
    { type: "h2", text: "Haftung für Links" },
    {
      type: "p",
      text: "Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.",
    },
    { type: "h2", text: "Urheberrecht" },
    {
      type: "p",
      text: "Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.",
    },
  ],
}

const widerrufsbelehrung: LegalDocument = {
  slug: "widerrufsbelehrung",
  title: "Widerrufsbelehrung",
  updated: UPDATED,
  blocks: [
    // Text of the official model (Anlage 1 zu Art. 246a § 1 Abs. 2 Satz 2
    // EGBGB, Stand 19.06.2026), filled in for a purchase contract.
    { type: "h2", text: "Widerrufsrecht" },
    {
      type: "p",
      text: "Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.",
    },
    {
      type: "p",
      text: "Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.",
    },
    {
      type: "p",
      text: `Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (${COMPANY.name}, Inhaber ${COMPANY.owner}, ${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}, Telefon: ${COMPANY.phone}, E-Mail: ${COMPANY.email}) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist. Sie können Ihr Widerrufsrecht auch online unter ${WITHDRAWAL_URL} (Schaltfläche „Vertrag widerrufen“ auf jeder Seite unseres Shops) ausüben. Wenn Sie diese Online-Funktion nutzen, übermitteln wir Ihnen auf einem dauerhaften Datenträger (z. B. durch eine E-Mail) unverzüglich eine Eingangsbestätigung mit Informationen zum Inhalt der Widerrufserklärung sowie dem Datum und der Uhrzeit ihres Eingangs.`,
    },
    {
      type: "p",
      text: "Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.",
    },
    { type: "h2", text: "Folgen des Widerrufs" },
    {
      type: "p",
      text: "Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet. Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.",
    },
    {
      type: "p",
      text: `Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns (${COMPANY.name}, ${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}) zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.`,
    },
    {
      type: "p",
      text: "Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.",
    },
    {
      type: "p",
      text: "Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.",
    },
    { type: "h3", text: "Ende der Widerrufsbelehrung" },
    // Anlage 2 zu Art. 246a § 1 Abs. 2 Satz 1 Nr. 1 EGBGB
    { type: "h2", text: "Muster-Widerrufsformular" },
    {
      type: "p",
      text: "(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)",
    },
    {
      type: "list",
      items: [
        `An ${COMPANY.name}, Inhaber ${COMPANY.owner}, ${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}, E-Mail: ${COMPANY.email}:`,
        "Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)",
        "Bestellt am (*)/erhalten am (*)",
        "Name des/der Verbraucher(s)",
        "Anschrift des/der Verbraucher(s)",
        "Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)",
        "Datum",
      ],
    },
    { type: "p", text: "(*) Unzutreffendes streichen." },
  ],
}

const agb: LegalDocument = {
  slug: "agb",
  title: "Allgemeine Geschäftsbedingungen",
  updated: UPDATED,
  blocks: [
    { type: "h2", text: "§ 1 Geltungsbereich und Anbieter" },
    {
      type: "p",
      text: `(1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen, die Verbraucher und Unternehmer über den Online-Shop ${COMPANY.shopName} (${COMPANY.shopUrl}) abgeben.`,
    },
    {
      type: "p",
      text: `(2) Vertragspartner ist ${COMPANY.name}, Inhaber ${COMPANY.owner}, ${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}, E-Mail: ${COMPANY.email}, Telefon: ${COMPANY.phone} (im Folgenden „wir“).`,
    },
    {
      type: "p",
      text: "(3) Verbraucher ist jede natürliche Person, die ein Rechtsgeschäft zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit zugerechnet werden können (§ 13 BGB). Abweichende Bedingungen des Kunden gelten nicht, es sei denn, wir stimmen ihrer Geltung ausdrücklich zu.",
    },
    { type: "h2", text: "§ 2 Vertragsschluss" },
    {
      type: "p",
      text: "(1) Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot, sondern eine Aufforderung zur Bestellung dar. Unsere Produkte werden nach der Bestellung im 3D-Druck in der gewählten Ausführung (z. B. Kaliber, Größe, Farbe) gefertigt.",
    },
    {
      type: "p",
      text: "(2) Der Bestellvorgang läuft wie folgt ab: Sie wählen die gewünschte Ausführung und legen das Produkt in den Warenkorb. Im Bestellprozess geben Sie Ihre Liefer- und Rechnungsadresse sowie Ihre E-Mail-Adresse an und wählen Versand- und Zahlungsart. Vor dem Absenden der Bestellung können Sie alle Angaben auf der Übersichtsseite prüfen und über die Schaltfläche „Bearbeiten“ bzw. durch Zurückgehen im Warenkorb korrigieren. Mit Klick auf die Schaltfläche „Zahlungspflichtig bestellen“ geben Sie ein verbindliches Angebot zum Kauf der Waren im Warenkorb ab.",
    },
    {
      type: "p",
      text: "(3) Wir nehmen Ihr Angebot an, indem wir Ihnen unmittelbar nach Absenden der Bestellung eine Bestellbestätigung per E-Mail senden. Mit Zugang dieser E-Mail kommt der Kaufvertrag zustande.",
    },
    {
      type: "p",
      text: "(4) Vertragssprache ist Deutsch. Den Vertragstext speichern wir. Die Bestelldaten, diese AGB und die Widerrufsbelehrung senden wir Ihnen mit der Bestellbestätigung per E-Mail zu. Die AGB können Sie außerdem jederzeit auf dieser Seite abrufen.",
    },
    { type: "h2", text: "§ 3 Preise und Versandkosten" },
    {
      type: "p",
      text: COMPANY.smallBusiness
        ? "(1) Alle Preise sind Endpreise in Euro. Aufgrund des Kleinunternehmerstatus gemäß § 19 UStG wird keine Umsatzsteuer erhoben und daher auch nicht ausgewiesen."
        : "(1) Alle Preise sind Endpreise in Euro und enthalten die gesetzliche Umsatzsteuer.",
    },
    {
      type: "p",
      text: "(2) Zusätzlich zu den Preisen fallen Versandkosten an, sofern die Bestellung nicht die Voraussetzungen für kostenlosen Versand erfüllt. Die Versandkosten und gegebenenfalls gewährte Rabatte werden auf der Seite „Versand & Zahlung“ sowie im Warenkorb und im Bestellprozess deutlich angegeben.",
    },
    { type: "h2", text: "§ 4 Zahlung" },
    {
      type: "p",
      text: "(1) Die Zahlung erfolgt per Vorkasse (Überweisung). Unsere Bankverbindung erhalten Sie nach Abschluss der Bestellung auf der Bestellbestätigungsseite und in der Bestellbestätigung per E-Mail.",
    },
    {
      type: "p",
      text: "(2) Der Rechnungsbetrag ist innerhalb von 7 Tagen nach Vertragsschluss zur Zahlung fällig. Die Fertigung Ihrer Bestellung beginnt nach Zahlungseingang. Geht die Zahlung trotz Fälligkeit und einer weiteren Zahlungserinnerung nicht innerhalb von 14 Tagen nach Vertragsschluss ein, sind wir berechtigt, vom Vertrag zurückzutreten.",
    },
    { type: "h2", text: "§ 5 Lieferung, Herstellungs- und Lieferzeit" },
    {
      type: "p",
      text: "(1) Wir liefern ausschließlich an Adressen in Deutschland. Der Versand erfolgt mit DHL.",
    },
    {
      type: "p",
      text: "(2) Die Herstellungszeit richtet sich nach der bestellten Menge und ist auf der Produktseite, im Warenkorb und in der Bestellbestätigung angegeben. Sie beginnt am Tag nach Zahlungseingang. Nach der Fertigung wird die Ware an DHL übergeben; die Zustellung erfolgt in der Regel innerhalb von 1–2 Werktagen. Werktage sind Montag bis Freitag mit Ausnahme gesetzlicher Feiertage in Berlin.",
    },
    {
      type: "p",
      text: "(3) Unsere Produkte werden im 3D-Druck gefertigt. Geringfügige, fertigungsbedingte Abweichungen in Oberflächenstruktur und Farbton gegenüber den Produktabbildungen sind möglich und stellen keinen Mangel dar, soweit die Gebrauchstauglichkeit nicht beeinträchtigt ist.",
    },
    { type: "h2", text: "§ 6 Eigentumsvorbehalt" },
    {
      type: "p",
      text: "Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.",
    },
    { type: "h2", text: "§ 7 Widerrufsrecht" },
    {
      type: "p",
      text: "Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Einzelheiten ergeben sich aus der Widerrufsbelehrung. Den Widerruf können Sie auch online über die Schaltfläche „Vertrag widerrufen“ erklären.",
    },
    { type: "h2", text: "§ 8 Gewährleistung" },
    {
      type: "p",
      text: "Es gelten die gesetzlichen Mängelhaftungsrechte. Bitte melden Sie offensichtliche Transportschäden möglichst bald dem Zusteller und uns; Ihre gesetzlichen Rechte bleiben davon unberührt.",
    },
    { type: "h2", text: "§ 9 Haftung" },
    {
      type: "p",
      text: "(1) Wir haften unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit, für vorsätzlich oder grob fahrlässig verursachte Schäden, nach dem Produkthaftungsgesetz sowie im Umfang einer übernommenen Garantie.",
    },
    {
      type: "p",
      text: "(2) Bei leicht fahrlässiger Verletzung einer wesentlichen Vertragspflicht, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung Sie regelmäßig vertrauen dürfen (Kardinalpflicht), ist unsere Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt. Im Übrigen ist die Haftung für leichte Fahrlässigkeit ausgeschlossen.",
    },
    {
      type: "p",
      text: "(3) Unsere Patronenboxen dienen der Aufbewahrung und dem Transport. Die Einhaltung der für Waffen und Munition geltenden Aufbewahrungs- und Transportvorschriften liegt in der Verantwortung des Kunden.",
    },
    { type: "h2", text: "§ 10 Streitbeilegung" },
    {
      type: "p",
      text: "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
    },
    { type: "h2", text: "§ 11 Schlussbestimmungen" },
    {
      type: "p",
      text: "(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Bei Verbrauchern gilt diese Rechtswahl nur insoweit, als nicht der gewährte Schutz durch zwingende Bestimmungen des Rechts des Staates, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat, entzogen wird.",
    },
    {
      type: "p",
      text: "(2) Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.",
    },
  ],
}

const datenschutz: LegalDocument = {
  slug: "datenschutz",
  title: "Datenschutzerklärung",
  updated: UPDATED,
  blocks: [
    { type: "h2", text: "1. Verantwortlicher" },
    {
      type: "p",
      text: "Verantwortlich für die Verarbeitung personenbezogener Daten in diesem Online-Shop ist:",
    },
    { type: "lines", lines: contactLines() },
    { type: "h2", text: "2. Hosting und Server-Logfiles" },
    {
      type: "p",
      text: "Der Shop wird bei einem externen Hosting-Dienstleister betrieben, mit dem wir einen Vertrag über die Auftragsverarbeitung (Art. 28 DSGVO) geschlossen haben. Beim Aufruf des Shops werden automatisch Informationen an den Server übermittelt (IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seite, Browsertyp und Betriebssystem). Diese Daten werden zur Gewährleistung eines sicheren und stabilen Betriebs in Server-Logfiles gespeichert und nach spätestens 7 Tagen gelöscht. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse liegt in der Sicherheit und Funktionsfähigkeit des Shops.",
    },
    { type: "h2", text: "3. Bestellungen" },
    {
      type: "p",
      text: "Wenn Sie bei uns bestellen, verarbeiten wir die Daten, die Sie im Bestellprozess angeben: Name, Liefer- und Rechnungsadresse, E-Mail-Adresse, optional Telefonnummer und Firma, die bestellten Artikel sowie Zahlungs- und Versandinformationen. Wir verwenden diese Daten, um den Vertrag zu schließen und abzuwickeln, Ihnen die Bestellbestätigung und Informationen zur Bestellung per E-Mail zu senden und Zahlungen zuzuordnen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.",
    },
    {
      type: "p",
      text: "Aufgrund handels- und steuerrechtlicher Vorgaben (§ 257 HGB, § 147 AO) speichern wir Bestell- und Rechnungsdaten bis zu 10 Jahre. Rechtsgrundlage hierfür ist Art. 6 Abs. 1 lit. c DSGVO.",
    },
    { type: "h2", text: "4. Weitergabe an Versanddienstleister" },
    {
      type: "p",
      text: "Zur Zustellung Ihrer Bestellung geben wir Ihren Namen und Ihre Lieferadresse an die Deutsche Post DHL weiter. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.",
    },
    { type: "h2", text: "5. Zahlung per Vorkasse" },
    {
      type: "p",
      text: "Bei Zahlung per Überweisung erhalten wir von Ihrer Bank die üblichen Überweisungsdaten (Name des Kontoinhabers, IBAN, Betrag, Verwendungszweck). Wir verwenden sie ausschließlich zur Zuordnung Ihrer Zahlung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.",
    },
    { type: "h2", text: "6. E-Mail-Versand" },
    {
      type: "p",
      text: "Bestellbestätigungen und Eingangsbestätigungen für Widerrufe versenden wir über den E-Mail-Server unseres E-Mail-Anbieters. Eine Nutzung Ihrer E-Mail-Adresse für Werbung findet nicht statt.",
    },
    { type: "h2", text: "7. Online-Widerruf und Kontakt" },
    {
      type: "p",
      text: "Wenn Sie die Funktion „Vertrag widerrufen“ nutzen oder uns per E-Mail oder Telefon kontaktieren, verarbeiten wir die angegebenen Daten (z. B. Name, E-Mail-Adresse, Bestellnummer, Nachricht), um Ihr Anliegen zu bearbeiten und Ihnen eine Eingangsbestätigung zu senden. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b und c DSGVO.",
    },
    { type: "h2", text: "8. Cookies" },
    {
      type: "p",
      text: "Der Shop verwendet ausschließlich technisch notwendige Cookies, z. B. um Ihren Warenkorb, die gewählte Sprache und die Lieferregion zu speichern. Diese Cookies sind für den von Ihnen gewünschten Dienst unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG); die weitere Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO. Tracking- oder Marketing-Cookies setzen wir nicht ein.",
    },
    { type: "h2", text: "9. Speicherdauer" },
    {
      type: "p",
      text: "Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.",
    },
    { type: "h2", text: "10. Ihre Rechte" },
    {
      type: "p",
      text: "Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (Art. 21). Wenden Sie sich dazu an die oben genannte E-Mail-Adresse.",
    },
    {
      type: "p",
      text: "Sie haben außerdem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, zum Beispiel bei der Berliner Beauftragten für Datenschutz und Informationsfreiheit.",
    },
    { type: "h2", text: "11. SSL-/TLS-Verschlüsselung" },
    {
      type: "p",
      text: "Der Shop nutzt eine SSL- bzw. TLS-Verschlüsselung, um die Übertragung Ihrer Daten zu schützen.",
    },
  ],
}

export const LEGAL_DOCUMENTS: Record<LegalSlug, LegalDocument> = {
  impressum,
  datenschutz,
  agb,
  widerrufsbelehrung,
}

export const isLegalSlug = (slug: string): slug is LegalSlug =>
  slug in LEGAL_DOCUMENTS
