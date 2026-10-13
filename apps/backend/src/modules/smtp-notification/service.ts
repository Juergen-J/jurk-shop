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
  /** Resend API key: sends over HTTPS (Railway blocks SMTP below the Pro plan). */
  resend_api_key?: string
  reply_to?: string
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
 * Sends emails through the Resend API (RESEND_API_KEY) or over SMTP
 * (SMTP_HOST). Without either (local development) emails are not sent but
 * written to `preview_dir` so they can be opened in a browser.
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

    if (this.options_.resend_api_key) {
      return this.sendWithResend(from, to, content, attachments)
    }

    if (!this.transporter_) {
      return this.writePreview(notification.template, to, content.subject, content.html)
    }

    const info = await this.transporter_.sendMail({
      from,
      to,
      replyTo: this.options_.reply_to,
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

  private async sendWithResend(
    from: string,
    to: string,
    content: NonNullable<ProviderSendNotificationDTO["content"]>,
    attachments: ProviderSendNotificationDTO["attachments"]
  ): Promise<ProviderSendNotificationResultsDTO> {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options_.resend_api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: content.subject,
        html: content.html,
        text: content.text,
        ...(this.options_.reply_to ? { reply_to: this.options_.reply_to } : {}),
        ...(attachments?.length
          ? {
              attachments: attachments.map((a) => ({
                filename: a.filename,
                content: a.content,
              })),
            }
          : {}),
      }),
    })
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string }
    if (!res.ok) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Resend could not send "${content.subject}" to ${to}: ${res.status} ${body.message ?? ""}`
      )
    }
    return { id: body.id }
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
      `[email] No RESEND_API_KEY or SMTP_HOST, not sent. To: ${to}, subject: "${subject}". Preview: ${file}`
    )

    return { id: file }
  }
}

export default SmtpNotificationProviderService
