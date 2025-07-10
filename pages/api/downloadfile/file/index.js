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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    verifyToken(req);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }

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
};

export default withCors(handler);
