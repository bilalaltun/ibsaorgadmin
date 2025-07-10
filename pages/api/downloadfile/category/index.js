/**
 * @swagger
 * /api/downloadfile/category:
 *   post:
 *     summary: Sayfaya bağlı yeni kategori oluştur
 *     tags: [DownloadFileCategory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Kategori başarıyla eklendi
 *
 *   put:
 *     summary: Kategoriyi güncelle
 *     tags: [DownloadFileCategory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kategori güncellendi
 *
 *   delete:
 *     summary: Kategoriyi sil
 *     tags: [DownloadFileCategory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kategori silindi
 *
 * components:
 *   schemas:
 *     CategoryInput:
 *       type: object
 *       required:
 *         - page_id
 *         - title
 *       properties:
 *         page_id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: KVKK Belgeleri
 */

import db from "../../../../lib/db";
import { withCors } from "../../../../lib/withCors";
import { verifyToken } from "../../../../lib/authMiddleware";

const handler = async (req, res) => {
  try {
    verifyToken(req);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }

  if (req.method === "POST") {
    const { page_id, title } = req.body;

    if (!page_id || !title) {
      return res.status(400).json({ error: "page_id ve title zorunludur" });
    }

    try {
      await db("PageCategories").insert({ page_id, title });
      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /category]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  else if (req.method === "PUT") {
    const id = parseInt(req.query.id);
    const { title } = req.body;

    if (!id || !title) {
      return res.status(400).json({ error: "id ve title zorunludur" });
    }

    try {
      const updated = await db("PageCategories").where({ id }).update({ title });
      if (!updated) return res.status(404).json({ error: "Kategori bulunamadı" });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /category]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  else if (req.method === "DELETE") {
    const id = parseInt(req.query.id);

    if (!id) {
      return res.status(400).json({ error: "id zorunludur" });
    }

    try {
      const deleted = await db("PageCategories").where({ id }).del();
      if (!deleted) return res.status(404).json({ error: "Kategori bulunamadı" });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /category]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
