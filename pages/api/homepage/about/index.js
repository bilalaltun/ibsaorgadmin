/**
 * @swagger
 * /api/homepage/about:
 *   get:
 *     summary: Anasayfa Hakkımızda verisini getir
 *     tags: [HomepageAbout]
 *     responses:
 *       200:
 *         description: Hakkımızda verisi getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Hakkımızda"
 *                 title:
 *                   type: string
 *                   example: "Biz Kimiz?"
 *                 description:
 *                   type: string
 *                   example: "Firmamızın kısa tanıtımı burada yer alır."
 *                 isactive:
 *                   type: boolean
 *                   example: true
 *
 *   put:
 *     summary: Anasayfa Hakkımızda verisini güncelle
 *     tags: [HomepageAbout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Hakkımızda"
 *               title:
 *                 type: string
 *                 example: "Biz Kimiz?"
 *               description:
 *                 type: string
 *                 example: "Firmamızın kısa tanıtımı burada yer alır."
 *               isactive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Hakkımızda verisi güncellendi
 */

import db from "../../../../lib/db";
import { verifyToken } from "../../../../lib/authMiddleware";
import { withCors } from "../../../../lib/withCors";

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      const section = await db("HomepageAboutSection").first();
      if (!section) return res.status(200).json(null);

      res.status(200).json({
        id: section.id,
        name: section.name,
        title: section.title,
        description: section.description,
        isactive: section.isactive,
      });
    } catch (err) {
      console.error("[GET /homepage/about]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  else if (req.method === "PUT") {
    try {
      verifyToken(req);

      const { name, title, description, isactive } = req.body;

      if (!name || !title || !description) {
        return res.status(400).json({ error: "name, title ve description zorunludur." });
      }

      await db.transaction(async (trx) => {
        let section = await trx("HomepageAboutSection").first();

        if (!section) {
          await trx("HomepageAboutSection").insert({
            name,
            title,
            description,
            isactive: isactive ?? true,
          });
        } else {
          await trx("HomepageAboutSection").update({
            name,
            title,
            description,
            isactive: isactive ?? true,
          });
        }
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /homepage/about]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
