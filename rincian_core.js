// ============================
// URL Google Apps Script
// ============================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLGHBFeMGDY5d7pJgW-wEwX-z_J2iwwyrldY3DeWDVnQ56KtsF7I2V2sDHHyhxg6W9/exec";

// Elemen tabel
const tbody = document.querySelector("#tabelData tbody");
const sumBrutoCell = document.getElementById("sumBrutoCell");
const sumPPhCell = document.getElementById("sumPPhCell");
const sumJknCell = document.getElementById("sumJknCell");
const sumJmlCell = document.getElementById("sumJmlCell");

// ============================
// TAMPILKAN LOADING
// ============================
function showLoading() {
    tbody.innerHTML = `
        <tr>
            <td colspan="9" style="text-align:center; padding:15px; color:#555;">
                ⏳ Sedang memuat data...
            </td>
        </tr>
    `;
    if(sumBrutoCell) sumBrutoCell.textContent = "0";
    if(sumPPhCell) sumPPhCell.textContent = "0";
    if(sumJknCell) sumJknCell.textContent = "0";
    if(sumJmlCell) sumJmlCell.textContent = "0";
}

// ============================
// LOAD DATA
// ============================
async function loadData() {

    showLoading();

    // Ambil nilai filter dari halaman
    const jenis = document.getElementById("jenisFilter").value;
    const triwulan = document.getElementById("triwulanFilter").value;
    const tahun = document.getElementById("tahunFilter").value;
    
    // AMBIL WEWENANG DARI SESSION STORAGE
    const wewenang = sessionStorage.getItem("wewenang");

    // Jika tidak ada session login, kembalikan ke halaman login
    if (!wewenang) {
        window.location.href = "login.html";
        return;
    }

    // TAMBAHKAN PARAMETER WEWENANG KE URL
    // Kita menggunakan mode=list agar sesuai dengan Apps Script yang kita buat sebelumnya
    const url = `${SCRIPT_URL}?mode=list&jenis=${jenis}&triwulan=${triwulan}&tahun=${tahun}&wewenang=${encodeURIComponent(wewenang)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Gagal memuat data!");

        const result = await response.json();
        
        // Sesuaikan dengan format JSON dari Apps Script (data.data)
        if (result.status === "ok") {
            renderTable(result.data);
        } else {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">${result.message}</td></tr>`;
        }

    } catch(err) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:red;">❌ Error memuat data!</td></tr>`;
        console.error(err);
    }
}

// ============================
// RENDER TABEL
// ============================
function renderTable(data) {

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Tidak ada data ditemukan</td></tr>`;
        return;
    }

    let html = "";
    let sumBruto = 0, sumPPh = 0, sumJkn = 0, sumJml = 0;

    data.forEach(row => {
        // Penyesuaian nama kolom sesuai Google Sheets kamu
        const tanggal = row["Tanggal SP2D"]
            ? new Date(row["Tanggal SP2D"]).toLocaleDateString("id-ID")
            : "-";

        html += `
        <tr>
            <td>${row.Jenis || ""}</td>
            <td>${row.triwulan || ""}</td> 
            <td>${row["Nomor SP2D"] || ""}</td>
            <td>${tanggal}</td>
            <td>${formatNumber(row.Bruto)}</td>
            <td>${formatNumber(row.PPh)}</td>
            <td>${formatNumber(row.Jkn)}</td>
            <td>${formatNumber(row.Jml)}</td>
            <td>
                ${
                    row["Link Drive Penerima"] && row["Link Drive Penerima"].trim() !== "" 
                    ? `<a href="${row["Link Drive Penerima"]}" target="_blank" class="btn btn-detail">Cek Rincian</a>` 
                    : `<span style="color:#999">Tidak ada link</span>` 
                }
            </td>
        </tr>`;

        sumBruto += row.Bruto || 0;
        sumPPh += row.PPh || 0;
        sumJkn += row.Jkn || 0;
        sumJml += row.Jml || 0;
    });

    tbody.innerHTML = html;

    if(sumBrutoCell) sumBrutoCell.textContent = formatNumber(sumBruto);
    if(sumPPhCell) sumPPhCell.textContent = formatNumber(sumPPh);
    if(sumJknCell) sumJknCell.textContent = formatNumber(sumJkn);
    if(sumJmlCell) sumJmlCell.textContent = formatNumber(sumJml);
}

// ============================
// FORMAT ANGKA
// ============================
function formatNumber(num) {
    return num ? num.toLocaleString("id-ID") : "0";
}

// ============================
// LOAD OTOMATIS SAAT FILTER DIUBAH
// ============================
document.addEventListener("DOMContentLoaded", () => {
    const filterTahun = document.getElementById("tahunFilter");
    const filterJenis = document.getElementById("jenisFilter");
    const filterTriwulan = document.getElementById("triwulanFilter");

    if(filterTahun) filterTahun.addEventListener("change", loadData);
    if(filterJenis) filterJenis.addEventListener("change", loadData);
    if(filterTriwulan) filterTriwulan.addEventListener("change", loadData);

    loadData();
});
