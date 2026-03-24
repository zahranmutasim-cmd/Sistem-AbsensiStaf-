/* ==============================
   Data Karyawan — JavaScript Logic
   FIREBASE EDITION
   ============================== */

// Avatar colors
const avatarColors = [
    '#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706',
    '#dc2626', '#4f46e5', '#0d9488', '#c026d3', '#0369a1',
    '#9333ea', '#e11d48', '#0284c7', '#15803d', '#b45309',
    '#7e22ce', '#be185d', '#0e7490', '#166534', '#92400e'
];

// ========== State ==========
let currentPage = 1;
const rowsPerPage = 8;
let karyawanData = [];
let filteredData = [];
let editingId = null;

// ========== Init ==========
document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    await loadKaryawan();
    initSearch();
    initFilters();
    initModal();
    initSidebar();
    initProfileDropdown();
});

// ========== Load from Firebase ==========
async function loadKaryawan() {
    try {
        karyawanData = await DB_getAllKaryawan();
        filteredData = [...karyawanData];
        renderTable();
    } catch (e) {
        console.error('Failed to load karyawan:', e);
        showToast('Gagal memuat data karyawan. Periksa koneksi internet.', 'error');
    }
}

// ========== Search ==========
function initSearch() {
    const searchInput = document.getElementById('searchKaryawan');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        currentPage = 1;
        applyFilters();
    });
}

// ========== Filters ==========
function initFilters() {
    const depFilter = document.getElementById('filterDepartemen');
    const jabFilter = document.getElementById('filterJabatan');

    if (depFilter) {
        depFilter.addEventListener('change', () => {
            currentPage = 1;
            applyFilters();
        });
    }

    if (jabFilter) {
        jabFilter.addEventListener('change', () => {
            currentPage = 1;
            applyFilters();
        });
    }
}

function applyFilters() {
    const searchVal = (document.getElementById('searchKaryawan')?.value || '').toLowerCase();
    const depVal = document.getElementById('filterDepartemen')?.value || '';
    const jabVal = document.getElementById('filterJabatan')?.value || '';

    filteredData = karyawanData.filter(k => {
        const matchSearch = !searchVal ||
            k.nama.toLowerCase().includes(searchVal) ||
            k.id.toLowerCase().includes(searchVal) ||
            k.telp.includes(searchVal);

        const matchDep = !depVal || k.departemen === depVal;
        const matchJab = !jabVal || k.jabatan === jabVal;

        return matchSearch && matchDep && matchJab;
    });

    renderTable();
}

// ========== Render Table ==========
function renderTable() {
    const tbody = document.getElementById('karyawanTableBody');
    const countEl = document.getElementById('resultCount');
    if (!tbody) return;

    // Calculate pagination
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, totalItems);
    const pageData = filteredData.slice(startIdx, endIdx);

    // Update count
    if (countEl) {
        countEl.innerHTML = `Menampilkan <strong>${totalItems}</strong> karyawan`;
    }

    // Empty state
    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="empty-state">
                        <i data-lucide="search-x"></i>
                        <p>Tidak ada data karyawan ditemukan</p>
                    </div>
                </td>
            </tr>
        `;
        lucide.createIcons();
        renderPagination(totalPages);
        return;
    }

    // Render rows
    tbody.innerHTML = pageData.map((k, i) => {
        const globalIdx = startIdx + i;
        const initials = k.nama.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const bgColor = avatarColors[globalIdx % avatarColors.length];

        const statusBadge = k.status === 'Aktif'
            ? `<span class="badge-aktif"><i data-lucide="check-circle-2"></i> Aktif</span>`
            : `<span class="badge-nonaktif"><i data-lucide="x-circle"></i> Nonaktif</span>`;

        return `
            <tr>
                <td><span class="id-cell">${k.id}</span></td>
                <td>
                    <div class="employee-photo" style="background:${bgColor}">${initials}</div>
                </td>
                <td><strong>${k.nama}</strong></td>
                <td>${k.jabatan}</td>
                <td>${k.departemen}</td>
                <td>${k.telp}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn detail" title="Detail" onclick="viewDetail('${k.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="action-btn edit" title="Edit" onclick="editKaryawan('${k.id}')">
                            <i data-lucide="pencil"></i>
                        </button>
                        <button class="action-btn delete" title="Hapus" onclick="deleteKaryawan('${k.id}')">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    lucide.createIcons();
    renderPagination(totalPages);
}

