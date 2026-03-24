/* ==============================
   Dashboard — Sistem Absensi Karyawan
   JavaScript Logic (dashboard.js)
   FIREBASE EDITION
   ============================== */

// ========== Initialize Icons ==========
document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    initSidebar();
    initProfileDropdown();
    initDateTime();
    await initChart();
    await renderTable();
});

// ========== Sidebar Toggle (Mobile) ==========
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const hamburger = document.getElementById('hamburgerBtn');

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
    const btn = document.getElementById('profileBtn');
    const dropdown = document.getElementById('profileDropdown');

    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        btn.classList.toggle('open');
        dropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        btn.classList.remove('open');
        dropdown.classList.remove('show');
    });
}

// ========== Date & Time Display ==========
function initDateTime() {
    const dateEl = document.getElementById('currentDate');
    if (!dateEl) return;

    function update() {
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('id-ID', options);
    }

    update();
    setInterval(update, 60000);
}

// ========== Chart.js — Weekly Attendance (from Firebase) ==========
async function initChart() {
    const ctx = document.getElementById('attendanceChart');
    if (!ctx) return;

    // Get all attendance data from Firebase
    let allData = [];
    try {
        allData = await DB_getAllAttendances();
    } catch (e) {
        console.error('Failed to load chart data:', e);
    }

    // Calculate current week days (Mon-Fri)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const labels = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const hadirData = [0, 0, 0, 0, 0];
    const izinData = [0, 0, 0, 0, 0];
    const sakitData = [0, 0, 0, 0, 0];

    for (let i = 0; i < 5; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const dateStr = `${dd}/${mm}/${yyyy}`;

        allData.forEach(item => {
            if (item.tanggal === dateStr) {
                if (item.status === 'Hadir') hadirData[i]++;
                else if (item.status === 'Terlambat') hadirData[i]++;
                else if (item.status === 'Izin') izinData[i]++;
                else if (item.status === 'Sakit') sakitData[i]++;
            }
        });
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Hadir',
                    data: hadirData,
                    backgroundColor: 'rgba(37, 99, 235, 0.8)',
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.55,
                    categoryPercentage: 0.7,
                },
                {
                    label: 'Izin',
                    data: izinData,
                    backgroundColor: 'rgba(217, 119, 6, 0.8)',
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.55,
                    categoryPercentage: 0.7,
                },
                {
                    label: 'Sakit',
                    data: sakitData,
                    backgroundColor: 'rgba(220, 38, 38, 0.7)',
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.55,
                    categoryPercentage: 0.7,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                        padding: 20,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12,
                            weight: '500'
                        },
                        color: '#64748b'
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleFont: { family: "'Inter', sans-serif", size: 13, weight: '600' },
                    bodyFont: { family: "'Inter', sans-serif", size: 12 },
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: true,
                    boxPadding: 4,
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { family: "'Inter', sans-serif", size: 12, weight: '500' },
                        color: '#94a3b8'
                    },
                    border: { display: false }
                },
                y: {
                    beginAtZero: true,
                    grace: '7%',
                    grid: {
                        color: '#f1f5f9',
                        drawTicks: false,
                    },
                    ticks: {
                        font: { family: "'Inter', sans-serif", size: 12 },
                        color: '#94a3b8',
                        padding: 8,
                        stepSize: 5
                    },
                    border: { display: false }
                }
            }
        }
    });
}

// Colors for avatar initials
const avatarColors = [
    '#2563eb', '#7c3aed', '#0891b2', '#059669',
    '#d97706', '#dc2626', '#4f46e5', '#0d9488',
    '#c026d3', '#0369a1'
];

// ========== Render Table (from Firebase) ==========
async function renderTable() {
    const tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;

    // Get today's date
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const today = `${dd}/${mm}/${yyyy}`;

    let todayData = [];
    try {
        todayData = await DB_getAttendancesByDate(today);
    } catch (e) {
        console.error('Failed to load table data:', e);
    }

    // If no data for today, get most recent data
    if (todayData.length === 0) {
        try {
            const allData = await DB_getAllAttendances();
            // Sort by tanggal desc and take first 10
            allData.sort((a, b) => {
                const [dA, mA, yA] = a.tanggal.split('/');
                const [dB, mB, yB] = b.tanggal.split('/');
                return new Date(yB, mB - 1, dB) - new Date(yA, mA - 1, dA);
            });
            todayData = allData.slice(0, 10);
        } catch (e) {
            console.error('Failed to load fallback data:', e);
        }
    }

    if (todayData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:#94a3b8;">Belum ada data absensi</td></tr>';
        return;
    }

    tbody.innerHTML = todayData.map((row, i) => {
        const initials = row.nama.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const bgColor = avatarColors[i % avatarColors.length];

        const statusIcons = {
            'Hadir': 'check-circle-2',
            'Terlambat': 'alarm-clock',
            'Izin': 'clock',
            'Sakit': 'thermometer',
            'Alpha': 'x-circle'
        };

        const statusLower = row.status.toLowerCase();

        return `
            <tr>
                <td>
                    <div class="employee-cell">
                        <div class="avatar-sm" style="background:${bgColor}">${initials}</div>
                        <span>${row.nama}</span>
                    </div>
                </td>
                <td>${row.tanggal}</td>
                <td>${row.jamMasuk || '-'}</td>
                <td>${row.jamKeluar || '-'}</td>
                <td>
                    <span class="status-badge ${statusLower}">
                        <i data-lucide="${statusIcons[row.status] || 'circle'}"></i>
                        ${row.status}
                    </span>
                </td>
            </tr>
        `;
    }).join('');

    // Re-init icons for dynamically added content
    lucide.createIcons();
}

// ========== Logout Handler ==========
function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        window.location.href = 'halaman Login.html';
    }
}
