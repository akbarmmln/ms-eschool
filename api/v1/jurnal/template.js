'use-strict';

const logger = require('../../../config/logger');
const format = require('../../../config/format');
const moment = require('moment');

exports.htmlSinglePenilaianHarian = async function (data) {
  return `
    <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                }

                h2 {
                    margin-bottom: 10px;
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
                    background: #f2f2f2;
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
                    font-size: 11px;
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
            </style>
        </head>

        <body>
            ${data.map((siswa) => `
            <div class='page'>
                <div class='header'>
                <div class='header-left'>
                    <p><b>Nama</b> : ${siswa.nama_siswa}</p>
                    <p><b>Tanggal</b> : ${siswa.tanggal}</p>
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

                            <td class='check'>${item.nilai == "1" ? "✔" : ''}</td>
                            <td class='check'>${item.nilai == "2" ? "✔" : ''}</td>
                            <td class='check'>${item.nilai == "3" ? "✔" : ''}</td>
                            <td class='check'>${item.nilai == "4" ? "✔" : ''}</td>

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
                            <b>Saevi Maelina Zen, S.Pd.</b><br>
                            NIY : 01072024017
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
                        <b>Eliza Nurhayati, S.Pd.</b><br>
                        NIY : 01022016002
                    </div>
                </div>
            </div>
            `).join("")}
        </body>
    </html>
    `;
}