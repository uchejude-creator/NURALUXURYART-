import { Resend } from "resend";

type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string | string[];
};

type EmailResult =
  | {
      status: "sent";
      id?: string;
    }
  | {
      status: "skipped";
      reason: string;
    }
  | {
      status: "failed";
      error: unknown;
    };

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  resendClient ??= new Resend(apiKey);

  return resendClient;
}

export function getEmailFrom() {
  return process.env.EMAIL_FROM || "NURALUXURYART <hello@nuraluxuryart.com>";
}

export function getEmailReplyTo() {
  return process.env.EMAIL_REPLY_TO || "nuraluxuryng@gmail.com";
}

export function getAdminNotifyEmail() {
  return process.env.ADMIN_NOTIFY_EMAIL || "nuraluxuryng@gmail.com";
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const resend = getResendClient();

  if (!resend) {
    return {
      status: "skipped",
      reason: "RESEND_API_KEY is not configured.",
    };
  }

  const { data, error } = await resend.emails.send({
    from: getEmailFrom(),
    replyTo: payload.replyTo ?? getEmailReplyTo(),
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  if (error) {
    return {
      status: "failed",
      error,
    };
  }

  return {
    status: "sent",
    id: data?.id,
  };
}

export async function sendEmailSafely(label: string, payload: EmailPayload) {
  try {
    const result = await sendEmail(payload);

    if (result.status !== "sent") {
      console.warn(`NURALUXURYART email ${label} ${result.status}`, result);
    }

    return result;
  } catch (error) {
    console.error(`NURALUXURYART email ${label} failed`, error);

    return {
      status: "failed",
      error,
    } satisfies EmailResult;
  }
}
