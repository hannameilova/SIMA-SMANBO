const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

const login = async (nip, password) => {
  const [users] = await db.query(
    "SELECT * FROM users WHERE nip = ? AND is_active = 1",
    [nip]
  );

  if (users.length === 0) {
    throw new Error("NIP atau password salah.");
  }

  const user = users[0];

  const passwordMatch = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatch) {
    throw new Error("NIP atau password salah.");
  }

  const token = jwt.sign(
    {
      id: user.id,
      nip: user.nip,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      nip: user.nip,
      nama: user.nama,
      role: user.role,
    },
  };
};

module.exports = {
  login,
};