/* ==============================
   Absensi — JavaScript Logic
   FIREBASE EDITION
   ============================== */

// Avatar colors
const avatarColors = [
    '#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706',
    '#dc2626', '#4f46e5', '#0d9488', '#c026d3', '#0369a1',
    '#9333ea', '#e11d48', '#0284c7', '#15803d', '#b45309',
    '#7e22ce', '#be185d', '#0e7490', '#166534', '#92400e',
];

// Status config
const statusConfig = {
    'Hadir': { bg: '#f0fdf4', color: '#16a34a', icon: 'check-circle' },
    'Terlambat': { bg: '#fffbeb', color: '#d97706', icon: 'alert-circle' },
    'Izin': { bg: '#eff6ff', color: '#2563eb', icon: 'calendar' },
    'Sakit': { bg: '#fef2f2', color: '#dc2626', icon: 'thermometer' },
    'Alpha': { bg: '#f3f4f6', color: '#6b7280', icon: 'x-circle' },
};

// Mapping karyawan → departemen
const karyawanDepartemen = {
    'Ahmad Fauzi': 'IT', 'Budi Santoso': 'HR', 'Citra Dewi': 'Finance',
    'Dedi Kurniawan': 'IT', 'Eka Putri': 'Marketing', 'Fajar Hidayat': 'Operasional',
    'Gita Rahayu': 'Finance', 'Hendra Wijaya': 'IT', 'Indah Permata': 'HR',
    'Joko Widodo': 'Marketing', 'Kartika Sari': 'IT', 'Lukman Hakim': 'Finance',
    'Maya Anggraini': 'HR', 'Nugroho Adi': 'Operasional', 'Oktavia Salsabila': 'Marketing',
    'Putra Ramadhan': 'IT', 'Qory Sandrina': 'Finance', 'Rizky Pratama': 'HR',
    'Siti Nurhaliza': 'Marketing', 'Teguh Prabowo': 'Operasional',
};

let absensiData = [];
let filteredData = [];
let editingDocId = null;

// ========== Init ==========
document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    await loadAbsensi();
    initFilters();
    initModal();
    initSidebar();
    initProfileDropdown();
});

// ========== Load from Firebase ==========
async function loadAbsensi() {
    try {
        absensiData = await DB_getAllAttendances();
        filteredData = [...absensiData];
        updateStatCards();
        renderTable();
    } catch (e) {
        console.error('Failed to load absensi:', e);
    }
}

// ========== Update Stat Cards ==========
function updateStatCards() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const today = `${dd}/${mm}/${yyyy}`;
    const todayData = absensiData.filter(d => d.tanggal === today);

    const hadir = todayData.filter(d => d.status === 'Hadir').length;
    const terlambat = todayData.filter(d => d.status === 'Terlambat').length;
    const izinCuti = todayData.filter(d => d.status === 'Izin').length;
    const alpha = todayData.filter(d => d.status === 'Alpha').length;
    const sakit = todayData.filter(d => d.status === 'Sakit').length;

    document.getElementById('statHadir').textContent = hadir;
    document.getElementById('statTerlambat').textContent = terlambat;
    document.getElementById('statIzinCuti').textContent = izinCuti + sakit;
    document.getElementById('statAlpha').textContent = alpha;
}

// ========== Filters ==========
function initFilters() {
    const searchInput = document.getElementById('searchAbsensi');
    const filterTanggal = document.getElementById('filterTanggal');
    const filterDepartemen = document.getElementById('filterDepartemen');
    const filterStatus = document.getElementById('filterStatus');

    searchInput.addEventListener('input', applyFilters);
    filterTanggal.addEventListener('change', applyFilters);
    filterDepartemen.addEventListener('change', applyFilters);
    filterStatus.addEventListener('change', applyFilters);
}

function applyFilters() {
    const search = document.getElementById('searchAbsensi').value.toLowerCase().trim();
    const tanggal = document.getElementById('filterTanggal').value;
    const departemen = document.getElementById('filterDepartemen').value;
    const status = document.getElementById('filterStatus').value;

    filteredData = absensiData.filter(item => {
        if (search && !item.nama.toLowerCase().includes(search)) return false;

        if (tanggal) {
            const parts = item.tanggal.split('/');
            const itemDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            if (itemDate !== tanggal) return false;
        }

        if (departemen && item.departemen !== departemen) return false;
        if (status && item.status !== status) return false;

        return true;
    });

    renderTable();
}