// ========== Pagination ==========
function renderPagination(totalPages) {
    const paginationInfo = document.getElementById('paginationInfo');
    const paginationBtns = document.getElementById('paginationBtns');
    if (!paginationBtns) return;

    const totalItems = filteredData.length;
    const start = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, totalItems);

    if (paginationInfo) {
        paginationInfo.innerHTML = `Menampilkan <strong>${start}</strong> - <strong>${end}</strong> dari <strong>${totalItems}</strong> data`;
    }

    let btnsHTML = `
        <button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i data-lucide="chevron-left"></i>
        </button>
    `;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (let p = startPage; p <= endPage; p++) {
        btnsHTML += `
            <button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>
        `;
    }

    btnsHTML += `
        <button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i data-lucide="chevron-right"></i>
        </button>
    `;

    paginationBtns.innerHTML = btnsHTML;
    lucide.createIcons();
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderTable();
    document.querySelector('.card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ========== Modal ==========
function initModal() {
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('modalCloseBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const form = document.getElementById('addKaryawanForm');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSaveKaryawan();
        });
    }
}

function openModal() {
    editingId = null;
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.classList.remove('show');
        document.body.style.overflow = '';
        document.getElementById('addKaryawanForm')?.reset();
        editingId = null;
    }
}

async function handleSaveKaryawan() {
    const nama = document.getElementById('inputNama')?.value.trim();
    const email = document.getElementById('inputEmail')?.value.trim();
    const telp = document.getElementById('inputTelp')?.value.trim();
    const jabatan = document.getElementById('inputJabatan')?.value;
    const departemen = document.getElementById('inputDepartemen')?.value;
    const alamat = document.getElementById('inputAlamat')?.value.trim();

    if (!nama || !email || !telp || !jabatan || !departemen) {
        alert('Mohon lengkapi semua field yang wajib diisi!');
        return;
    }

    try {
        if (editingId) {
            // Update existing
            await DB_updateKaryawan(editingId, {
                nama, jabatan, departemen, telp
            });
            showToast(`Data "${nama}" berhasil diperbarui!`);
        } else {
            // Generate new ID
            const count = await DB_getKaryawanCount();
            const newId = `KRY-${String(count + 1).padStart(3, '0')}`;

            await DB_addKaryawan({
                id: newId,
                nama,
                jabatan,
                departemen,
                telp,
                status: 'Aktif'
            });
            showToast(`Karyawan "${nama}" berhasil ditambahkan!`);
        }

        closeModal();
        await loadKaryawan();
    } catch (e) {
        console.error('Save error:', e);
        showToast('Gagal menyimpan data. Periksa koneksi internet.', 'error');
    }
}

// ========== Action Handlers ==========
function viewDetail(id) {
    const k = karyawanData.find(x => x.id === id);
    if (!k) return;
    alert(`📋 Detail Karyawan\n\nID: ${k.id}\nNama: ${k.nama}\nJabatan: ${k.jabatan}\nDepartemen: ${k.departemen}\nTelepon: ${k.telp}\nStatus: ${k.status}`);
}

function editKaryawan(id) {
    const k = karyawanData.find(x => x.id === id);
    if (!k) return;

    editingId = id;

    // Pre-fill form
    const inputNama = document.getElementById('inputNama');
    const inputTelp = document.getElementById('inputTelp');
    const inputJabatan = document.getElementById('inputJabatan');
    const inputDepartemen = document.getElementById('inputDepartemen');

    if (inputNama) inputNama.value = k.nama;
    if (inputTelp) inputTelp.value = k.telp;
    if (inputJabatan) inputJabatan.value = k.jabatan;
    if (inputDepartemen) inputDepartemen.value = k.departemen;

    openModal();
}

async function deleteKaryawan(id) {
    const k = karyawanData.find(x => x.id === id);
    if (!k) return;
    if (confirm(`Hapus karyawan "${k.nama}"?\n\nTindakan ini tidak dapat dibatalkan.`)) {
        try {
            await DB_deleteKaryawan(id);
            showToast(`Karyawan "${k.nama}" berhasil dihapus.`);
            await loadKaryawan();
        } catch (e) {
            console.error('Delete error:', e);
            showToast('Gagal menghapus data. Periksa koneksi internet.', 'error');
        }
    }
}

// ========== Toast Notification ==========
function showToast(message, type = 'success') {
    document.querySelectorAll('.toast-notif').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'toast-notif';
    const iconColor = type === 'success' ? '#16a34a' : '#dc2626';
    const iconName = type === 'success' ? 'check-circle-2' : 'alert-triangle';
    toast.innerHTML = `
        <i data-lucide="${iconName}" style="width:18px;height:18px;color:${iconColor};flex-shrink:0;"></i>
        <span>${message}</span>
    `;
    toast.style.cssText = `
        position: fixed; bottom: 24px; right: 24px; z-index: 200;
        background: white; border: 1px solid #e2e8f0; border-radius: 12px;
        padding: 14px 20px; display: flex; align-items: center; gap: 10px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.12); font-size: 14px; color: #1e293b;
        font-family: 'Inter', sans-serif; animation: modalSlideUp 0.3s ease;
        max-width: 400px;
    `;

    document.body.appendChild(toast);
    lucide.createIcons();
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== Sidebar Toggle ==========
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

// ========== Logout ==========
function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        window.location.href = 'halaman Login.html';
    }
}
