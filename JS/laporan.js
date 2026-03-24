/* ==============================
   Laporan — JavaScript Logic
   FIREBASE EDITION
   ============================== */

// Avatar colors
const avatarColors = [
    '#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706',
    '#dc2626', '#4f46e5', '#0d9488', '#c026d3', '#0369a1',
];

let rekapData = [];

// ========== Init ==========
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initSidebar();
    initProfileDropdown();
    // Auto-generate on load
    generateLaporan();
});

// ========== Hitung Hari Kerja dalam 1 Bulan ==========
function getHariKerja(bulan, tahun) {
    let count = 0;
    const daysInMonth = new Date(tahun, bulan, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
        const day = new Date(tahun, bulan - 1, d).getDay();
        if (day !== 0 && day !== 6) count++; // Skip Sabtu & Minggu
    }
    return count;
}

// ========== Hitung Total Menit dari Jam Masuk & Keluar ==========
function calculateMinutes(jamMasuk, jamKeluar) {
    if (!jamMasuk || !jamKeluar) return 0;
    const [h1, m1] = jamMasuk.split(':').map(Number);
    const [h2, m2] = jamKeluar.split(':').map(Number);
    let total = (h2 * 60 + m2) - (h1 * 60 + m1);
    return total > 0 ? total : 0;
}

// ========== Format Menit ke "Xj Ym" ==========
function formatJam(totalMinutes) {
    if (totalMinutes === 0) return '0j 0m';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}j ${minutes}m`;
}

// ========== Generate Laporan (from Firebase) ==========
async function generateLaporan() {
    const bulan = parseInt(document.getElementById('filterBulan').value);
    const tahun = parseInt(document.getElementById('filterTahun').value);
    const departemen = document.getElementById('filterDepartemen').value;

    let filteredData = [];
    try {
        // Get data from Firebase filtered by month/year
        const monthData = await DB_getAttendancesByMonth(bulan, tahun);

        // Filter by departemen if selected
        filteredData = departemen
            ? monthData.filter(item => item.departemen === departemen)
            : monthData;
    } catch (e) {
        console.error('Failed to load laporan data:', e);
        showToast('Gagal memuat data laporan. Periksa koneksi internet.', 'error');
        return;
    }

    // Aggregate per karyawan
    const rekapMap = {};

    filteredData.forEach(item => {
        if (!rekapMap[item.nama]) {
            rekapMap[item.nama] = {
                nama: item.nama,
                departemen: item.departemen,
                hadir: 0,
                terlambat: 0,
                izin: 0,
                sakit: 0,
                alpha: 0,
                totalMenit: 0,
            };
        }

        const r = rekapMap[item.nama];
        switch (item.status) {
            case 'Hadir': r.hadir++; break;
            case 'Terlambat': r.terlambat++; break;
            case 'Izin': r.izin++; break;
            case 'Sakit': r.sakit++; break;
            case 'Alpha': r.alpha++; break;
        }

        r.totalMenit += calculateMinutes(item.jamMasuk, item.jamKeluar);
    });

    // Convert to array & sort by nama
    rekapData = Object.values(rekapMap).sort((a, b) => a.nama.localeCompare(b.nama));

    const hariKerja = getHariKerja(bulan, tahun);

    // Update stat cards
    updateStatCards(hariKerja);

    // Render table
    renderTable(hariKerja);
}

// ========== Update Stat Cards ==========
function updateStatCards(hariKerja) {
    let totalHadir = 0, totalTerlambat = 0, totalIzinSakit = 0, totalAlpha = 0;

    rekapData.forEach(r => {
        totalHadir += r.hadir;
        totalTerlambat += r.terlambat;
        totalIzinSakit += r.izin + r.sakit;
        totalAlpha += r.alpha;
    });

    document.getElementById('statHariKerja').textContent = hariKerja;
    document.getElementById('statTotalHadir').textContent = totalHadir;
    document.getElementById('statTotalTerlambat').textContent = totalTerlambat;
    document.getElementById('statTotalIzinSakit').textContent = totalIzinSakit;
    document.getElementById('statTotalAlpha').textContent = totalAlpha;
}

// ========== Render Table ==========
function renderTable(hariKerja) {
    const tbody = document.getElementById('rekapTableBody');

    if (rekapData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10">
                    <div class="empty-state">
                        <i data-lucide="file-x"></i>
                        <p>Tidak ada data untuk periode ini</p>
                    </div>
                </td>
            </tr>`;
        lucide.createIcons();
        return;
    }

    let html = '';
    rekapData.forEach((r, idx) => {
        const initials = r.nama.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        const color = avatarColors[idx % avatarColors.length];
        const totalJam = formatJam(r.totalMenit);

        const persen = hariKerja > 0
            ? Math.round(((r.hadir + r.terlambat) / hariKerja) * 100)
            : 0;

        let badgeClass = 'danger';
        if (persen >= 90) badgeClass = 'excellent';
        else if (persen >= 75) badgeClass = 'good';
        else if (persen >= 50) badgeClass = 'warning';

        html += `
            <tr>
                <td>${idx + 1}</td>
                <td>
                    <div class="employee-cell">
                        <div class="avatar-sm" style="background:${color};">${initials}</div>
                        <span>${r.nama}</span>
                    </div>
                </td>
                <td>${r.departemen}</td>
                <td>${r.hadir}</td>
                <td>${r.terlambat}</td>
                <td>${r.izin}</td>
                <td>${r.sakit}</td>
                <td>${r.alpha}</td>
                <td>${totalJam}</td>
                <td><span class="kehadiran-badge ${badgeClass}">${persen}%</span></td>
            </tr>`;
    });

    tbody.innerHTML = html;
    lucide.createIcons();
}

// ========== Export to Excel ==========
function exportToExcel() {
    if (rekapData.length === 0) {
        showToast('Tidak ada data untuk di-export. Generate laporan terlebih dahulu.', 'error');
        return;
    }

    const bulan = document.getElementById('filterBulan');
    const tahun = document.getElementById('filterTahun');
    const bulanText = bulan.options[bulan.selectedIndex].text;
    const tahunText = tahun.value;
    const hariKerja = getHariKerja(parseInt(bulan.value), parseInt(tahun.value));

    const rows = rekapData.map((r, idx) => {
        const persen = hariKerja > 0
            ? Math.round(((r.hadir + r.terlambat) / hariKerja) * 100)
            : 0;

        return {
            'No': idx + 1,
            'Nama Karyawan': r.nama,
            'Departemen': r.departemen,
            'Hadir': r.hadir,
            'Terlambat': r.terlambat,
            'Izin': r.izin,
            'Sakit': r.sakit,
            'Alpha': r.alpha,
            'Total Jam': formatJam(r.totalMenit),
            '% Kehadiran': `${persen}%`,
        };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
        { wch: 4 }, { wch: 22 }, { wch: 14 }, { wch: 8 },
        { wch: 10 }, { wch: 6 }, { wch: 6 }, { wch: 7 },
        { wch: 12 }, { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Absensi');

    const filename = `Laporan_Absensi_${bulanText}_${tahunText}.xlsx`;
    XLSX.writeFile(wb, filename);

    showToast(`File "${filename}" berhasil di-download!`);
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
