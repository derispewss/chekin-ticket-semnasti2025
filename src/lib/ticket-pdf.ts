import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface TicketParticipant {
    name: string;
    unique_id: string;
    registered_at?: string | Date | null;
    email: string;
}

export async function generateTicketPDF(participant: TicketParticipant, qrCodeBuffer: Buffer): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([800, 350]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Colors
    const primaryColor = rgb(0.125, 0.129, 0.141); // Dark gray
    const secondaryColor = rgb(0.37, 0.39, 0.41); // Lighter gray
    const accentColor = rgb(0.11, 0.56, 0.24); // Green for badge

    // Background
    page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(1, 1, 1),
    });

    // Border
    page.drawRectangle({
        x: 20,
        y: 20,
        width: width - 40,
        height: height - 40,
        borderColor: secondaryColor,
        borderWidth: 1,
        color: rgb(1, 1, 1),
        opacity: 0, // Transparent fill
    });

    // Left Side Content (Event Details)
    const leftMargin = 50;
    let currentY = height - 70;

    // Event Title
    page.drawText('SEMNASTI X AORUS Campus Tour', {
        x: leftMargin,
        y: currentY,
        size: 26,
        font: boldFont,
        color: primaryColor,
    });
    currentY -= 32;

    // Subtitle
    page.drawText('HMTI UDINUS - Himpunan Mahasiswa Teknik Informatika', {
        x: leftMargin,
        y: currentY,
        size: 12,
        font: font,
        color: secondaryColor,
    });
    currentY -= 45;

    // Date & Time
    page.drawText('DATE & TIME', { x: leftMargin, y: currentY, size: 10, font: boldFont, color: secondaryColor });
    currentY -= 15;
    page.drawText('DEC 6, 2025, 7:15 AM (WIB)', { x: leftMargin, y: currentY, size: 16, font: font, color: primaryColor });
    currentY -= 35;

    // Location
    page.drawText('LOCATION', { x: leftMargin, y: currentY, size: 10, font: boldFont, color: secondaryColor });
    currentY -= 15;
    page.drawText('Universitas Dian Nuswantoro', { x: leftMargin, y: currentY, size: 16, font: font, color: primaryColor });
    currentY -= 20;
    page.drawText('Gedung E, Lt.3, Pendrikan Kidul, Semarang', { x: leftMargin, y: currentY, size: 12, font: font, color: secondaryColor });
    currentY -= 40;

    // Issued To
    page.drawText('ISSUED TO', { x: leftMargin, y: currentY, size: 10, font: boldFont, color: secondaryColor });
    currentY -= 15;
    page.drawText(participant.name, { x: leftMargin, y: currentY, size: 18, font: boldFont, color: primaryColor });


    // Right Side Content (QR & Ticket Info)
    const rightCenter = 650;
    let rightY = height - 60;

    // QR Code
    const qrImage = await pdfDoc.embedPng(qrCodeBuffer);
    const qrSize = 180;
    page.drawImage(qrImage, {
        x: rightCenter - (qrSize / 2),
        y: rightY - qrSize,
        width: qrSize,
        height: qrSize,
    });
    rightY -= (qrSize + 20);

    // Order Number
    const orderText = participant.unique_id;
    const orderTextWidth = boldFont.widthOfTextAtSize(orderText, 16);
    page.drawText(orderText, {
        x: rightCenter - (orderTextWidth / 2),
        y: rightY,
        size: 16,
        font: boldFont,
        color: primaryColor,
    });
    rightY -= 25;

    // Ticket Type Badge
    const badgeText = 'General Admission';
    const badgeWidth = boldFont.widthOfTextAtSize(badgeText, 14);
    page.drawText(badgeText, {
        x: rightCenter - (badgeWidth / 2),
        y: rightY,
        size: 14,
        font: boldFont,
        color: accentColor,
    });

    // Divider Line (Dashed)
    const dashLength = 5;
    const gapLength = 5;
    const lineX = 500;
    const startY = 40;
    const endY = height - 40;

    for (let y = startY; y < endY; y += dashLength + gapLength) {
        page.drawLine({
            start: { x: lineX, y: y },
            end: { x: lineX, y: Math.min(y + dashLength, endY) },
            thickness: 1,
            color: rgb(0.8, 0.8, 0.8),
        });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}
