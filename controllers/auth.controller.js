const authService = require("../services/auth.service");

const login = async (req, res) => {
  try {
    const { nip, password } = req.body;

    const result = await authService.login(nip, password);

    res.status(200).json({
      message: "Login berhasil.",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    if (error.message === "NIP atau password salah.") {
      return res.status(401).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
};

const getMe = (req, res) => {
  res.status(200).json({
    message: "Token valid.",
    user: req.user,
  });
};

module.exports = {
  login,
  getMe,
};