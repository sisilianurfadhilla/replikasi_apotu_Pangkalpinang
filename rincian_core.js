// ============================
// URL Google Apps Script
// ============================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyURv5GxciH9nH9yEtVu7Z17MyWtpVAq2H4VnTKAklf76jPMAU3iPrwSCijMR_zGgPuMQ/exec";

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
    sumBrutoCell.textContent = "0";
    sumPPhCell.textContent = "0";
    sumJknCell.textContent = "0";
    sumJmlCell.textContent = "0";
}

// ============================
// LOAD DATA
// ============================
async function loadData() {

    showLoading();

    const jenis = document.getElementById("jenisFilter").value;
    const triwulan = document.getElementById("triwulanFilter").value;
    const tahun = document.getElementById("tahunFilter").value;

    const url = `${SCRIPT_URL}?action=getRincian&jenis=${jenis}&triwulan=${triwulan}&tahun=${tahun}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Gagal memuat data!");

        const data = await response.json();
        renderTable(data);

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
            <td>${formatNumber(row.Jml)}</td>  <!-- FIXED: sudah memakai formatNumber -->
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

    sumBrutoCell.textContent = formatNumber(sumBruto);
    sumPPhCell.textContent = formatNumber(sumPPh);
    sumJknCell.textContent = formatNumber(sumJkn);
    sumJmlCell.textContent = formatNumber(sumJml); // juga ditampilkan memakai format number
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
    document.getElementById("tahunFilter").addEventListener("change", loadData);
    document.getElementById("jenisFilter").addEventListener("change", loadData);
    document.getElementById("triwulanFilter").addEventListener("change", loadData);

    loadData();
});
