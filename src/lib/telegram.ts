/**
 * Instant lead alerts to Telegram. Dependency-free, gated on env, and always
 * best-effort: a failed notification must never break a lead submission, since
 * the lead is already stored by the time we get here.
 *
 * Why Telegram alongside email: email alerts get buried, and speed to first
 * reply is the single biggest driver of whether a lead converts. A phone push
 * within seconds is the point.
 *
 * Required env (set in Vercel, never committed):
 *   TELEGRAM_BOT_TOKEN : from @BotFather, looks like 123456789:AA...
 *   TELEGRAM_CHAT_ID   : your own numeric chat id (see playbook/11)
 */

const API = "https://api.telegram.org";
/** Telegram hard-limits a message to 4096 chars. */
const MAX_LEN = 4000;

export function telegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

/**
 * Escape text for Telegram's HTML parse mode. Only &, < and > are special, and
 * they must be escaped or a lead whose message contains "<" silently fails to
 * send with a 400.
 */
export function tgEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export type TelegramResult = { sent: boolean; reason?: string };

/** Send a message. Never throws: returns a result the caller can ignore. */
export async function notifyTelegram(html: string): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { sent: false, reason: "not_configured" };

  try {
    const res = await fetch(`${API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: html.slice(0, MAX_LEN),
        parse_mode: "HTML",
        // Lead alerts are about the lead, not the URLs inside them.
        disable_web_page_preview: true,
      }),
      // Never let a slow Telegram call hold a lead submission open.
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[telegram] send failed:", res.status, body.slice(0, 300));
      return { sent: false, reason: `http_${res.status}` };
    }
    return { sent: true };
  } catch (e) {
    console.error("[telegram] send error:", (e as Error).message);
    return { sent: false, reason: "network" };
  }
}

/**
 * Build a consistent lead alert. Keeps every channel's message looking the
 * same in the phone notification, so the important line is always first.
 */
export function leadAlert(opts: {
  title: string;
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  source?: string;
  extra?: Record<string, string | undefined>;
  message?: string;
}): string {
  const rows: string[] = [];
  const add = (label: string, value?: string) => {
    if (value && value.trim()) rows.push(`<b>${label}:</b> ${tgEscape(value.trim())}`);
  };
  add("Name", opts.name);
  add("Email", opts.email);
  add("Phone", opts.phone);
  add("Website", opts.website);
  add("Source", opts.source);
  for (const [k, v] of Object.entries(opts.extra ?? {})) add(k, v);

  const body = opts.message?.trim()
    ? `\n\n<i>${tgEscape(opts.message.trim().slice(0, 800))}</i>`
    : "";

  return `🔔 <b>${tgEscape(opts.title)}</b>\n\n${rows.join("\n")}${body}`;
}
