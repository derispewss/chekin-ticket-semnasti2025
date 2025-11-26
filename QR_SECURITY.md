# QR Code Security & One-Time Scan Feature

## Overview
Sistem keamanan QR code telah ditingkatkan dengan fitur **one-time scan** dan **hashing** untuk mencegah duplikasi dan kecurangan.

## Fitur Keamanan

### 1. **QR Hash Generation**
- Setiap QR code memiliki hash unik yang di-generate menggunakan SHA-256
- Hash dibuat dari kombinasi: `unique_id + timestamp + random_salt`
- Hash disimpan di database untuk validasi

### 2. **Secure QR Payload**
- Format QR code: `uniqueId|hash`
- Contoh: `SEMNASTI2025-123|a1b2c3d4e5f6...`
- Payload ini yang di-encode ke dalam QR code

### 3. **One-Time Scan**
- QR code hanya bisa di-scan **satu kali**
- Setelah scan berhasil, hash di-invalidate (set ke `null`)
- Scan berikutnya dengan QR yang sama akan ditolak

### 4. **QR Regeneration**
- Setiap kali generate QR baru (via API atau email), hash baru dibuat
- QR lama otomatis invalid
- Mencegah penggunaan QR screenshot atau duplikat

## Database Schema

### Kolom Baru: `qr_hash`
```sql
ALTER TABLE participants 
ADD COLUMN qr_hash VARCHAR(255) NULL,
ADD INDEX idx_qr_hash (qr_hash);
```

## API Endpoints

### 1. Generate QR Code
**Endpoint:** `GET /api/qrcode?unique={uniqueId}`

**Response:**
```json
{
  "qrCode": "data:image/png;base64,..."
}
```

**Behavior:**
- Generate hash baru
- Update database dengan hash
- Return QR code dengan secure payload

### 2. Check-in
**Endpoint:** `POST /api/checkin`

**Request:**
```json
{
  "unique": "SEMNASTI2025-123|a1b2c3d4e5f6..."
}
```

**Response (Success):**
```json
{
  "message": "Check-in berhasil",
  "participant": {
    "name": "John Doe",
    "unique": "SEMNASTI2025-123"
  }
}
```

**Response (Invalid QR):**
```json
{
  "error": "QR Code tidak valid atau sudah pernah digunakan",
  "invalidQR": true,
  "participant": {
    "name": "John Doe",
    "unique": "SEMNASTI2025-123"
  }
}
```

**Response (Already Checked In):**
```json
{
  "error": "Peserta sudah melakukan check-in sebelumnya",
  "alreadyCheckedIn": true,
  "participant": {
    "name": "John Doe",
    "unique": "SEMNASTI2025-123"
  }
}
```

## Security Flow

### Skenario 1: Check-in Normal
1. User scan QR code
2. System parse payload: `uniqueId|hash`
3. System validate hash dengan database
4. Jika valid, check-in berhasil
5. Hash di-set ke `null` (invalidate)

### Skenario 2: Scan QR yang Sudah Digunakan
1. User scan QR code yang sama
2. System parse payload
3. Hash validation gagal (hash di DB sudah `null`)
4. Return error: "QR Code sudah pernah digunakan"

### Skenario 3: Request QR Baru
1. User request QR baru via dashboard
2. System generate hash baru
3. Update database
4. QR lama otomatis invalid

## Toast Notification System

### Tipe Toast
- `success`: Operasi berhasil (hijau)
- `error`: Operasi gagal (merah)
- `warning`: Peringatan (kuning)
- `info`: Informasi (biru)

### Usage
```typescript
showToastMessage(
  "Pesan yang ditampilkan",
  "success",  // type
  "Judul Toast (optional)"
);
```

### Contoh
```typescript
// Check-in berhasil
showToastMessage(
  "Halo John Doe, Selamat Datang di SEMNASTI 2025",
  "success",
  "Check-in Berhasil!"
);

// QR tidak valid
showToastMessage(
  "QR Code tidak valid atau sudah digunakan",
  "warning",
  "QR Code Tidak Valid"
);

// Error
showToastMessage(
  "Terjadi kesalahan saat check-in",
  "error",
  "Error"
);
```

## Migration Guide

### Untuk Database yang Sudah Ada
1. Jalankan migration untuk menambahkan kolom `qr_hash`
2. Kolom akan otomatis ditambahkan saat aplikasi start (development mode)
3. Untuk production, jalankan manual:
```sql
ALTER TABLE participants 
ADD COLUMN qr_hash VARCHAR(255) NULL,
ADD INDEX idx_qr_hash (qr_hash);
```

### Backward Compatibility
- QR code lama (tanpa hash) akan ditolak
- User perlu request QR baru via "Resend Email"
- Sistem akan otomatis generate hash baru

## Security Benefits

1. **Mencegah Screenshot Fraud**: QR yang di-screenshot tidak bisa digunakan lagi setelah scan pertama
2. **Mencegah Duplikasi**: Setiap QR unik dan hanya valid sekali
3. **Mencegah Sharing**: User tidak bisa share QR ke orang lain
4. **Audit Trail**: Semua QR generation tercatat di email logs
5. **Time-based Security**: Hash berubah setiap kali generate baru

## Best Practices

1. **Selalu Generate QR Baru**: Saat kirim email ulang, selalu generate QR baru
2. **Monitor Email Logs**: Cek email logs untuk detect suspicious activity
3. **Educate Users**: Informasikan user bahwa QR hanya valid sekali
4. **Backup Strategy**: Simpan email logs untuk audit

## Troubleshooting

### QR Code Tidak Valid
**Penyebab:**
- QR sudah pernah di-scan
- QR lama (sebelum implementasi hash)
- Hash tidak match

**Solusi:**
- Request QR baru via "Resend Email" di dashboard
- QR baru akan otomatis di-generate dengan hash baru

### User Sudah Check-in
**Penyebab:**
- User sudah melakukan check-in sebelumnya

**Solusi:**
- Tidak perlu action, check-in sudah tercatat
- Lihat status di dashboard

## Files Modified

1. `src/lib/db.ts` - Added qr_hash field
2. `src/lib/qr-security.ts` - QR security utilities (NEW)
3. `src/app/api/qrcode/route.ts` - Generate QR with hash
4. `src/app/api/checkin/route.ts` - Validate hash on check-in
5. `src/app/api/send-email/route.ts` - Generate hash for email QR
6. `src/components/Toast.tsx` - Flexible toast component
7. `src/app/page.tsx` - Updated toast usage
8. `src/app/dashboard/page.tsx` - Dashboard (no changes needed)

## Testing

### Test Case 1: Normal Check-in
1. Generate QR code
2. Scan QR code
3. Verify check-in success
4. Verify hash is null in database

### Test Case 2: Duplicate Scan
1. Generate QR code
2. Scan QR code (success)
3. Scan same QR code again
4. Verify error: "QR Code sudah pernah digunakan"

### Test Case 3: QR Regeneration
1. Generate QR code (hash1)
2. Generate QR code again (hash2)
3. Scan QR with hash1
4. Verify error: "QR Code tidak valid"
5. Scan QR with hash2
6. Verify check-in success
