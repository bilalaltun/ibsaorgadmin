// lib/db.js
import knex from "knex";
import config from "../knexfile.js";

let db;

if (!global.knexInstance) {
  db = knex(config.development);
  global.knexInstance = db;
  console.log("🔗 Yeni Knex bağlantısı kuruldu.");
} else {
  db = global.knexInstance;
  console.log("♻️ Var olan Knex bağlantısı kullanıldı.");
}

setInterval(
  async () => {
    try {
      await db.raw("SELECT 1");
    } catch (err) {
      console.error("❌ Keep-alive ping hatası:", err);
    }
  },
  1000 * 60 * 1
);

export default db;
