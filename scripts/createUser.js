const bcrypt = require("bcrypt");
const db = require("../config/database");

async function createUser() {
  const nip = "198001012010011001";
  const nama = "Daud Suwarno, S.Sn., M.Pd.";
  const password = "sima123";
  const role = "Wakasek Sarpras";

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      `
      INSERT INTO users (nip, nama, password_hash, role)
      VALUES (?, ?, ?, ?)
      `,
      [nip, nama, passwordHash, role]
    );

    console.log("Akun berhasil dibuat!");
    console.log("NIP:", nip);
    console.log("Password:", password);
    console.log("Role:", role);
  } catch (error) {
    console.error("Gagal membuat akun:", error.message);
  } finally {
    await db.end();
  }
}

createUser();