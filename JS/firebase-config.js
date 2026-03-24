/* ==============================
   Firebase Configuration & Database Helper
   Zran Corporation — Sistem Absensi Karyawan
   ============================== */

// ==================== FIREBASE CONFIG ====================
const firebaseConfig = {
    apiKey: "AIzaSyDFktFM9tddfbF4DVWYPrTHlz7J2MAcRpQ",
    authDomain: "absensi-zrancorp.firebaseapp.com",
    projectId: "absensi-zrancorp",
    storageBucket: "absensi-zrancorp.firebasestorage.app",
    messagingSenderId: "149262813609",
    appId: "1:149262813609:web:436445443edd7593dcdcb8",
    measurementId: "G-HS8KF7C6V3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// ==================== COLLECTION REFERENCES ====================
const usersRef = db.collection('users');
const karyawanRef = db.collection('karyawan');
const attendancesRef = db.collection('attendances');

// ==================== SEED DATA (Default) ====================
// These will be uploaded ONCE if the collections are empty

const SEED_USERS = [
    { username: 'admin', password: 'admin123', role: 'admin', nama: 'Administrator', dept: 'Management' },
    { username: 'ahmad', password: 'staf123', role: 'staf', nama: 'Ahmad Fauzi', dept: 'IT' },
    { username: 'budi', password: 'staf123', role: 'staf', nama: 'Budi Santoso', dept: 'IT' },
    { username: 'citra', password: 'staf123', role: 'staf', nama: 'Citra Dewi', dept: 'HR' },
    { username: 'dedi', password: 'staf123', role: 'staf', nama: 'Dedi Kurniawan', dept: 'Finance' },
    { username: 'eka', password: 'staf123', role: 'staf', nama: 'Eka Putri', dept: 'HR' },
    { username: 'fajar', password: 'staf123', role: 'staf', nama: 'Fajar Hidayat', dept: 'Marketing' },
    { username: 'gita', password: 'staf123', role: 'staf', nama: 'Gita Rahayu', dept: 'Finance' },
    { username: 'hendra', password: 'staf123', role: 'staf', nama: 'Hendra Wijaya', dept: 'Operasional' },
    { username: 'indah', password: 'staf123', role: 'staf', nama: 'Indah Permata', dept: 'Marketing' },
    { username: 'joko', password: 'staf123', role: 'staf', nama: 'Joko Widodo', dept: 'Operasional' },
    { username: 'kartika', password: 'staf123', role: 'staf', nama: 'Kartika Sari', dept: 'HR' },
    { username: 'lukman', password: 'staf123', role: 'staf', nama: 'Lukman Hakim', dept: 'IT' },
    { username: 'maya', password: 'staf123', role: 'staf', nama: 'Maya Anggraini', dept: 'Finance' },
    { username: 'nugroho', password: 'staf123', role: 'staf', nama: 'Nugroho Adi', dept: 'Operasional' },
    { username: 'oktavia', password: 'staf123', role: 'staf', nama: 'Oktavia Salsabila', dept: 'Marketing' },
    { username: 'putra', password: 'staf123', role: 'staf', nama: 'Putra Ramadhan', dept: 'IT' },
    { username: 'qory', password: 'staf123', role: 'staf', nama: 'Qory Sandrina', dept: 'HR' },
    { username: 'rizky', password: 'staf123', role: 'staf', nama: 'Rizky Pratama', dept: 'Finance' },
    { username: 'siti', password: 'staf123', role: 'staf', nama: 'Siti Nurhaliza', dept: 'Marketing' },
    { username: 'teguh', password: 'staf123', role: 'staf', nama: 'Teguh Prabowo', dept: 'Operasional' },
];

const SEED_KARYAWAN = [
    { id: 'KRY-001', nama: 'Ahmad Fauzi', jabatan: 'Manager', departemen: 'IT', telp: '0812-3456-7890', status: 'Aktif' },
    { id: 'KRY-002', nama: 'Siti Nurhaliza', jabatan: 'Staff', departemen: 'HR', telp: '0813-2345-6789', status: 'Aktif' },
    { id: 'KRY-003', nama: 'Budi Santoso', jabatan: 'Supervisor', departemen: 'Operasional', telp: '0814-3456-7891', status: 'Aktif' },
    { id: 'KRY-004', nama: 'Dewi Lestari', jabatan: 'Staff', departemen: 'Finance', telp: '0815-4567-8901', status: 'Aktif' },
    { id: 'KRY-005', nama: 'Eko Prasetyo', jabatan: 'Manager', departemen: 'Marketing', telp: '0816-5678-9012', status: 'Nonaktif' },
    { id: 'KRY-006', nama: 'Fitriani Wati', jabatan: 'Staff', departemen: 'IT', telp: '0817-6789-0123', status: 'Aktif' },
    { id: 'KRY-007', nama: 'Gilang Ramadhan', jabatan: 'Supervisor', departemen: 'HR', telp: '0818-7890-1234', status: 'Aktif' },
    { id: 'KRY-008', nama: 'Hana Pertiwi', jabatan: 'Staff', departemen: 'Finance', telp: '0819-8901-2345', status: 'Aktif' },
    { id: 'KRY-009', nama: 'Irfan Hakim', jabatan: 'Manager', departemen: 'Operasional', telp: '0821-9012-3456', status: 'Aktif' },
    { id: 'KRY-010', nama: 'Joko Widodo', jabatan: 'Staff', departemen: 'Marketing', telp: '0822-0123-4567', status: 'Nonaktif' },
    { id: 'KRY-011', nama: 'Kartika Sari', jabatan: 'Staff', departemen: 'IT', telp: '0823-1234-5678', status: 'Aktif' },
    { id: 'KRY-012', nama: 'Lukman Hakim', jabatan: 'Supervisor', departemen: 'Finance', telp: '0824-2345-6789', status: 'Aktif' },
    { id: 'KRY-013', nama: 'Maya Anggraini', jabatan: 'Staff', departemen: 'HR', telp: '0825-3456-7890', status: 'Aktif' },
    { id: 'KRY-014', nama: 'Naufal Rizki', jabatan: 'Staff', departemen: 'Marketing', telp: '0826-4567-8901', status: 'Nonaktif' },
    { id: 'KRY-015', nama: 'Olivia Putri', jabatan: 'Manager', departemen: 'HR', telp: '0827-5678-9012', status: 'Aktif' },
    { id: 'KRY-016', nama: 'Putra Mandala', jabatan: 'Staff', departemen: 'IT', telp: '0828-6789-0123', status: 'Aktif' },
    { id: 'KRY-017', nama: 'Qori Almira', jabatan: 'Staff', departemen: 'Operasional', telp: '0829-7890-1234', status: 'Aktif' },
    { id: 'KRY-018', nama: 'Reza Mahendra', jabatan: 'Supervisor', departemen: 'Marketing', telp: '0831-8901-2345', status: 'Aktif' },
    { id: 'KRY-019', nama: 'Sari Indah', jabatan: 'Staff', departemen: 'Finance', telp: '0832-9012-3456', status: 'Nonaktif' },
    { id: 'KRY-020', nama: 'Teguh Prabowo', jabatan: 'Staff', departemen: 'Operasional', telp: '0833-0123-4567', status: 'Aktif' },
];

const SEED_ATTENDANCES = [
    { nama: 'Ahmad Fauzi', departemen: 'IT', tanggal: '09/03/2026', jamMasuk: '07:55', jamKeluar: '17:02', status: 'Hadir' },
    { nama: 'Budi Santoso', departemen: 'HR', tanggal: '09/03/2026', jamMasuk: '08:15', jamKeluar: '17:05', status: 'Terlambat' },
    { nama: 'Citra Dewi', departemen: 'Finance', tanggal: '09/03/2026', jamMasuk: '07:48', jamKeluar: '17:10', status: 'Hadir' },
    { nama: 'Dedi Kurniawan', departemen: 'IT', tanggal: '09/03/2026', jamMasuk: '', jamKeluar: '', status: 'Izin' },
    { nama: 'Eka Putri', departemen: 'Marketing', tanggal: '09/03/2026', jamMasuk: '07:50', jamKeluar: '17:00', status: 'Hadir' },
    { nama: 'Fajar Hidayat', departemen: 'Operasional', tanggal: '09/03/2026', jamMasuk: '', jamKeluar: '', status: 'Sakit' },
    { nama: 'Gita Rahayu', departemen: 'Finance', tanggal: '09/03/2026', jamMasuk: '08:25', jamKeluar: '17:30', status: 'Terlambat' },
    { nama: 'Hendra Wijaya', departemen: 'IT', tanggal: '09/03/2026', jamMasuk: '07:58', jamKeluar: '17:08', status: 'Hadir' },
    { nama: 'Indah Permata', departemen: 'HR', tanggal: '09/03/2026', jamMasuk: '07:45', jamKeluar: '16:55', status: 'Hadir' },
    { nama: 'Joko Widodo', departemen: 'Marketing', tanggal: '09/03/2026', jamMasuk: '', jamKeluar: '', status: 'Alpha' },
    { nama: 'Kartika Sari', departemen: 'IT', tanggal: '08/03/2026', jamMasuk: '07:52', jamKeluar: '17:05', status: 'Hadir' },
    { nama: 'Lukman Hakim', departemen: 'Finance', tanggal: '08/03/2026', jamMasuk: '08:10', jamKeluar: '17:20', status: 'Terlambat' },
    { nama: 'Maya Anggraini', departemen: 'HR', tanggal: '08/03/2026', jamMasuk: '07:55', jamKeluar: '17:00', status: 'Hadir' },
    { nama: 'Nugroho Adi', departemen: 'Operasional', tanggal: '08/03/2026', jamMasuk: '07:40', jamKeluar: '16:50', status: 'Hadir' },
    { nama: 'Oktavia Salsabila', departemen: 'Marketing', tanggal: '08/03/2026', jamMasuk: '', jamKeluar: '', status: 'Izin' },
    { nama: 'Putra Ramadhan', departemen: 'IT', tanggal: '08/03/2026', jamMasuk: '07:58', jamKeluar: '17:12', status: 'Hadir' },
    { nama: 'Qory Sandrina', departemen: 'Finance', tanggal: '08/03/2026', jamMasuk: '07:50', jamKeluar: '17:00', status: 'Hadir' },
    { nama: 'Rizky Pratama', departemen: 'HR', tanggal: '08/03/2026', jamMasuk: '', jamKeluar: '', status: 'Sakit' },
    { nama: 'Siti Nurhaliza', departemen: 'Marketing', tanggal: '08/03/2026', jamMasuk: '08:20', jamKeluar: '17:15', status: 'Terlambat' },
    { nama: 'Teguh Prabowo', departemen: 'Operasional', tanggal: '08/03/2026', jamMasuk: '07:55', jamKeluar: '17:08', status: 'Hadir' },
    { nama: 'Ahmad Fauzi', departemen: 'IT', tanggal: '07/03/2026', jamMasuk: '07:50', jamKeluar: '17:00', status: 'Hadir' },
    { nama: 'Budi Santoso', departemen: 'HR', tanggal: '07/03/2026', jamMasuk: '07:55', jamKeluar: '17:05', status: 'Hadir' },
    { nama: 'Citra Dewi', departemen: 'Finance', tanggal: '07/03/2026', jamMasuk: '', jamKeluar: '', status: 'Alpha' },
    { nama: 'Dedi Kurniawan', departemen: 'IT', tanggal: '07/03/2026', jamMasuk: '08:30', jamKeluar: '17:25', status: 'Terlambat' },
    { nama: 'Eka Putri', departemen: 'Marketing', tanggal: '07/03/2026', jamMasuk: '07:48', jamKeluar: '17:02', status: 'Hadir' },
    { nama: 'Fajar Hidayat', departemen: 'Operasional', tanggal: '07/03/2026', jamMasuk: '07:55', jamKeluar: '17:10', status: 'Hadir' },
    { nama: 'Gita Rahayu', departemen: 'Finance', tanggal: '07/03/2026', jamMasuk: '07:42', jamKeluar: '16:58', status: 'Hadir' },
    { nama: 'Hendra Wijaya', departemen: 'IT', tanggal: '07/03/2026', jamMasuk: '', jamKeluar: '', status: 'Izin' },
    { nama: 'Indah Permata', departemen: 'HR', tanggal: '07/03/2026', jamMasuk: '07:58', jamKeluar: '17:00', status: 'Hadir' },
    { nama: 'Joko Widodo', departemen: 'Marketing', tanggal: '07/03/2026', jamMasuk: '', jamKeluar: '', status: 'Sakit' },
];

// ==================== SEED DATABASE ====================
// Called once to populate empty Firestore collections
async function seedDatabase() {
    try {
        // Check if users collection already has data
        const usersSnapshot = await usersRef.limit(1).get();
        if (usersSnapshot.empty) {
            console.log('🌱 Seeding users...');
            const batch1 = db.batch();
            SEED_USERS.forEach(user => {
                const docRef = usersRef.doc(user.username);
                batch1.set(docRef, user);
            });
            await batch1.commit();
            console.log('✅ Users seeded successfully');
        }

        // Check if karyawan collection already has data
        const karyawanSnapshot = await karyawanRef.limit(1).get();
        if (karyawanSnapshot.empty) {
            console.log('🌱 Seeding karyawan...');
            const batch2 = db.batch();
            SEED_KARYAWAN.forEach(k => {
                const docRef = karyawanRef.doc(k.id);
                batch2.set(docRef, k);
            });
            await batch2.commit();
            console.log('✅ Karyawan seeded successfully');
        }

        // Check if attendances collection already has data
        const attendancesSnapshot = await attendancesRef.limit(1).get();
        if (attendancesSnapshot.empty) {
            console.log('🌱 Seeding attendances...');
            // Batch max 500 operations
            const batch3 = db.batch();
            SEED_ATTENDANCES.forEach((att, idx) => {
                const docRef = attendancesRef.doc(`ABS-${String(idx + 1).padStart(3, '0')}`);
                batch3.set(docRef, att);
            });
            await batch3.commit();
            console.log('✅ Attendances seeded successfully');
        }

        console.log('🎉 Database ready!');
    } catch (error) {
        console.error('❌ Seed error:', error);
    }
}

// ==================== HELPER: DB Operations ====================

// --- USERS ---
async function DB_findUser(username, password) {
    const doc = await usersRef.doc(username).get();
    if (!doc.exists) return null;
    const data = doc.data();
    if (data.password === password) return data;
    return null;
}

// --- KARYAWAN ---
async function DB_getAllKaryawan() {
    const snapshot = await karyawanRef.orderBy('id').get();
    return snapshot.docs.map(doc => doc.data());
}

async function DB_addKaryawan(data) {
    await karyawanRef.doc(data.id).set(data);
}

async function DB_updateKaryawan(id, data) {
    await karyawanRef.doc(id).update(data);
}

async function DB_deleteKaryawan(id) {
    await karyawanRef.doc(id).delete();
}

async function DB_getKaryawanCount() {
    const snapshot = await karyawanRef.get();
    return snapshot.size;
}

// --- ATTENDANCES ---
async function DB_getAllAttendances() {
    const snapshot = await attendancesRef.get();
    return snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
}

async function DB_getAttendancesByDate(tanggal) {
    // tanggal format: "DD/MM/YYYY"
    const snapshot = await attendancesRef.where('tanggal', '==', tanggal).get();
    return snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
}

async function DB_addAttendance(data) {
    const docRef = await attendancesRef.add(data);
    return docRef.id;
}

async function DB_updateAttendance(docId, data) {
    await attendancesRef.doc(docId).update(data);
}

async function DB_getAttendancesByMonth(bulan, tahun) {
    // We need to filter client-side since tanggal is stored as DD/MM/YYYY string
    const snapshot = await attendancesRef.get();
    return snapshot.docs
        .map(doc => ({ docId: doc.id, ...doc.data() }))
        .filter(item => {
            const parts = item.tanggal.split('/');
            const itemBulan = parseInt(parts[1]);
            const itemTahun = parseInt(parts[2]);
            return itemBulan === bulan && itemTahun === tahun;
        });
}

async function DB_getAttendanceByUserAndDate(username, dateStr) {
    // dateStr format: "DD/MM/YYYY"
    // username is actually nama field
    const snapshot = await attendancesRef
        .where('nama', '==', username)
        .where('tanggal', '==', dateStr)
        .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { docId: doc.id, ...doc.data() };
}

async function DB_getAttendancesByUser(nama) {
    const snapshot = await attendancesRef.where('nama', '==', nama).get();
    return snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
}

// Run seed on load
seedDatabase();
