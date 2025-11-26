# 🔍 Enhanced Search Feature

## Overview

Fitur search di dashboard telah ditingkatkan untuk mendukung pencarian multi-field yang lebih fleksibel dan user-friendly.

## ✨ Fitur Search

### **Multi-field Search**
Anda sekarang dapat mencari peserta berdasarkan:
- ✅ **Nama** - Cari berdasarkan nama lengkap peserta
- ✅ **Unique Code** - Cari berdasarkan kode unik (contoh: SEMNASTI2025-123)
- ✅ **Email** - Cari berdasarkan alamat email

### **Case-Insensitive**
Pencarian tidak case-sensitive, jadi "john" akan menemukan "John Doe", "JOHN", dll.

### **Partial Match**
Pencarian menggunakan partial matching, jadi:
- Ketik "john" → menemukan "John Doe", "Johnny", "Johnson"
- Ketik "123" → menemukan "SEMNASTI2025-123"
- Ketik "@gmail" → menemukan semua email Gmail

## 🎨 UI/UX Improvements

### **Search Icon**
- Icon search (🔍) di sebelah kiri input field
- Memberikan visual cue yang jelas untuk fungsi search

### **Placeholder Text**
```
"Search by name, unique code, or email..."
```
Memberitahu user bahwa mereka bisa search dengan 3 cara

### **Focus State**
- Border berubah warna saat input di-focus
- Smooth transition animation

### **Search Results Counter**
Menampilkan jumlah hasil yang ditemukan:
```
Menampilkan 5 hasil untuk "john"
```

## 💡 Cara Penggunaan

### **Contoh 1: Search by Name**
```
Input: "budi"
Result: Menemukan "Budi Santoso", "Budiman", dll.
```

### **Contoh 2: Search by Unique Code**
```
Input: "123"
Result: Menemukan "SEMNASTI2025-123", "SEMNASTI2025-1234", dll.
```

### **Contoh 3: Search by Email**
```
Input: "@gmail.com"
Result: Menemukan semua peserta dengan email Gmail
```

### **Contoh 4: Kombinasi dengan Filter Status**
```
1. Pilih filter: "Hadir"
2. Ketik search: "john"
Result: Hanya menampilkan peserta bernama John yang sudah hadir
```

## 🔧 Technical Implementation

### **Filter Logic**
```typescript
const filteredData = participantData.filter((participant) => {
  const searchLower = search.toLowerCase();
  const matchName = participant.name.toLowerCase().includes(searchLower);
  const matchUnique = participant.unique.toLowerCase().includes(searchLower);
  const matchEmail = participant.email.toLowerCase().includes(searchLower);
  const matchSearch = matchName || matchUnique || matchEmail;
  
  const matchStatus = statusFilter === "all" ? true : 
                      statusFilter === "present" ? participant.present : 
                      !participant.present;

  return matchSearch && matchStatus;
});
```

### **OR Logic**
Search menggunakan OR logic, artinya hasil akan muncul jika **salah satu** dari name, unique code, atau email cocok.

## 📊 Performance

- **Optimized**: Filter dilakukan di client-side untuk response cepat
- **Real-time**: Hasil update saat user mengetik
- **No Debounce**: Langsung filter tanpa delay (karena data sudah di memory)

## 🎯 Use Cases

### **Scenario 1: Cari Peserta Spesifik**
Panitia ingin mencari peserta "John Doe":
1. Ketik "john" di search box
2. Lihat semua peserta dengan nama John
3. Klik pada yang sesuai

### **Scenario 2: Verifikasi Email**
Panitia ingin cek apakah email tertentu sudah terdaftar:
1. Ketik email atau sebagian email
2. Lihat hasil pencarian
3. Verifikasi data peserta

### **Scenario 3: Cari by Unique Code**
Peserta memberikan kode unik mereka:
1. Ketik kode unik (atau sebagian)
2. Temukan peserta dengan cepat
3. Update status atau resend email

### **Scenario 4: Filter Peserta Hadir**
Panitia ingin cari peserta hadir dengan nama tertentu:
1. Pilih filter "Hadir"
2. Ketik nama di search
3. Lihat hanya peserta hadir yang cocok

## 🚀 Future Enhancements

Potential improvements:
- [ ] Advanced filters (registered date range, kit status, etc.)
- [ ] Search history/suggestions
- [ ] Keyboard shortcuts (Ctrl+F to focus search)
- [ ] Export filtered results
- [ ] Highlight matched text in results
- [ ] Search by multiple criteria simultaneously

## 💡 Tips

1. **Clear Search**: Hapus text di search box untuk melihat semua data
2. **Combine Filters**: Gunakan search + status filter untuk hasil lebih spesifik
3. **Partial Search**: Tidak perlu ketik lengkap, sebagian text sudah cukup
4. **Case Insensitive**: Tidak perlu khawatir huruf besar/kecil

## 🐛 Troubleshooting

### Tidak menemukan hasil
- Cek spelling
- Coba ketik sebagian text saja
- Pastikan tidak ada filter status yang membatasi
- Refresh halaman jika perlu

### Hasil terlalu banyak
- Ketik lebih spesifik
- Gunakan kombinasi dengan filter status
- Ketik unique code lengkap untuk hasil pasti
