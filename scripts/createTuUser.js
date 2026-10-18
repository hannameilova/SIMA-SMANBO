const bcrypt = require("bcrypt");
const db = require("../config/database");

async function createTuUser() {
  const nip = "198001012010011002";
  const nama = "Pengguna TU";
  const password = "tu123";
  const role = "Tata Usaha";

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      `
      INSERT INTO users (nip, nama, password_hash, role)
      VALUES (?, ?, ?, ?)
      `,
      [nip, nama, passwordHash, role]
    );

    console.log("Akun TU berhasil dibuat!");
    console.log("NIP:", nip);
    console.log("Password:", password);
    console.log("Role:", role);
  } catch (error) {
    console.error("Gagal membuat akun TU:", error.message);
  } finally {
    await db.end();
  }
}

createTuUser();