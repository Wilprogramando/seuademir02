const bcrypt = require("bcryptjs");
const { redis, emptyState, validCreds, makeToken, cors } = require("../lib/store");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });
  try {
    let { username, password } = req.body || {};
    const err = validCreds(username, password);
    if (err) return res.status(400).json({ error: err });
    username = username.trim().toLowerCase();

    const existing = await redis.get("user:" + username);
    if (existing) return res.status(409).json({ error: "Esse usuário já existe. Tente outro ou faça login." });

    const hash = bcrypt.hashSync(password, 10);
    await redis.set("user:" + username, { hash, created: new Date().toISOString() });
    await redis.set("data:" + username, emptyState());

    return res.status(200).json({ token: makeToken(username), username });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro no servidor." });
  }
};
