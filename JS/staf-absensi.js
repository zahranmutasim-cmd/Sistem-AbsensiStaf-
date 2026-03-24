/* ==============================
   Staf Absensi — JavaScript
   FIREBASE EDITION
   ============================== */

// ==================== CONFIG ====================
const COMPANY_QR_CODE = 'ZRAN-ABSEN-2026';
const JAM_MASUK_BATAS = '08:00';
const JAM_KERJA_MULAI = 8;
const JAM_KERJA_SELESAI = 17;

// ==================== STATE ====================
let html5QrCode = null;
let todayRecord = null;
let currentUser = null;

// Nama hari & bulan Indonesia
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Load user session
    const userData = sessionStorage.getItem('loggedInUser');
    if (!userData) {
        window.location.href = 'halaman Login.html';
        return;
    }
    currentUser = JSON.parse(userData);

    if (currentUser.role === 'admin') {
        window.location.href = 'dashboard.html';
        return;
    }

    // Display user info in header
    document.getElementById('staffName').textContent = currentUser.nama;
    document.getElementById('staffDept').textContent = currentUser.dept + ' Department';
    document.getElementById('staffAvatar').textContent = getInitials(currentUser.nama);

    // Set greeting based on time
    const greetEl = document.getElementById('greetingText');
    if (greetEl) {
        const hour = new Date().getHours();
        let greeting = 'Selamat Malam';
        if (hour >= 5 && hour < 12) greeting = 'Selamat Pagi';
        else if (hour >= 12 && hour < 15) greeting = 'Selamat Siang';
        else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
        greetEl.textContent = `${greeting}, ${currentUser.nama.split(' ')[0]}!`;
    }

    lucide.createIcons();
    startLiveClock();
    await loadTodayRecord();
    updateUI();
    await renderHistory();
    await updateStats();
});

function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

// ==================== LIVE CLOCK ====================
function startLiveClock() {
    function tick() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        document.getElementById('clockTime').textContent = `${h}:${m}:${s}`;

        const hari = HARI[now.getDay()];
        const tgl = now.getDate();
        const bln = BULAN[now.getMonth()];
        const thn = now.getFullYear();
        document.getElementById('clockDate').textContent = `${hari}, ${tgl} ${bln} ${thn}`;
    }
    tick();
    setInterval(tick, 1000);
}

// ==================== FIREBASE: Load Today's Record ====================
function getTodayDateStr() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

async function loadTodayRecord() {
    if (!currentUser) return;
    try {
        const dateStr = getTodayDateStr();
        const record = await DB_getAttendanceByUserAndDate(currentUser.nama, dateStr);
        if (record) {
            todayRecord = {
                docId: record.docId,
                date: record.tanggal,
                clockIn: record.jamMasuk || null,
                clockOut: record.jamKeluar || null,
                status: record.status,
                totalJam: null
            };
            // Calculate total jam if both times exist
            if (todayRecord.clockIn && todayRecord.clockOut) {
                const [inH, inM] = todayRecord.clockIn.split(':').map(Number);
                const [outH, outM] = todayRecord.clockOut.split(':').map(Number);
                const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                todayRecord.totalJam = `${hours}j ${minutes}m`;
            }
        } else {
            todayRecord = null;
        }
    } catch (e) {
        console.error('Failed to load today record:', e);
        todayRecord = null;
    }
}

// ==================== UI UPDATE ====================
function updateUI() {
    const btnClock = document.getElementById('btnClock');
    const btnLabel = document.getElementById('btnClockLabel');
    const btnIcon = document.getElementById('btnClockIcon');
    const statusEl = document.getElementById('attendanceStatus');
    const clockTimesEl = document.getElementById('clockTimes');
    const displayIn = document.getElementById('displayClockIn');
    const displayOut = document.getElementById('displayClockOut');

    btnClock.classList.remove('clock-in', 'clock-out');
    if (!todayRecord) {
        btnClock.classList.add('clock-in');
        btnLabel.textContent = 'Clock In Sekarang';
        btnIcon.setAttribute('data-lucide', 'scan');
        btnClock.disabled = false;

        statusEl.className = 'attendance-status belum';
        statusEl.innerHTML = '<i data-lucide="info"></i><span>Belum Absen Hari Ini</span>';

        clockTimesEl.style.display = 'none';
    } else if (todayRecord.clockIn && !todayRecord.clockOut) {
        btnClock.classList.add('clock-out');
        btnLabel.textContent = 'Clock Out Sekarang';
        btnIcon.setAttribute('data-lucide', 'scan');
        btnClock.disabled = false;

        statusEl.className = 'attendance-status masuk';
        statusEl.innerHTML = `<i data-lucide="check-circle-2"></i><span>Sudah Clock In — ${todayRecord.clockIn}</span>`;

        clockTimesEl.style.display = 'flex';
        displayIn.textContent = todayRecord.clockIn;
        displayOut.textContent = '--:--';
    } else {
        btnClock.classList.add('clock-in');
        btnLabel.textContent = 'Absensi Selesai ✓';
        btnIcon.setAttribute('data-lucide', 'check-circle-2');
        btnClock.disabled = true;

        statusEl.className = 'attendance-status pulang';
        statusEl.innerHTML = `<i data-lucide="briefcase"></i><span>Selesai — ${todayRecord.clockIn} s/d ${todayRecord.clockOut}</span>`;

        clockTimesEl.style.display = 'flex';
        displayIn.textContent = todayRecord.clockIn;
        displayOut.textContent = todayRecord.clockOut;
    }

    // Update QR modal title
    const qrTitle = document.getElementById('qrModalTitle');
    if (!todayRecord) {
        qrTitle.innerHTML = '<i data-lucide="scan" style="width:22px;height:22px;"></i> Scan QR Code — Clock In';
    } else if (!todayRecord.clockOut) {
        qrTitle.innerHTML = '<i data-lucide="scan" style="width:22px;height:22px;"></i> Scan QR Code — Clock Out';
    }

    lucide.createIcons();
}