// ========== Calculate Total Jam ==========
function calculateTotalJam(jamMasuk, jamKeluar) {
    if (!jamMasuk || !jamKeluar) return '-';
    const [h1, m1] = jamMasuk.split(':').map(Number);
    const [h2, m2] = jamKeluar.split(':').map(Number);
    let totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (totalMinutes < 0) totalMinutes = 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}j ${minutes}m`;
}

// ========== Render Table ==========
function renderTable() {
    const tbody = document.getElementById('absensiTableBody');

    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i data-lucide="search-x"></i>
                        <p>Tidak ada data absensi ditemukan</p>
                    </div>
                </td>
            </tr>`;
        lucide.createIcons();
        return;
    }

    let html = '';
    filteredData.forEach((item, idx) => {
        const initials = item.nama.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        const color = avatarColors[idx % avatarColors.length];
        const totalJam = calculateTotalJam(item.jamMasuk, item.jamKeluar);
        const sc = statusConfig[item.status] || statusConfig['Hadir'];

        const isLate = item.status === 'Terlambat';
        const hasTime = item.jamMasuk && item.jamKeluar;

        let totalJamClass = 'total-jam';
        if (hasTime) {
            const [h1, m1] = item.jamMasuk.split(':').map(Number);
            const [h2, m2] = item.jamKeluar.split(':').map(Number);
            const totalMin = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (totalMin < 480) totalJamClass += ' danger';
        }

        html += `
            <tr>
                <td>
                    <div class="employee-cell">
                        <div class="avatar-sm" style="background:${color};">${initials}</div>
                        <span>${item.nama}</span>
                    </div>
                </td>
                <td>${item.tanggal}</td>
                <td><span class="time-cell${isLate ? ' late' : ''}${!item.jamMasuk ? ' empty' : ''}">${item.jamMasuk || '—'}</span></td>
                <td><span class="time-cell${!item.jamKeluar ? ' empty' : ''}">${item.jamKeluar || '—'}</span></td>
                <td><span class="${totalJamClass}">${totalJam}</span></td>
                <td>
                    <span class="status-badge" style="background:${sc.bg};color:${sc.color};">
                        <i data-lucide="${sc.icon}"></i>
                        ${item.status}
                    </span>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn detail" title="Detail" onclick="viewDetail('${item.docId}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="action-btn edit" title="Edit" onclick="editAbsensi('${item.docId}')">
                            <i data-lucide="pencil"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    });

    tbody.innerHTML = html;
    lucide.createIcons();
}

// ========== Modal ==========
function initModal() {
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('modalCloseBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const form = document.getElementById('addAbsensiForm');

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('show')) {
            closeModal();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSaveAbsensi();
    });
}

function openModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    document.getElementById('inputTanggal').valueAsDate = new Date();
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    document.getElementById('addAbsensiForm').reset();
    editingDocId = null;
    document.getElementById('modalTitle').textContent = 'Catat Absensi Manual';
}

async function handleSaveAbsensi() {
    const karyawan = document.getElementById('inputKaryawan').value;
    const tanggal = document.getElementById('inputTanggal').value;
    const jamMasuk = document.getElementById('inputJamMasuk').value;
    const jamKeluar = document.getElementById('inputJamKeluar').value;
    const status = document.getElementById('inputStatus').value;
    const keterangan = document.getElementById('inputKeterangan').value;

    if (!karyawan || !tanggal || !status) {
        showToast('Mohon lengkapi field yang wajib diisi!', 'error');
        return;
    }

    // Format date from yyyy-mm-dd to dd/mm/yyyy
    const dateParts = tanggal.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    const data = {
        nama: karyawan,
        departemen: karyawanDepartemen[karyawan] || '-',
        tanggal: formattedDate,
        jamMasuk: jamMasuk || '',
        jamKeluar: jamKeluar || '',
        status: status,
        keterangan: keterangan || '',
    };

    try {
        if (editingDocId) {
            await DB_updateAttendance(editingDocId, data);
            showToast('Data absensi berhasil diperbarui!');
        } else {
            await DB_addAttendance(data);
            showToast('Data absensi berhasil disimpan!');
        }

        await loadAbsensi();
        closeModal();
    } catch (e) {
        console.error('Save absensi error:', e);
        showToast('Gagal menyimpan data. Periksa koneksi internet.', 'error');
    }
}

// ========== Action Handlers ==========
function viewDetail(docId) {
    const item = absensiData.find(d => d.docId === docId);
    if (!item) return;

    const totalJam = calculateTotalJam(item.jamMasuk, item.jamKeluar);

    alert(
        `Detail Absensi\n\n` +
        `Nama: ${item.nama}\n` +
        `Departemen: ${item.departemen}\n` +
        `Tanggal: ${item.tanggal}\n` +
        `Jam Masuk: ${item.jamMasuk || '-'}\n` +
        `Jam Keluar: ${item.jamKeluar || '-'}\n` +
        `Total Jam: ${totalJam}\n` +
        `Status: ${item.status}\n` +
        `Keterangan: ${item.keterangan || '-'}`
    );
}

function editAbsensi(docId) {
    const item = absensiData.find(d => d.docId === docId);
    if (!item) return;

    editingDocId = docId;
    document.getElementById('modalTitle').textContent = 'Edit Absensi';

    document.getElementById('inputKaryawan').value = item.nama;

    const parts = item.tanggal.split('/');
    document.getElementById('inputTanggal').value = `${parts[2]}-${parts[1]}-${parts[0]}`;

    document.getElementById('inputStatus').value = item.status;
    document.getElementById('inputJamMasuk').value = item.jamMasuk || '';
    document.getElementById('inputJamKeluar').value = item.jamKeluar || '';
    document.getElementById('inputKeterangan').value = item.keterangan || '';

    const overlay = document.getElementById('modalOverlay');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// ========== Toast Notification ==========
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    const iconName = type === 'success' ? 'check-circle' : 'alert-triangle';
    toast.innerHTML = `<i data-lucide="${iconName}"></i><span>${message}</span>`;

    if (type === 'error') {
        toast.querySelector('i').style.color = '#f87171';
    }

    document.body.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 3000);
}

// ========== Sidebar Toggle ==========
function initSidebar() {
    const hamburger = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
    }
}

// ========== Profile Dropdown ==========
function initProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const dropdown = document.getElementById('profileDropdown');

    if (profileBtn && dropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
            profileBtn.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
                profileBtn.classList.remove('open');
            }
        });
    }
}

// ========== Logout ==========
function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        window.location.href = 'halaman Login.html';
    }
}
