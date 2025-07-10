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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    verifyToken(req);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }

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
};

export default withCors(handler);
