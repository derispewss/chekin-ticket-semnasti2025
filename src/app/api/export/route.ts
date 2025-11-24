import { NextRequest, NextResponse } from 'next/server';
import { getParticipants } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const type = searchParams.get('type') || 'all'; // all | attended | not-attended

        // Get all participants
        const allParticipants = await getParticipants();

        let filteredParticipants = allParticipants;

        // Filter based on type
        if (type === 'attended') {
            filteredParticipants = allParticipants.filter(p => p.present);
        } else if (type === 'not-attended') {
            filteredParticipants = allParticipants.filter(p => !p.present);
        }

        if (filteredParticipants.length === 0) {
            return NextResponse.json({ error: 'No participants found' }, { status: 404 });
        }

        // Prepare data for Excel
        const excelData = filteredParticipants.map((p, index) => ({
            No: index + 1,
            'Unique ID': p.unique.replace('SEMNASTI2025-', ''),
            'Nama': p.name,
            'Email': p.email,
            'Status': p.present ? 'Hadir' : 'Tidak Hadir',
        }));

        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

        // Auto-size columns
        const maxWidth = excelData.reduce((w, r) => Math.max(w, r['Unique ID'].length), 10);
        worksheet['!cols'] = [
            { wch: 5 },  // No
            { wch: Math.min(maxWidth + 2, 30) }, // Unique ID
            { wch: 25 }, // Nama
            { wch: 30 }, // Email
            { wch: 15 }, // Status
        ];

        // Generate Excel buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Determine filename based on type
        const typeLabel = type === 'attended' ? 'Hadir' : type === 'not-attended' ? 'Tidak_Hadir' : 'Semua';
        const filename = `Peserta_${typeLabel}_SEMNASTI2025_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Return Excel file
        return new NextResponse(excelBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }
}
