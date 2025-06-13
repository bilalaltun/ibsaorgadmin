/**
 * @swagger
 * tags:
 *   - name: Regions
 *     description: Sadece bölge (region) yönetimi işlemleri
 *
 * /api/regions:
 *   get:
 *     summary: Tüm bölgeleri listele veya tek bir bölge getir
 *     tags: [Regions]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: Bölge ID'si (verilirse sadece o bölge döner)
 *     responses:
 *       200:
 *         description: Bölge(ler) başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Region'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Region'
 *
 *   post:
 *     summary: Yeni bölge oluştur
 *     tags: [Regions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegionInput'
 *     responses:
 *       201:
 *         description: Bölge başarıyla oluşturuldu
 *
 *   put:
 *     summary: Bölge bilgilerini güncelle
 *     tags: [Regions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek bölgenin ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegionInput'
 *     responses:
 *       200:
 *         description: Güncelleme başarılı
 *
 *   delete:
 *     summary: Bölgeyi sil
 *     tags: [Regions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek bölge ID'si
 *     responses:
 *       200:
 *         description: Silme işlemi başarılı
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Region:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Asia"
 *         title:
 *           type: string
 *           example: "Asia Region"
 *
 *     RegionInput:
 *       type: object
 *       required:
 *         - name
 *         - title
 *       properties:
 *         name:
 *           type: string
 *           example: "Asia"
 *         title:
 *           type: string
 *           example: "Asia Region"
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const { method } = req;
  const id = req.query.id ? parseInt(req.query.id) : null;

  if (["POST", "PUT", "DELETE"].includes(method)) {
    try {
      await verifyToken(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  // GET: Tüm bölgeler veya tekil bölge
  if (method === "GET") {
    try {
      if (id) {
        const region = await db("Regions").where({ id }).first();
        if (!region) return res.status(404).json({ error: "Bölge bulunamadı" });
        return res.status(200).json(region);
      }

      const regions = await db("Regions").orderBy("id", "asc");
      return res.status(200).json({ data: regions });
    } catch (err) {
      return res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST: Yeni bölge oluştur
  if (method === "POST") {
    const { name, title } = req.body;

    if (!name || !title) {
      return res.status(400).json({ error: "name ve title zorunludur" });
    }

    try {
      await db("Regions").insert({ name, title });
      return res.status(201).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT: Bölge güncelle
if (method === "PUT") {
  const { name, title } = req.body;
  if (!id) return res.status(400).json({ error: "ID zorunludur" });

  if (!name || !title) {
    return res.status(400).json({ error: "name ve title zorunludur" });
  }

  try {
    const existing = await db("Regions").where({ id }).first();
    if (!existing) {
      return res.status(404).json({ error: "Güncellenecek bölge bulunamadı" });
    }

    await db("Regions").where({ id }).update({ name, title });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "PUT failed", details: err.message });
  }
}

  // DELETE: Bölge sil
  if (method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID zorunludur" });

    try {
      await db("Regions").where({ id }).del();
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  return res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]).status(405).end();
};

export default withCors(handler);
