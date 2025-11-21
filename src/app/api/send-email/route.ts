import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { pool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const { uniqueIds } = await req.json();

    if (!uniqueIds || !Array.isArray(uniqueIds) || uniqueIds.length === 0) {
      return NextResponse.json({ error: 'No participants selected' }, { status: 400 });
    }

    // Fetch participants
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM participants WHERE unique_id IN (?)',
      [uniqueIds]
    );

    const participants = rows as any[];

    if (participants.length === 0) {
      return NextResponse.json({ error: 'No participants found' }, { status: 404 });
    }

    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Or use host/port from env
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let successCount = 0;
    let failCount = 0;

    for (const p of participants) {
      try {
        // Generate QR Code as buffer
        const qrCodeBuffer = await QRCode.toBuffer(p.unique_id, {
          width: 300,
          margin: 2,
        });

        // Simple Email Template - using CID reference
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>SEMNASTI X AORUS - Ticket</title>
          </head>
          <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; text-align: center;">
              <h1 style="color: #333;">SEMNASTI X AORUS CAMPUS TOUR</h1>
              <h2 style="color: #666;">Your Ticket</h2>
              
              <div style="margin: 30px 0;">
                <img src="cid:qrcode" alt="QR Code" style="width: 300px; height: 300px;" />
              </div>
              
              <div style="margin-top: 20px;">
                <p style="font-size: 14px; color: #999;">Unique Code:</p>
                <p style="font-size: 18px; font-weight: bold; color: #333;">${p.unique_id.replace('SEMNASTI2025-', '')}</p>
              </div>
              
              <div style="margin-top: 20px;">
                <p style="font-size: 14px; color: #999;">Name:</p>
                <p style="font-size: 16px; color: #333;">${p.name}</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await transporter.sendMail({
          from: '"SEMNASTI X AORUS CAMPUS TOUR" <no-reply@semnasti.hmti.udinus@gmail.com>',
          to: p.email,
          subject: 'Your Ticket for SEMNASTI X AORUS CAMPUS TOUR',
          html: htmlContent,
          attachments: [
            {
              filename: 'qrcode.png',
              content: qrCodeBuffer,
              cid: 'qrcode', // same as referenced in img src
            },
          ],
        });

        successCount++;
      } catch (err) {
        console.error(`Failed to send email to ${p.email}:`, err);
        failCount++;
      }
    }

    return NextResponse.json({
      message: `Processed ${participants.length} emails`,
      success: successCount,
      failed: failCount
    });

  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}
