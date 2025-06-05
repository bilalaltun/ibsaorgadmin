/**
 * @swagger
 * /api/homepage/about-content:
 *   get:
 *     summary: Hakkımızda içeriğini getirir
 *     tags: [HomepageAboutContent]
 *     responses:
 *       200:
 *         description: Hakkımızda verisi getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *   put:
 *     summary: Hakkımızda içeriğini günceller
 *     tags: [HomepageAboutContent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Güncelleme başarılı
 */

import db from "../../../../lib/db";
import { verifyToken } from "../../../../lib/authMiddleware";
import { withCors } from "../../../../lib/withCors";

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      const content = await db("HomepageAboutContent").first();

      if (!content) return res.status(200).json(null);

      res.status(200).json({
        title: content.title,
        content: content.content,
      });
    } catch (err) {
      console.error("[GET /homepage/about-content]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }

  } else if (req.method === "PUT") {
    try {
      verifyToken(req);

      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: "title ve content alanları zorunludur." });
      }

      await db.transaction(async (trx) => {
        const exists = await trx("HomepageAboutContent").first();

        if (!exists) {
          await trx("HomepageAboutContent").insert({ title, content });
        } else {
          await trx("HomepageAboutContent").update({ title, content });
        }
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /homepage/about-content]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }

  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
