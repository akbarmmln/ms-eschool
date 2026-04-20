'use strict';

exports.createPinEmail = async function (data) {
  return `
          <!DOCTYPE html>
          <html lang="id">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>OTP Email</title>
            </head>

            <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:8px;padding:30px;">
                      <tr>
                        <td style="font-size:20px;font-weight:bold;color:#333;">
                          Hai ${data.nama ?? ''}
                        </td>
                      </tr>

                      <tr>
                        <td height="20"></td>
                      </tr>

                      <tr>
                        <td style="font-size:14px;color:#666;line-height:1.6;">
                          Ini adalah email otomatis yang dikirimkan kepada Anda dalam pembuatan password login yang diperlukan untuk mengakses akun Anda.
                        </td>
                      </tr>

                      <tr>
                        <td height="20"></td>
                      </tr>

                      <tr>
                        <td align="center" style="font-size:16px;color:#555;">
                          Password login Anda adalah:
                        </td>
                      </tr>

                      <tr>
                        <td height="10"></td>
                      </tr>

                      <tr>
                        <td align="center">
                          <div style="
                            display:inline-block;
                            padding:12px 24px;
                            background:#f0f0f0;
                            border-radius:8px;
                            font-size:24px;
                            font-weight:bold;
                            letter-spacing:4px;
                            color:#333;
                            font-family:monospace;">
                            ${data.pin}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td height="20"></td>
                      </tr>

                      <!-- Warning -->
                      <tr>
                        <td style="font-size:13px;color:#666;line-height:1.6;">
                          Mohon untuk tidak memberikan informasi ini kepada siapapun dan dengan segera untuk melakukan perubahan password.
                        </td>
                      </tr>

                      <tr>
                        <td height="20"></td>
                      </tr>

                      <tr>
                        <td style="border-top:1px solid #eee;"></td>
                      </tr>

                      <tr>
                        <td height="20"></td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="font-size:14px;color:#333;">
                          Salam,<br>
                          <strong>Tim Development</strong>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
  `
}

exports.forgetPasswordEmail = async function (data) {
  return `
          <!DOCTYPE html>
          <html lang="id">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>OTP Email</title>
            </head>

            <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:8px;padding:30px;">
                      <tr>
                        <td style="font-size:14px;color:#666;line-height:1.6;">
                          Kami menerima adanya permintaan perubahan kata sandi pada akun <span style="color:#0d6efd;">${data.email}</span>. Gunakan kode OTP ini untuk melanjutkan proses.
                        </td>
                      </tr>

                      <tr>
                        <td height="20"></td>
                      </tr>

                      <tr>
                        <td align="center" style="font-size:16px;color:#555;">
                          Kode OTP Anda adalah:
                        </td>
                      </tr>

                      <tr>
                        <td height="10"></td>
                      </tr>

                      <tr>
                        <td align="center">
                          <div style="
                            display:inline-block;
                            padding:12px 24px;
                            background:#f0f0f0;
                            border-radius:8px;
                            font-size:24px;
                            font-weight:bold;
                            letter-spacing:4px;
                            color:#333;
                            font-family:monospace;">
                            ${data.otp}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td height="20"></td>
                      </tr>

                      <tr>
                        <td style="font-size:13px;color:#666;padding-bottom:10px;">
                          Kode OTP berlaku selama 3 menit sejak email ini dikirimkan.
                        </td>
                      </tr>
                      <!-- Warning -->
                      <tr>
                        <td style="font-size:13px;color:#666;">
                          Mohon untuk tidak memberikan informasi ini kepada siapapun.
                        </td>
                      </tr>

                      <tr>
                        <td height="20"></td>
                      </tr>

                      <tr>
                        <td style="border-top:1px solid #eee;"></td>
                      </tr>

                      <tr>
                        <td height="20"></td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="font-size:14px;color:#333;">
                          Salam,<br>
                          <strong>Tim Development</strong>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
  `
}