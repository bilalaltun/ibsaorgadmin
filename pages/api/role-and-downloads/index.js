/**
 * @swagger
 * tags:
 *   - name: RoleAndDownloads
 *     description: Kurallar ve döküman dosyalarının yönetimi
 *
 * /api/role-and-downloads:
 *   get:
 *     summary: Tüm kuralları veya dökümanları listele veya ID ile getir
 *     tags: [RoleAndDownloads]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Getirilecek öğenin ID’si
 *     responses:
 *       200:
 *         description: Başarılı listeleme veya detay getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/RoleDownloadResponse'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/RoleDownloadResponse'
 *
 *   post:
 *     summary: Yeni kural veya döküman ekle
 *     tags: [RoleAndDownloads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleDownloadInput'
 *     responses:
 *       201:
 *         description: Ekleme başarılı
 *
 *   put:
 *     summary: Mevcut dökümanı güncelle
 *     tags: [RoleAndDownloads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek öğenin ID’si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleDownloadInput'
 *     responses:
 *       200:
 *         description: Güncelleme başarılı
 *
 *   delete:
 *     summary: Kural veya dökümanı sil
 *     tags: [RoleAndDownloads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek öğenin ID’si
 *     responses:
 *       200:
 *         description: Silme başarılı
 *
 * components:
 *   schemas:
 *     RoleDownloadInput:
 *       type: object
 *       required:
 *         - title
 *         - type
 *         - file_url
 *       properties:
 *         title:
 *           type: string
 *           example: "Classification Rulebook"
 *         description:
 *           type: string
 *           example: "Blind football kuralları 2025"
 *         type:
 *           type: string
 *           enum: [rule, download]
 *           example: "rule"
 *         file_url:
 *           type: string
 *           format: uri
 *           example: "https://example.com/files/rulebook.pdf"
 *         isactive:
 *           type: boolean
 *           example: true
 *
 *     RoleDownloadResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [rule, download]
 *         file_url:
 *           type: string
 *           format: uri
 *         created_at:
 *           type: string
 *           format: date
 *         isactive:
 *           type: boolean
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const id = req.query.id ? parseInt(req.query.id) : null;

  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    try {
      verifyToken(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  // GET 
  if (req.method === "GET") {
    try {
      let items;
      if (id) {
        items = await db("RoleAndDownloads").where({ id }).first();
      } else {
        items = await db("RoleAndDownloads").orderBy("id", "desc");
      }

      res.status(200).json({ data: items });
    } catch (err) {
      console.error("[GET]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST 
  else if (req.method === "POST") {
    const { title, description, type, file_url, isactive = true } = req.body;

    if (!title || !type || !file_url) {
      return res.status(400).json({ error: "Title, type ve file_url zorunludur." });
    }

    try {
      const [newId] = await db("RoleAndDownloads")
        .insert({
          title,
          description,
          type,
          file_url,
          isactive,
        })
        .returning("id");

      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT - update existing
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gereklidir." });

    const { title, description, type, file_url, isactive } = req.body;

    try {
      await db("RoleAndDownloads")
        .where({ id })
        .update({
          title,
          description,
          type,
          file_url,
          isactive,
        });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE - delete by ID
  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gereklidir." });

    try {
      await db("RoleAndDownloads").where({ id }).del();
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  // unsupported method
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
