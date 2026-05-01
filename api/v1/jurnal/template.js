'use-strict';

const logger = require('../../../config/logger');
const format = require('../../../config/format');
const moment = require('moment');

exports.htmlSinglePenilaianHarian = async function (data, state) {
    return `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 14px;
                    }

                    h2 {
                        margin-bottom: 10px;
                    }

                    h3 {
                        text-align: center;
                        margin-bottom: 20px;
                        font-size: 20px;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        page-break-inside: avoid;
                    }

                    th, td {
                        border: 1px solid #000;
                        padding: 6px;
                        text-align: center;
                    }

                    th {
                        background: #a5c5f5;
                    }

                    .text-left {
                        text-align: left;
                    }

                    .check {
                        font-weight: bold;
                        font-size: 14px;
                    }

                    .page {
                        page-break-after: always;
                    }

                    tr {
                        page-break-inside: avoid;
                    }

                    .header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                    }
                        
                    .header-left, .header-right {
                        width: 48%;
                    }

                    .header p {
                        margin: 2px 0;
                    }

                    .footer {
                        margin-top: 20px;
                    }

                    .small {
                        font-size: 12px;
                    }

                    .ttd-wrapper {
                        margin-top: 40px;
                        page-break-inside: avoid;
                    }

                    .ttd-row {
                        display: flex;
                        justify-content: space-between;
                    }

                    .ttd-col {
                        width: 45%;
                    }

                    .center {
                        text-align: center;
                    }

                    .ttd-bottom {
                        margin-top: 50px;
                        text-align: center;
                    }

                    .underline-text {
                        text-decoration: underline;
                        text-underline-offset: 3px;
                    }

                    .gallery {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                    }

                    .gallery-item {
                        width: 30%;
                        page-break-inside: avoid;
                    }

                    .image-box {
                        width: 100%;
                        height: 150px;
                        border: 1px solid #ccc;
                        border-radius: 6px;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .image-box img {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                    }

                    .caption {
                        font-size: 11px;
                        margin-top: 4px;
                        text-align: center;
                        word-break: break-word;
                    }
                </style>
            </head>

            <body>
                ${data.map((siswa) => `
                    <div class='page'>
                        <div class='header'>
                        <div class='header-left'>
                            <p><b>Nama</b> : ${siswa.nama_siswa}</p>
                            <p><b>Tanggal</b> : ${hariTanggalIndo(siswa.tanggal)}</p>
                        </div>
                        <div class='header-right'>
                            <p><b>Materi</b> : ${siswa.materi}</p>
                            <p><b>Refleksi</b> : ${siswa.refleksi}</p>
                        </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th rowspan='2'>No</th>
                                    <th rowspan='2'>Aktifitas</th>
                                    <th colspan='4'>Hasil</th>
                                    <th rowspan='2'>Keterangan</th>
                                </tr>
                                <tr>
                                    <th>BSB</th>
                                    <th>BSH</th>
                                    <th>MB</th>
                                    <th>BB</th>
                                </tr>
                            </thead>

                            <tbody>
                                ${siswa.items.map((item, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td class='text-left'>${item.item_silabus}</td>
                                    
                                    <td class='check'>${item.nilai == "1" ? `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='currentColor' class='icon icon-tabler icons-tabler-filled icon-tabler-check'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M20.707 6.293a1 1 0 0 1 0 1.414l-10 10a1 1 0 0 1 -1.414 0l-5 -5a1 1 0 0 1 1.414 -1.414l4.293 4.293l9.293 -9.293a1 1 0 0 1 1.414 0' /></svg>` : ''}</td>
                                    <td class='check'>${item.nilai == "2" ? `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='currentColor' class='icon icon-tabler icons-tabler-filled icon-tabler-check'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M20.707 6.293a1 1 0 0 1 0 1.414l-10 10a1 1 0 0 1 -1.414 0l-5 -5a1 1 0 0 1 1.414 -1.414l4.293 4.293l9.293 -9.293a1 1 0 0 1 1.414 0' /></svg>` : ''}</td>
                                    <td class='check'>${item.nilai == "3" ? `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='currentColor' class='icon icon-tabler icons-tabler-filled icon-tabler-check'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M20.707 6.293a1 1 0 0 1 0 1.414l-10 10a1 1 0 0 1 -1.414 0l-5 -5a1 1 0 0 1 1.414 -1.414l4.293 4.293l9.293 -9.293a1 1 0 0 1 1.414 0' /></svg>` : ''}</td>
                                    <td class='check'>${item.nilai == "4" ? `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='currentColor' class='icon icon-tabler icons-tabler-filled icon-tabler-check'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M20.707 6.293a1 1 0 0 1 0 1.414l-10 10a1 1 0 0 1 -1.414 0l-5 -5a1 1 0 0 1 1.414 -1.414l4.293 4.293l9.293 -9.293a1 1 0 0 1 1.414 0' /></svg>` : ''}</td>

                                    <td class=text-left>${item.keterangan || ''}</td>
                                </tr>
                                `).join("")}
                            </tbody>
                        </table>

                        <!-- KETERANGAN -->
                        <div class='footer small'>
                            <p>
                                Ket :
                                BSB = Berkembang Sangat Baik &nbsp;&nbsp;
                                BSH = Berkembang Sesuai Harapan &nbsp;&nbsp;
                                MB = Mulai Berkembang &nbsp;&nbsp;
                                BB = Belum Berkembang
                            </p>
                        </div>

                        <div class='ttd-wrapper'>
                            <!-- BARIS ATAS -->
                            <div class='ttd-row'>
                                <div class='ttd-col center'>
                                    <p>Class Teacher</p>
                                    <br><br><br><br>
                                    <b class="underline-text">${siswa.nama_guru ?? ''}</b><br>
                                    <b>NIY : ${siswa.niy_guru ?? '-'}</b>
                                </div>

                                <div class='ttd-col center'>
                                    <p>Parents,</p>
                                    <br><br><br><br>
                                    -------------------------
                                </div>
                            </div> 

                            <!-- BARIS BAWAH -->
                            <div class='ttd-bottom center'>
                                <p>Kinder Principal</p>
                                <br><br><br><br>
                                <b class="underline-text">${siswa.nama_principal}</b><br>
                                <b>NIY : ${siswa.niy_principal}</b>
                            </div>
                        </div>
                    </div>
                    ${state ? `
                        <div class='page'>
                            <h3>Dokumentasi Kegiatan Belajar</h3>
                            <div class='gallery'>
                                ${siswa.file && siswa.file.length > 0 ? siswa.file.map(img => `
                                    <div class='gallery-item'>
                                        <div class='image-box'>
                                            <img src="${img.url_image}">
                                        </div>
                                        <div class='caption'>
                                            ${img.caption || ''}
                                        </div>
                                    </div>
                                `).join("") : `<p>Tidak ada dokumentasi</p>`}
                            </div>
                        </div>
                    `: ``}
                `).join("")}
            </body>
        </html>
    `;
}

function hariTanggalIndo(tanggal) {
    const d = new Date(tanggal);

    return d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}