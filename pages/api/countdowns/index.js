/**
 * @swagger
 * tags:
 *   - name: Countdowns
 *     description: Geri sayım yönetimi işlemleri
 *
 * /api/countdowns:
 *   get:
 *     summary: Tüm geri sayımları veya belirli ID ile detayı getir
 *     tags: [Countdowns]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Countdown ID
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Sayfa başına kayıt sayısı 
 *       - in: query
 *         name: currentPage
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Sayfa numarası
 *     responses:
 *       200:
 *         description: Geri sayım(lar) getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/CountdownResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CountdownResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *
 *   post:
 *     summary: Yeni geri sayım oluştur
 *     tags: [Countdowns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CountdownInput'
 *     responses:
 *       201:
 *         description: Geri sayım eklendi
 *
 *   put:
 *     summary: Geri sayımı güncelle
 *     tags: [Countdowns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek geri sayım ID’si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CountdownInput'
 *     responses:
 *       200:
 *         description: Geri sayım güncellendi
 *
 *   delete:
 *     summary: Geri sayımı sil
 *     tags: [Countdowns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek geri sayım ID’si
 *     responses:
 *       200:
 *         description: Geri sayım silindi
 *
 * components:
 *   schemas:
 *     CountdownInput:
 *       type: object
 *       required:
 *         - name
 *         - icon_url
 *         - date
 *         - isactive
 *       properties:
 *         name:
 *           type: string
 *           example: "Paris 2024 Paralympics"
 *         icon_url:
 *           type: string
 *           example: "/icons/paris2024.png"
 *         link:
 *           type: string
 *           example: "https://paris2024.org/"
 *         date:
 *           type: string
 *           example: "2024-08-28"
 *         isactive:
 *           type: boolean
 *           example: true
 *
 *     CountdownResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Paris 2024 Paralympics"
 *         icon_url:
 *           type: string
 *           example: "/icons/paris2024.png"
 *         link:
 *           type: string
 *           example: "https://paris2024.org/"
 *         date:
 *           type: string
 *           example: "2024-08-28"
 *         isactive:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-06-05T12:00:00Z"
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";

const handler = async (req, res) => {
  const { method } = req;
  const id = req.query.id ? parseInt(req.query.id) : null;

  // GET 
  if (method === "GET") {
    try {
      if (id) {
        const countdown = await db("Countdowns").where({ id }).first();
        if (!countdown) return res.status(404).json({ error: "Geri sayım bulunamadı" });
        return res.status(200).json(countdown);
      }

      const pageSize = parseInt(req.query.pageSize) || 10;
      const currentPage = parseInt(req.query.currentPage) || 1;
      const offset = (currentPage - 1) * pageSize;

      const totalCountResult = await db("Countdowns").count("id as count").first();
      const totalCount = Number(totalCountResult?.count || 0);

      const data = await db("Countdowns")
        .orderBy("date", "asc")
        .limit(pageSize)
        .offset(offset);

      return res.status(200).json({
        data,
        pagination: {
          currentPage,
          pageSize,
          total: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      });
    } catch (err) {
      console.error("[GET /countdowns]", err);
      return res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST 
  else if (method === "POST") {
    const { name, icon_url, link, date, isactive } = req.body;

    if (!name || !icon_url || !date || isactive === undefined) {
      return res.status(400).json({ error: "Zorunlu alanlar eksik." });
    }

    try {
      await db("Countdowns").insert({
        name,
        icon_url,
        link,
        date,
        isactive,
        created_at: new Date(),
      });

      return res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /countdowns]", err);
      return res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT 
  else if (method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID parametresi zorunludur." });

    try {
      const item = await db("Countdowns").where({ id }).first();
      if (!item) return res.status(404).json({ error: "Geri sayım bulunamadı" });

      await db("Countdowns").where({ id }).update({
        ...req.body
      });

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /countdowns]", err);
      return res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE 
  else if (method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID parametresi zorunludur." });

    try {
      const exists = await db("Countdowns").where({ id }).first();
      if (!exists) return res.status(404).json({ error: "Geri sayım bulunamadı" });

      await db("Countdowns").where({ id }).del();
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /countdowns]", err);
      return res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  // Diğer 
  else {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withCors(handler);
