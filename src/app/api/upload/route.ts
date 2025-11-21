import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet) as any[];

        const generatedUniqueIds = new Set<string>();
        const participants = data.map((row) => {
            let uniqueIdSuffix: string;
            do {
                const generateRandomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
                uniqueIdSuffix = generateRandomLetter() + generateRandomLetter() + generateRandomLetter();
            } while (generatedUniqueIds.has(uniqueIdSuffix));
            generatedUniqueIds.add(uniqueIdSuffix);

            return {
                unique_id: `SEMNASTI2025-${uniqueIdSuffix}`,
                name: row.name || row.Name || row.NAME,
                email: row.email || row.Email || row.EMAIL,
                present: false,
            };
        }).filter(p => p.name && p.email);

        if (participants.length === 0) {
            return NextResponse.json({ error: 'No valid participants found in Excel' }, { status: 400 });
        }

        const values = participants.map(p => [p.unique_id, p.name, p.email, p.present]);

        // Bulk insert
        const query = 'INSERT INTO participants (unique_id, name, email, present) VALUES ?';
        await pool.query(query, [values]);

        return NextResponse.json({ message: `Successfully uploaded ${participants.length} participants` });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
    }
}
