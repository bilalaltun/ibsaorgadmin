/**
 * @swagger
 * /api/downloadfile/file:
 *   post:
 *     summary: Kategoriye bağlı yeni dosya ekle
 *     tags: [DownloadFileFile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FileInput'
 *     responses:
 *       201:
 *         description: Dosya başarıyla eklendi
 *
 *   put:
 *     summary: Dosyayı güncelle
 *     tags: [DownloadFileFile]
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
 *               fileurl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dosya güncellendi
 *
 *   delete:
 *     summary: Dosyayı sil
 *     tags: [DownloadFileFile]
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
 *         description: Dosya silindi
 *
 * components:
 *   schemas:
 *     FileInput:
 *       type: object
 *       required:
 *         - category_id
 *         - title
 *         - fileurl
 *       properties:
 *         category_id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "KVKK Aydınlatma Metni"
 *         fileurl:
 *           type: string
 *           example: "https://example.com/kvkk.pdf"
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
    const { category_id, title, fileurl } = req.body;

    if (!category_id || !title || !fileurl) {
      return res.status(400).json({ error: "category_id, title ve fileurl zorunludur" });
    }

    try {
      await db("PageFiles").insert({ category_id, title, fileurl });
      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /file]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  else if (req.method === "PUT") {
    const id = parseInt(req.query.id);
    const { title, fileurl } = req.body;

    if (!id || !title || !fileurl) {
      return res.status(400).json({ error: "id, title ve fileurl zorunludur" });
    }

    try {
      const updated = await db("PageFiles").where({ id }).update({ title, fileurl });
      if (!updated) return res.status(404).json({ error: "Dosya bulunamadı" });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /file]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  else if (req.method === "DELETE") {
    const id = parseInt(req.query.id);

    if (!id) {
      return res.status(400).json({ error: "id zorunludur" });
    }

    try {
      const deleted = await db("PageFiles").where({ id }).del();
      if (!deleted) return res.status(404).json({ error: "Dosya bulunamadı" });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /file]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