// ==================== QR SCANNER ====================
function openQRScanner() {
    if (todayRecord && todayRecord.clockOut) return;

    const overlay = document.getElementById('qrModalOverlay');
    overlay.classList.add('show');

    setTimeout(() => {
        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("qrReader");
        }

        Html5Qrcode.getCameras().then(cameras => {
            if (cameras && cameras.length > 0) {
                let cameraId = cameras[0].id;
                for (const cam of cameras) {
                    if (cam.label.toLowerCase().includes('back') || cam.label.toLowerCase().includes('belakang')) {
                        cameraId = cam.id;
                        break;
                    }
                }

                html5QrCode.start(
                    cameraId,
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    onQRCodeScanned,
                    (errorMessage) => { }
                ).catch(err => {
                    console.log('Camera start failed:', err);
                    showScannerFallback();
                });
            } else {
                showScannerFallback();
            }
        }).catch(err => {
            console.log('Camera access failed:', err);
            showScannerFallback();
        });
    }, 300);
}

function showScannerFallback() {
    const readerEl = document.getElementById('qrReader');
    readerEl.innerHTML = `
        <div style="padding:40px 20px;text-align:center;color:#94a3b8;">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;opacity:0.5;display:block;">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                <line x1="12" y1="2" x2="12" y2="12"/>
            </svg>
            <p style="font-size:14px;font-weight:500;margin-bottom:4px;color:#64748b;">Kamera tidak tersedia</p>
            <p style="font-size:12px;">Gunakan input manual di bawah untuk memasukkan kode QR</p>
        </div>
    `;
}

function closeQRScanner() {
    const overlay = document.getElementById('qrModalOverlay');
    overlay.classList.remove('show');

    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
        }).catch(err => console.log('Stop error:', err));
    }

    document.getElementById('manualCodeInput').value = '';
}

function onQRCodeScanned(decodedText) {
    if (decodedText.trim().toUpperCase() === COMPANY_QR_CODE) {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().catch(() => { });
        }
        processAttendance();
    } else {
        const instruction = document.querySelector('.qr-instruction');
        instruction.textContent = '❌ QR Code tidak valid! Gunakan QR Code perusahaan.';
        instruction.style.color = '#dc2626';
        setTimeout(() => {
            instruction.textContent = 'Arahkan kamera ke QR Code perusahaan untuk konfirmasi absensi';
            instruction.style.color = '#64748b';
        }, 3000);
    }
}

function handleManualCode() {
    const input = document.getElementById('manualCodeInput');
    const code = input.value.trim().toUpperCase();

    if (!code) {
        input.style.borderColor = '#dc2626';
        input.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
        setTimeout(() => {
            input.style.borderColor = '#e2e8f0';
            input.style.boxShadow = 'none';
        }, 2000);
        return;
    }

    if (code === COMPANY_QR_CODE) {
        processAttendance();
    } else {
        input.style.borderColor = '#dc2626';
        input.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
        input.value = '';
        input.placeholder = 'Kode tidak valid! Coba lagi...';
        setTimeout(() => {
            input.style.borderColor = '#e2e8f0';
            input.style.boxShadow = 'none';
            input.placeholder = 'Masukkan kode QR...';
        }, 2000);
    }
}

// ==================== PROCESS ATTENDANCE (Firebase) ====================
async function processAttendance() {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = getTodayDateStr();

    try {
        if (!todayRecord) {
            // Clock In — create new record in Firebase
            const isLate = timeStr > JAM_MASUK_BATAS;
            const data = {
                nama: currentUser.nama,
                departemen: currentUser.dept,
                tanggal: dateStr,
                jamMasuk: timeStr,
                jamKeluar: '',
                status: isLate ? 'Terlambat' : 'Hadir',
                keterangan: ''
            };

            const docId = await DB_addAttendance(data);

            todayRecord = {
                docId: docId,
                date: dateStr,
                clockIn: timeStr,
                clockOut: null,
                status: data.status,
                totalJam: null
            };

            closeQRScanner();
            showSuccess('Clock In Berhasil!', `${timeStr} WIB`, isLate ? 'Anda terlambat hari ini ⏰' : 'Selamat bekerja! Semangat hari ini 💪');

        } else if (!todayRecord.clockOut) {
            // Clock Out — update existing record in Firebase
            const [inH, inM] = todayRecord.clockIn.split(':').map(Number);
            const [outH, outM] = timeStr.split(':').map(Number);
            const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;

            todayRecord.clockOut = timeStr;
            todayRecord.totalJam = `${hours}j ${minutes}m`;

            await DB_updateAttendance(todayRecord.docId, {
                jamKeluar: timeStr
            });

            closeQRScanner();
            showSuccess('Clock Out Berhasil!', `${timeStr} WIB`, `Total kerja hari ini: ${todayRecord.totalJam} 🎉`);
        }

        updateUI();
        await renderHistory();
        await updateStats();

    } catch (e) {
        console.error('Attendance error:', e);
        alert('Gagal menyimpan absensi. Periksa koneksi internet Anda.');
    }
}

