const errCode = {
  '10000': 'internal server error',
  '70001': 'id harus terisi',
  '70002': 'nama kelas harus terisi',
  '70003': 'id wali kelas harus terisi',
  '70004': 'email login sudah terdaftar',
  '70005': 'username dan password salah',
  '70006': 'access token tidak tervalidasi',
  '70007': 'nama tingkatan kelas harus terisi',
  '70008': 'data tidak ditemukan',
  '70009': 'tingkatan kelas harus terisi',
  '70010': 'gagal membuat jurnal mengajar',
  '70011': 'payload tidak sesuai',
  '70012': 'minimal 1 data absensi dilakukan',
  '70013': 'tanggal pencarian harus terisi semua',
  '70014': `Tanggal 'dari' tidak boleh lebih besar dari tanggal 'sampai'`,
  '70015': `password lama anda tidak sesuai`,
  '70016': `id access harus terisi`,
  '70017': `email harus terisi`
};

module.exports = errCode;