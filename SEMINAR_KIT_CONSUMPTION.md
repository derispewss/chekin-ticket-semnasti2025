# Fitur Seminar Kit & Consumption Tracking

## 📦 Overview

Sistem check-in sekarang dilengkapi dengan tracking untuk **Seminar Kit** dan **Consumption** yang hanya muncul setelah peserta melakukan check-in.

## ✨ Fitur Baru

### 1. **Kolom Seminar Kit**
- Checkbox untuk menandai apakah peserta sudah mengambil seminar kit
- Hanya muncul jika status peserta = "Hadir"
- Warna accent: Purple (#CD3DFF)
- Status: "✓ Sudah" atau "Belum"

### 2. **Kolom Consumption**
- Checkbox untuk menandai apakah peserta sudah mengambil konsumsi
- Hanya muncul jika status peserta = "Hadir"
- Warna accent: Cyan (#17D3FD)
- Status: "✓ Sudah" atau "Belum"

## 🗄️ Database Schema

Tabel `participants` sekarang memiliki kolom tambahan:

```sql
ALTER TABLE participants 
ADD COLUMN seminar_kit BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN consumption BOOLEAN NOT NULL DEFAULT FALSE;
```

**Catatan:** Migration otomatis akan dijalankan saat aplikasi pertama kali dijalankan di development mode.

## 🎯 Cara Penggunaan

### Di Dashboard:

1. **Lihat Status Peserta**
   - Kolom "Seminar Kit" dan "Consumption" hanya muncul untuk peserta yang sudah hadir
   - Peserta yang belum hadir akan menampilkan "-"

2. **Update Status**
   - Klik checkbox untuk menandai sudah diambil
   - Uncheck untuk menandai belum diambil
   - Toast notification akan muncul untuk konfirmasi

3. **Real-time Updates**
   - Perubahan status akan langsung terlihat di semua dashboard yang terbuka
   - Menggunakan SSE untuk real-time synchronization

## 🔧 Technical Details

### API Endpoint

**POST** `/api/participants/update`

Request body:
```json
{
  "unique": "SEMNASTI2025-123",
  "seminar_kit": true,  // optional
  "consumption": true   // optional
}
```

Response:
```json
{
  "message": "Participant updated successfully",
  "updates": {
    "seminar_kit": true
  }
}
```

### Database Functions

```typescript
// Update participant
await updateParticipant(uniqueId, {
  seminar_kit: true,
  consumption: false
});
```

### Component Props

**TableDashboard.tsx:**
```typescript
interface TableDashboardProps {
  filteredData: Array<{
    unique: string;
    name: string;
    email: string;
    present: boolean;
    seminar_kit: boolean;      // NEW
    consumption: boolean;       // NEW
    registered_at: string;
  }>;
  onResend: (unique: string) => void;
  onUpdateKit: (unique: string, value: boolean) => void;        // NEW
  onUpdateConsumption: (unique: string, value: boolean) => void; // NEW
}
```

## 📊 Use Cases

### Scenario 1: Peserta Check-in
1. Peserta scan QR code / input kode unik
2. Status berubah menjadi "Hadir"
3. Kolom "Seminar Kit" dan "Consumption" muncul dengan status "Belum"

### Scenario 2: Distribusi Seminar Kit
1. Panitia memberikan seminar kit kepada peserta
2. Panitia centang checkbox "Seminar Kit" di dashboard
3. Status berubah menjadi "✓ Sudah"
4. Toast notification: "✅ Seminar kit ditandai sudah diambil"

### Scenario 3: Distribusi Konsumsi
1. Peserta mengambil konsumsi
2. Panitia centang checkbox "Consumption"
3. Status berubah menjadi "✓ Sudah"
4. Toast notification: "✅ Consumption ditandai sudah diambil"

## 🎨 UI/UX

### Visual Indicators:
- **Seminar Kit Checkbox**: Purple accent color
- **Consumption Checkbox**: Cyan accent color
- **Checked State**: "✓ Sudah" (green text)
- **Unchecked State**: "Belum" (gray text)
- **Not Present**: "-" (disabled, gray)

### Responsive Design:
- Table scrollable horizontal pada mobile
- Checkbox tetap accessible dengan touch
- Toast notifications untuk feedback

## 🔐 Validation

- Checkbox hanya aktif jika `present === true`
- API endpoint memvalidasi `unique` ID
- Database constraint: `NOT NULL DEFAULT FALSE`

## 📈 Export Data

Data seminar kit dan consumption akan otomatis ter-include dalam export Excel:

```
Kolom Export:
- Unique Code
- Nama
- Email
- Status Kehadiran
- Seminar Kit (Ya/Tidak)      // NEW
- Consumption (Ya/Tidak)       // NEW
- Registered At
```

## 🚀 Future Enhancements

Potential improvements:
- [ ] Timestamp untuk kapan kit/consumption diambil
- [ ] Filter berdasarkan status kit/consumption
- [ ] Statistics dashboard (berapa % sudah ambil kit, dll)
- [ ] Bulk update untuk multiple participants
- [ ] History log untuk tracking perubahan

## 🐛 Troubleshooting

### Checkbox tidak muncul
- Pastikan peserta sudah check-in (`present = true`)
- Refresh halaman jika perlu
- Cek console untuk error

### Update tidak tersimpan
- Cek network tab untuk API errors
- Pastikan database connection aktif
- Lihat toast notification untuk error message

### Real-time tidak update
- Pastikan indikator "Live" berwarna hijau
- Cek SSE connection di Network tab
- Refresh manual dengan F5 jika perlu
