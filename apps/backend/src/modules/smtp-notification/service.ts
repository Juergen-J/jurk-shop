import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils"
import type {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import fs from "node:fs/promises"
import path from "node:path"
import nodemailer, { Transporter } from "nodemailer"

type Options = {
  host?: string
  port?: number
  secure?: boolean
  user?: string
  pass?: string
  from: string
  /** Where emails are written as .html files when no SMTP host is configured. */
  preview_dir?: string
}

type InjectedDependencies = {
  logger: Logger
}

/**
 * Sends emails over SMTP. Without SMTP_HOST (local development) emails are
 * not sent but written to `preview_dir` so they can be opened in a browser.
 */
class SmtpNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "smtp"

  protected logger_: Logger
  protected options_: Options
  protected transporter_: Transporter | null

  constructor({ logger }: InjectedDependencies, options: Options) {
    super()

    this.logger_ = logger
    this.options_ = options
    this.transporter_ = options.host
      ? nodemailer.createTransport({
          host: options.host,
          port: options.port ?? 587,
          secure: options.secure ?? options.port === 465,
          auth: options.user
            ? { user: options.user, pass: options.pass }
            : undefined,
        })
      : null
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The SMTP notification provider requires a `from` address (EMAIL_FROM)."
      )
    }
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const { to, content, attachments } = notification
    const from = notification.from || this.options_.from

    if (!content?.subject || !content.html) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Email "${notification.template}" has no subject or HTML content.`
      )
    }

    if (!this.transporter_) {
      return this.writePreview(notification.template, to, content.subject, content.html)
    }

    const info = await this.transporter_.sendMail({
      from,
      to,
      subject: content.subject,
      html: content.html,
      text: content.text,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        encoding: "base64",
        contentType: a.content_type,
      })),
    })

    return { id: info.messageId }
  }

  private async writePreview(
    template: string,
    to: string,
    subject: string,
    html: string
  ): Promise<ProviderSendNotificationResultsDTO> {
    const dir = path.resolve(this.options_.preview_dir ?? ".emails")
    const file = path.join(
      dir,
      `${new Date().toISOString().replace(/[:.]/g, "-")}-${template}.html`
    )

    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(file, html)

    this.logger_.info(
      `[email] SMTP not configured, not sent. To: ${to}, subject: "${subject}". Preview: ${file}`
    )

    return { id: file }
  }
}

export default SmtpNotificationProviderService
