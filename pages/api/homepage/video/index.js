/**
 * @swagger
 * /api/homepage/video:
 *   get:
 *     summary: Video alanı verilerini getir
 *     tags: [HomepageVideo]
 *     responses:
 *       200:
 *         description: Başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: Tanıtım Videosu
 *                 youtube_link:
 *                   type: string
 *                   example: https://www.youtube.com/watch?v=example
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       before:
 *                         type: string
 *                         example: %25
 *                       text:
 *                         type: string
 *                         example: Daha verimli
 *
 *   put:
 *     summary: Video alanı verilerini güncelle
 *     tags: [HomepageVideo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - youtube_link
 *               - items
 *             properties:
 *               title:
 *                 type: string
 *                 example: Tanıtım Videosu
 *               youtube_link:
 *                 type: string
 *                 example: https://www.youtube.com/watch?v=example
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - before
 *                     - text
 *                   properties:
 *                     before:
 *                       type: string
 *                       example: %25
 *                     text:
 *                       type: string
 *                       example: Daha verimli
 */

import db from "../../../../lib/db";
import { withCors } from "../../../../lib/withCors";
import { verifyToken } from "../../../../lib/authMiddleware";

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      const section = await db("HomepageVideoSection").first();
      if (!section) return res.status(200).json(null);

      const translation = await db("HomepageVideoTranslations")
        .where({ video_id: section.id })
        .first();

      const items = await db("HomepageVideoItems")
        .where({ video_id: section.id });

      res.status(200).json({
        title: translation?.title || "",
        youtube_link: translation?.youtube_link || "",
        items: items.map(i => ({
          before: i.before,
          text: i.text,
        })),
      });
    } catch (err) {
      console.error("[GET /homepage/video]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  else if (req.method === "PUT") {
    try {
      verifyToken(req);

      const { title, youtube_link, items } = req.body;

      if (!title || !youtube_link || !Array.isArray(items)) {
        return res.status(400).json({ error: "title, youtube_link ve items zorunludur" });
      }

      await db.transaction(async (trx) => {
        let section = await trx("HomepageVideoSection").first();

        if (!section) {
          const inserted = await trx("HomepageVideoSection")
            .insert({ section_key: "video" })
            .returning("id");

          section = { id: inserted[0]?.id || inserted[0] };
        }

        await trx("HomepageVideoTranslations").where({ video_id: section.id }).del();
        await trx("HomepageVideoItems").where({ video_id: section.id }).del();

        await trx("HomepageVideoTranslations").insert({
          video_id: section.id,
          title,
          youtube_link,
        });

        for (const i of items) {
          await trx("HomepageVideoItems").insert({
            video_id: section.id,
            before: i.before,
            text: i.text,
          });
        }
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /homepage/video]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
