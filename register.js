const { authUser, cors } = require("../lib/store");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  const username = authUser(req);
  if (!username) return res.status(401).json({ error: "Não autenticado." });
  return res.status(200).json({ username });
};
