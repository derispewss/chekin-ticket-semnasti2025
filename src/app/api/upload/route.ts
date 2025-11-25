import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { pool } from '@/lib/db';

function parseExcelDate(value: any): string | null {
    if (!value) return null;

    if (value instanceof Date) {
        return value.toISOString().slice(0, 19).replace('T', ' ');
    }

    if (typeof value === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + value * 86400000);
        return date.toISOString().slice(0, 19).replace('T', ' ');
    }

    if (typeof value === 'string') {
        try {
            const parsed = new Date(value);
            if (!isNaN(parsed.getTime())) {
                return parsed.toISOString().slice(0, 19).replace('T', ' ');
            }
        } catch (e) {
            console.warn('Failed to parse date:', value);
        }
    }

    return null;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet) as any[];

        const [existingRows] = await pool.query('SELECT unique_id FROM participants');
        const existingIds = new Set<string>(
            (existingRows as any[]).map(row => row.unique_id)
        );

        const generatedUniqueIds = new Set<string>();
        const participants = data.map((row) => {
            let uniqueIdSuffix: string;
            let attempts = 0;
            const maxAttempts = 300;
            do {
                const randomNum = Math.floor(Math.random() * 300);
                uniqueIdSuffix = randomNum.toString().padStart(3, '0');
                attempts++;

                if (attempts >= maxAttempts) {
                    throw new Error('No more available unique IDs (000-299 range is full)');
                }
            } while (generatedUniqueIds.has(uniqueIdSuffix) || existingIds.has(`SEMNASTI2025-${uniqueIdSuffix}`));
            generatedUniqueIds.add(uniqueIdSuffix);

            const registeredAtValue = row.registered_at || row.Registered_At || row.REGISTERED_AT;
            const registeredAt = parseExcelDate(registeredAtValue);

            return {
                unique_id: `SEMNASTI2025-${uniqueIdSuffix}`,
                name: row.name || row.Name || row.NAME,
                email: row.email || row.Email || row.EMAIL,
                present: false,
                registered_at: registeredAt,
            };
        }).filter(p => p.name && p.email);

        if (participants.length === 0) {
            return NextResponse.json({ error: 'No valid participants found in Excel' }, { status: 400 });
        }

        const values = participants.map(p => [
            p.unique_id,
            p.name,
            p.email,
            p.present,
            p.registered_at
        ]);

        const query = 'INSERT INTO participants (unique_id, name, email, present, registered_at) VALUES ?';
        await pool.query(query, [values]);

        return NextResponse.json({
            message: `Successfully uploaded ${participants.length} participants`,
            details: {
                total: participants.length,
                withRegisteredDate: participants.filter(p => p.registered_at).length,
                withoutRegisteredDate: participants.filter(p => !p.registered_at).length
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({
            error: 'Failed to process file',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
