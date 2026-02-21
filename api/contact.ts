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

  const { name, email, phone, projectType, budget, message } = request.body as Record<string, string>;

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

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to: [toEmail],
    replyTo: email,
    subject: `Nouveau contact - ${projectType || 'Demande'}`,
    html: `
      <h2>Nouveau message depuis le site</h2>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Téléphone :</strong> ${phone || 'Non renseigné'}</p>
      <p><strong>Type :</strong> ${projectType || '-'}</p>
      <p><strong>Budget :</strong> ${budget || 'À définir'}</p>
      <hr>
      <p>${message}</p>
    `,
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
