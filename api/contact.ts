import type {VercelRequest, VercelResponse} from '@vercel/node';
import {Resend} from 'resend';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  response.setHeader('Access-Control-Allow-Origin', 'https://www.bmcautos47.com');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) {
    return response.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const body = request.body as Record<string, string | undefined>;
  const {
    name,
    email,
    phone,
    projectType,
    budget,
    message,
    brand,
    model,
    transmission,
    fuel,
    category,
    mileage,
    yearFrom,
    yearTo,
    repriseBrand,
    repriseModel,
    repriseYear,
    repriseMileage,
    repriseCondition,
  } = body;

  if (!name || !email || !message) {
    return response.status(400).json({ error: 'Missing required fields' });
  }

  const resend = new Resend(apiKey);

  // Destinataire des messages contact (variable Vercel : ADMIN_EMAIL)
  const toEmail = process.env['ADMIN_EMAIL'];
  if (!toEmail) {
    return response.status(500).json({ error: 'ADMIN_EMAIL not configured' });
  }

  // Expéditeur visible par les clients (variable Vercel : RESEND_FROM)
  // Format : "Nom affiché <email@domaine.com>"
  const fromAddress = process.env['RESEND_FROM'] || 'BMC Autos 47 <onboarding@resend.dev>';

  const esc = (s: string | undefined) => (s ?? '-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const projectTypeLabels: Record<string, string> = {
    'info-vehicule': 'Information sur un véhicule',
    'recherche': 'Recherche personnalisée',
    'reprise': 'Demande de reprise',
    'financement': 'Financement',
    'autre': 'Autre demande',
  };
  const projectTypeLabel = projectTypeLabels[projectType ?? ''] ?? projectType ?? '-';

  const repriseConditionLabel = repriseCondition === 'excellent' ? 'Excellent état' : repriseCondition === 'tres-bon' ? 'Très bon état' : repriseCondition === 'bon' ? 'Bon état' : repriseCondition === 'moyen' ? 'État moyen' : repriseCondition ?? '-';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau contact - BMC Autos 47</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;font-family:'Open Sans',Arial,sans-serif;background-color:#0a0a0a;color:#d4d4d4;line-height:1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background-color:#0a0a0a;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-collapse:collapse;background-color:#171717;border:1px solid rgba(224,176,32,0.2);border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg,rgba(224,176,32,0.08),rgba(224,176,32,0.02));border-bottom:1px solid rgba(224,176,32,0.2);">
              <div style="display:inline-block;padding:6px 14px;background:rgba(224,176,32,0.15);border:1px solid rgba(224,176,32,0.3);border-radius:999px;font-size:12px;font-weight:600;color:#e0b020;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;">Contact</div>
              <h1 style="margin:0;font-family:'Montserrat',Arial,sans-serif;font-size:24px;font-weight:700;color:#ffffff;">Nouveau message depuis le site</h1>
              <p style="margin:8px 0 0 0;font-size:14px;color:#a3a3a3;">BMC Autos 47 - Formulaire de contact</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td width="48%" valign="top" style="padding:0 20px 0 0;border-right:1px solid rgba(224,176,32,0.2);">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="padding:0 0 16px 0;">
                          <span style="font-size:12px;font-weight:600;color:#e0b020;text-transform:uppercase;letter-spacing:0.08em;">Informations client</span>
                        </td>
                      </tr>
                      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(224,176,32,0.1);"><span style="font-size:12px;color:#a3a3a3;">Nom</span><br><span style="font-size:15px;color:#ffffff;font-weight:500;">${esc(name)}</span></td></tr>
                      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(224,176,32,0.1);"><span style="font-size:12px;color:#a3a3a3;">Email</span><br><a href="mailto:${esc(email)}" style="font-size:15px;color:#e0b020;text-decoration:none;">${esc(email)}</a></td></tr>
                      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(224,176,32,0.1);"><span style="font-size:12px;color:#a3a3a3;">Téléphone</span><br><span style="font-size:15px;color:#ffffff;">${phone ? esc(phone) : 'Non renseigné'}</span></td></tr>
                      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(224,176,32,0.1);"><span style="font-size:12px;color:#a3a3a3;">Objet</span><br><span style="font-size:15px;color:#e0b020;font-weight:500;">${esc(projectTypeLabel)}</span></td></tr>
                      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(224,176,32,0.1);"><span style="font-size:12px;color:#a3a3a3;">Budget</span><br><span style="font-size:15px;color:#ffffff;">${esc(budget) || 'À définir'}</span></td></tr>
                    </table>
                  </td>
                  <td width="48%" valign="top" style="padding:0 0 0 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="padding:0 0 16px 0;">
                          <span style="font-size:12px;font-weight:600;color:#e0b020;text-transform:uppercase;letter-spacing:0.08em;">Détails de la demande</span>
                        </td>
                      </tr>
                      ${projectType === 'recherche' ? `
                      <tr><td style="padding:8px 0;"><span style="font-size:13px;color:#a3a3a3;">Marque</span><br><span style="font-size:14px;color:#ffffff;">${esc(brand)}</span></td></tr>
                      <tr><td style="padding:8px 0;"><span style="font-size:13px;color:#a3a3a3;">Modèle</span><br><span style="font-size:14px;color:#ffffff;">${esc(model)}</span></td></tr>
                      <tr><td style="padding:8px 0;"><span style="font-size:13px;color:#a3a3a3;">Transmission</span><br><span style="font-size:14px;color:#ffffff;">${esc(transmission)}</span></td></tr>
                      <tr><td style="padding:8px 0;"><span style="font-size:13px;color:#a3a3a3;">Énergie</span><br><span style="font-size:14px;color:#ffffff;">${esc(fuel)}</span></td></tr>
                      <tr><td style="padding:8px 0;"><span style="font-size:13px;color:#a3a3a3;">Catégorie</span><br><span style="font-size:14px;color:#ffffff;">${esc(category)}</span></td></tr>
                      <tr><td style="padding:8px 0;"><span style="font-size:13px;color:#a3a3a3;">Kilométrage max</span><br><span style="font-size:14px;color:#ffffff;">${esc(mileage)}</span></td></tr>
                      <tr><td style="padding:8px 0 16px 0;"><span style="font-size:13px;color:#a3a3a3;">Année</span><br><span style="font-size:14px;color:#ffffff;">${esc(yearFrom)} - ${esc(yearTo)}</span></td></tr>
                      ` : ''}
                      ${projectType === 'reprise' ? `
                      <tr><td style="padding:8px 0;"><span style="font-size:13px;color:#a3a3a3;">Marque</span><br><span style="font-size:14px;color:#ffffff;">${esc(repriseBrand)}</span></td></tr>
                      <tr><td style="padding:8px 0;"><span style="font-size:13px;color:#a3a3a3;">Modèle</span><br><span style="font-size:14px;color:#ffffff;">${esc(repriseModel)}</span></td></tr>
                      <tr><td style="padding:8px 0;"><span style="font-size:13px;color:#a3a3a3;">Année</span><br><span style="font-size:14px;color:#ffffff;">${esc(repriseYear)}</span></td></tr>
                      <tr><td style="padding:8px 0;"><span style="font-size:13px;color:#a3a3a3;">Kilométrage</span><br><span style="font-size:14px;color:#ffffff;">${esc(repriseMileage)}</span></td></tr>
                      <tr><td style="padding:8px 0 16px 0;"><span style="font-size:13px;color:#a3a3a3;">État général</span><br><span style="font-size:14px;color:#ffffff;">${esc(repriseConditionLabel)}</span></td></tr>
                      ` : ''}
                      <tr>
                        <td style="padding:16px 0 0 0;border-top:1px solid rgba(224,176,32,0.15);">
                          <span style="font-size:12px;font-weight:600;color:#e0b020;text-transform:uppercase;letter-spacing:0.05em;">Message</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px;background:rgba(224,176,32,0.05);border:1px solid rgba(224,176,32,0.15);border-radius:8px;">
                          <span style="font-size:14px;color:#ffffff;white-space:pre-wrap;line-height:1.6;">${esc(message)}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:rgba(0,0,0,0.3);border-top:1px solid rgba(224,176,32,0.15);">
              <p style="margin:0;font-size:12px;color:#737373;">BMC AUTOS 47 · 578 Route d'Agen · 47300 PUJOLS</p>
              <p style="margin:4px 0 0 0;font-size:12px;color:#737373;">05.53.01.66.97 · 06.77.27.77.17 · <a href="mailto:contact@bmcautos47.fr" style="color:#e0b020;text-decoration:none;">contact@bmcautos47.fr</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to: [toEmail],
    replyTo: email,
    subject: `Nouveau contact - ${projectTypeLabel}`,
    html,
  });

  if (error) {
    const errMsg = typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message: string }).message
      : 'Failed to send email';
    console.error('Resend error:', error);
    return response.status(500).json({ error: 'Failed to send email', details: errMsg });
  }

  return response.status(200).json({ success: true, id: data?.id });
}
