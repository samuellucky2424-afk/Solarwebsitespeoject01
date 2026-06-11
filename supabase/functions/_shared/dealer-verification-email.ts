type DealerVerificationEmailStatus = "received" | "approved" | "rejected";

type DealerVerificationEmailInput = {
  to?: string | null;
  applicantName?: string | null;
  roleRequested: string;
  businessName?: string | null;
  status: DealerVerificationEmailStatus;
  adminNote?: string | null;
};

function escapeHtml(value: unknown) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeEmail(value: unknown) {
  const email = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function isValidSender(value: string) {
  const sender = value.trim();
  if (!sender) return false;

  const mailboxMatch = sender.match(/<([^<>]+)>$/);
  if (sender.includes("<") || sender.includes(">")) {
    return Boolean(mailboxMatch && normalizeEmail(mailboxMatch[1]));
  }

  return Boolean(normalizeEmail(sender));
}

function roleLabel(roleRequested: string) {
  return roleRequested === "installer" ? "installer" : "retailer";
}

function titleFor(status: DealerVerificationEmailStatus, role: string) {
  if (status === "received") return "Your application has been received";
  if (status === "approved") return `Your ${role} application has been approved`;
  return `Your ${role} application was not approved`;
}

function subjectFor(status: DealerVerificationEmailStatus, role: string) {
  if (status === "received") return "Greenlife Solar: Your application is under review";
  if (status === "approved") return `Greenlife Solar: Your ${role} application has been approved`;
  return `Greenlife Solar: Update on your ${role} application`;
}

function badgeStyle(status: DealerVerificationEmailStatus) {
  if (status === "approved") return "background:#dcfce7;color:#166534;border-color:#bbf7d0;";
  if (status === "rejected") return "background:#fee2e2;color:#991b1b;border-color:#fecaca;";
  return "background:#fef3c7;color:#92400e;border-color:#fde68a;";
}

function badgeText(status: DealerVerificationEmailStatus) {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Not Approved";
  return "Under Review";
}

function bodyCopy(input: DealerVerificationEmailInput) {
  const role = roleLabel(input.roleRequested);
  if (input.status === "received") {
    return `Thank you for registering with Greenlife Solar Solution as a ${role}. Your application has been received and is under review. Please confirm your email address and wait for your application to be reviewed. You will be notified immediately once a decision has been made.`;
  }

  if (input.status === "approved") {
    return `Congratulations. Your application on Greenlife Solar Solution as a ${role} has been accepted. You can now sign in to access your approved business dashboard and dealer product pricing.`;
  }

  return `Thank you for applying to Greenlife Solar Solution as a ${role}. After review, your application was not approved at this time. Please read any note from the admin below and contact support if you need clarification.`;
}

export function buildDealerVerificationEmail(input: DealerVerificationEmailInput) {
  const role = roleLabel(input.roleRequested);
  const applicantName = input.applicantName?.trim() || "Greenlife Partner";
  const businessName = input.businessName?.trim() || "Your business";
  const siteUrl = Deno.env.get("SITE_URL")?.trim()
    || Deno.env.get("PUBLIC_SITE_URL")?.trim()
    || Deno.env.get("APP_URL")?.trim()
    || "https://greenlifesolarsolution.com/#/login";
  const supportEmail = Deno.env.get("SUPPORT_EMAIL")?.trim()
    || Deno.env.get("ADMIN_EMAIL")?.trim()
    || "";

  const noteBlock = input.status === "rejected" && input.adminNote?.trim()
    ? `
      <tr>
        <td style="padding:0 28px 22px;">
          <div style="border-left:4px solid #ef4444;background:#fff7f7;border-radius:8px;padding:14px 16px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:800;color:#991b1b;text-transform:uppercase;letter-spacing:.08em;">Admin note</p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">${escapeHtml(input.adminNote)}</p>
          </div>
        </td>
      </tr>`
    : "";

  const actionBlock = input.status === "approved"
    ? `
      <tr>
        <td style="padding:0 28px 28px;text-align:center;">
          <a href="${escapeHtml(siteUrl)}" style="display:inline-block;background:#19e65f;color:#0d1b12;text-decoration:none;font-weight:900;border-radius:8px;padding:13px 22px;font-size:14px;">Sign in to your dashboard</a>
        </td>
      </tr>`
    : "";

  const footerSupport = supportEmail
    ? `Need help? Contact <a href="mailto:${escapeHtml(supportEmail)}" style="color:#4c9a52;text-decoration:none;font-weight:700;">${escapeHtml(supportEmail)}</a>.`
    : "Need help? Contact Greenlife Solar Solution support.";

  const html = `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(titleFor(input.status, role))}</title>
  </head>
  <body style="margin:0;padding:0;background:#eef5ef;font-family:Arial,Helvetica,sans-serif;color:#0d1b12;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef5ef;margin:0;padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 14px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #cfe7d1;box-shadow:0 18px 40px rgba(13,27,18,.08);">
            <tr>
              <td style="background:#0d1b12;padding:30px 28px;color:#ffffff;">
                <p style="margin:0 0 10px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#19e65f;font-weight:900;">Greenlife Solar Solution</p>
                <h1 style="margin:0;font-size:26px;line-height:1.2;font-weight:900;">${escapeHtml(titleFor(input.status, role))}</h1>
                <p style="margin:10px 0 0;color:#cbe8d0;font-size:14px;">Business verification update</p>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 28px 14px;">
                <span style="display:inline-block;border:1px solid;${badgeStyle(input.status)}border-radius:999px;padding:7px 12px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;">${badgeText(input.status)}</span>
                <p style="margin:18px 0 0;font-size:16px;line-height:1.7;color:#334155;">Hello ${escapeHtml(applicantName)},</p>
                <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#334155;">${escapeHtml(bodyCopy(input))}</p>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 28px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2eee4;border-radius:10px;overflow:hidden;">
                  <tr>
                    <td style="padding:12px 14px;background:#f7fbf8;font-size:12px;color:#64748b;font-weight:900;text-transform:uppercase;letter-spacing:.08em;">Business name</td>
                    <td style="padding:12px 14px;background:#f7fbf8;font-size:14px;color:#0d1b12;font-weight:800;text-align:right;">${escapeHtml(businessName)}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;border-top:1px solid #e2eee4;font-size:12px;color:#64748b;font-weight:900;text-transform:uppercase;letter-spacing:.08em;">Requested role</td>
                    <td style="padding:12px 14px;border-top:1px solid #e2eee4;font-size:14px;color:#0d1b12;font-weight:800;text-align:right;text-transform:capitalize;">${escapeHtml(role)}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;border-top:1px solid #e2eee4;font-size:12px;color:#64748b;font-weight:900;text-transform:uppercase;letter-spacing:.08em;">Status</td>
                    <td style="padding:12px 14px;border-top:1px solid #e2eee4;font-size:14px;color:#0d1b12;font-weight:800;text-align:right;">${badgeText(input.status)}</td>
                  </tr>
                </table>
              </td>
            </tr>

            ${noteBlock}
            ${actionBlock}

            <tr>
              <td style="background:#f7fbf8;padding:18px 28px;border-top:1px solid #e2eee4;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">${footerSupport}</p>
                <p style="margin:8px 0 0;font-size:11px;line-height:1.6;color:#94a3b8;">This is an automated notification from Greenlife Solar Solution.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    subject: subjectFor(input.status, role),
    html,
  };
}

export async function sendDealerVerificationEmail(input: DealerVerificationEmailInput) {
  const to = normalizeEmail(input.to);
  if (!to) return { sent: false, skipped: true, reason: "missing_recipient" };

  const resendApiKey = Deno.env.get("RESEND_API_KEY")?.trim();
  const from = Deno.env.get("RESEND_FROM_EMAIL")?.trim();

  if (!resendApiKey || !from) {
    console.warn("Dealer verification email skipped: RESEND_API_KEY or RESEND_FROM_EMAIL is not configured.");
    return { sent: false, skipped: true, reason: "email_not_configured" };
  }

  if (!isValidSender(from)) {
    console.warn("Dealer verification email skipped: RESEND_FROM_EMAIL is invalid.");
    return { sent: false, skipped: true, reason: "invalid_from_email" };
  }

  const { subject, html } = buildDealerVerificationEmail(input);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        tags: [
          { name: "category", value: "dealer_verification" },
          { name: "status", value: input.status },
        ],
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.warn("Dealer verification email failed", response.status, data);
      return {
        sent: false,
        skipped: false,
        reason: data?.message || "resend_failed",
        status: response.status,
      };
    }

    return { sent: true, id: data?.id };
  } catch (err) {
    console.warn("Dealer verification email exception", err);
    return {
      sent: false,
      skipped: false,
      reason: String((err as any)?.message || err || "email_exception"),
    };
  }
}
