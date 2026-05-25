const bcrypt = require("bcryptjs");
const { redis, makeToken, cors } = require("../lib/store");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });
  try {
    let { username, password } = req.body || {};
    if (typeof username !== "string" || typeof password !== "string") return res.status(400).json({ error: "Dados inválidos." });
    username = username.trim().toLowerCase();

    const user = await redis.get("user:" + username);
    if (!user || !bcrypt.compareSync(password, user.hash)) {
      return res.status(401).json({ error: "Usuário ou senha incorretos." });
    }
    return res.status(200).json({ token: makeToken(username), username });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro no servidor." });
  }
};
