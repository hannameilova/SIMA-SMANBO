const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Pengguna belum terautentikasi.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Anda tidak memiliki akses ke fitur ini.",
      });
    }

    next();
  };
};

module.exports = {
  authorize,
};