// ==================== SUCCESS OVERLAY ====================
function showSuccess(title, time, message) {
    const overlay = document.getElementById('successOverlay');
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successTime').textContent = time;
    document.getElementById('successMessage').textContent = message;

    overlay.classList.add('show');
    lucide.createIcons();

    setTimeout(() => {
        overlay.classList.remove('show');
    }, 3000);
}

// ==================== RENDER HISTORY (from Firebase) ====================
async function renderHistory() {
    const tbody = document.getElementById('historyTableBody');

    let records = [];
    try {
        const allRecords = await DB_getAttendancesByUser(currentUser.nama);
        // Sort by tanggal descending
        allRecords.sort((a, b) => {
            const [dA, mA, yA] = a.tanggal.split('/');
            const [dB, mB, yB] = b.tanggal.split('/');
            return new Date(yB, mB - 1, dB) - new Date(yA, mA - 1, dA);
        });
        records = allRecords.slice(0, 7);
    } catch (e) {
        console.error('Failed to load history:', e);
    }

    if (records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="history-empty">
                        <i data-lucide="calendar-x"></i>
                        <p>Belum ada riwayat absensi</p>
                    </div>
                </td>
            </tr>
        `;
        lucide.createIcons();
        return;
    }

    tbody.innerHTML = records.map(rec => {
        const [d, m, y] = rec.tanggal.split('/');
        const dateObj = new Date(y, m - 1, d);
        const hari = HARI[dateObj.getDay()];
        const dateFormatted = `${hari}, ${parseInt(d)} ${BULAN[parseInt(m) - 1]} ${y}`;

        const statusClass = rec.status.toLowerCase().replace(/[/ ]/g, '');
        const clockInClass = rec.status === 'Terlambat' ? 'time-cell late' : 'time-cell';
        const clockOutVal = rec.jamKeluar || '--:--';
        const clockOutClass = rec.jamKeluar ? 'time-cell' : 'time-cell empty';

        // Calculate total jam
        let totalJam = '-';
        if (rec.jamMasuk && rec.jamKeluar) {
            const [h1, m1] = rec.jamMasuk.split(':').map(Number);
            const [h2, m2] = rec.jamKeluar.split(':').map(Number);
            const totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            totalJam = `${hours}j ${mins}m`;
        }

        return `
            <tr>
                <td>${dateFormatted}</td>
                <td class="${clockInClass}">${rec.jamMasuk || '--:--'}</td>
                <td class="${clockOutClass}">${clockOutVal}</td>
                <td style="font-weight:600;color:#1e293b;">${totalJam}</td>
                <td><span class="history-status ${statusClass}">${rec.status}</span></td>
            </tr>
        `;
    }).join('');

    lucide.createIcons();
}

// ==================== UPDATE STATS (from Firebase) ====================
async function updateStats() {
    let records = [];
    try {
        records = await DB_getAttendancesByUser(currentUser.nama);
    } catch (e) {
        console.error('Failed to load stats:', e);
    }

    // Filter for current month
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const monthRecords = records.filter(r => {
        const [d, m, y] = r.tanggal.split('/');
        return parseInt(m) === currentMonth && parseInt(y) === currentYear;
    });

    let hadir = 0, terlambat = 0, izin = 0, alpha = 0;

    monthRecords.forEach(rec => {
        switch (rec.status) {
            case 'Hadir': hadir++; break;
            case 'Terlambat': terlambat++; break;
            case 'Izin': case 'Sakit': izin++; break;
            case 'Alpha': alpha++; break;
        }
    });

    document.getElementById('statHadir').textContent = hadir;
    document.getElementById('statTerlambat').textContent = terlambat;
    document.getElementById('statIzin').textContent = izin;
    document.getElementById('statAlpha').textContent = alpha;
}

// ==================== LOGOUT ====================
function handleLogout() {
    if (confirm('Yakin ingin keluar?')) {
        window.location.href = 'halaman Login.html';
    }
}

// ==================== KEYBOARD SHORTCUT ====================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeQRScanner();
        document.getElementById('successOverlay').classList.remove('show');
    }

    if (e.key === 'Enter' && document.activeElement.id === 'manualCodeInput') {
        handleManualCode();
    }
});
