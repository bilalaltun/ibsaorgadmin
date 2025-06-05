// pages/api/test.js
import knex from 'knex';
import config from '../../knexfile.js'; // 

const db = knex(config);

export default async function handler(req, res) {
  try {
    const result = await db.raw('SELECT GETDATE() as now');
    res.status(200).json({ success: true, time: result[0] });
  } catch (err) {
    console.error("Bağlantı hatası:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}
