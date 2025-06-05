/**
 * @swagger
 * /api/homepage/history:
 *   get:
 *     summary: Ana sayfa tarihçe bölümünü getirir
 *     tags:
 *       - Homepage History
 *     responses:
 *       200:
 *         description: Tarihçe verisi döner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 section_key:
 *                   type: string
 *                   example: history
 *                 top_title:
 *                   type: string
 *                   example: HİKAYEMİZ
 *                 main_title:
 *                   type: string
 *                   example: Şirket Tarihçesi
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       item_index:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: Bursa Organize Sanayi Üretim Tesisi
 *                       history:
 *                         type: string
 *                         example: Firma açıklaması buraya gelecek.
 *                       image_url:
 *                         type: string
 *                         example: /images/history/1.jpg
 *
 *   put:
 *     summary: Ana sayfa tarihçe bölümünü günceller
 *     tags:
 *       - Homepage History
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - section_key
 *               - top_title
 *               - main_title
 *               - items
 *             properties:
 *               section_key:
 *                 type: string
 *                 example: history
 *               top_title:
 *                 type: string
 *                 example: HİKAYEMİZ
 *               main_title:
 *                 type: string
 *                 example: Şirket Tarihçesi
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - item_index
 *                     - title
 *                     - history
 *                     - image_url
 *                   properties:
 *                     item_index:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: Bursa Organize Sanayi Üretim Tesisi
 *                     history:
 *                       type: string
 *                       example: Üretim ve hizmet açıklaması...
 *                     image_url:
 *                       type: string
 *                       example: /images/history/1.jpg
 *     responses:
 *       200:
 *         description: Güncelleme başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 */

import db from "../../../../lib/db";
import { verifyToken } from "../../../../lib/authMiddleware";
import { withCors } from "../../../../lib/withCors";

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      const section = await db("HomepageHistorySection").first();
      if (!section) return res.status(404).json({ error: "Tarihçe bölümü bulunamadı" });

      const translation = await db("HomepageHistoryTranslations")
        .where({ section_id: section.id })
        .first();

      const items = await db("HomepageHistoryItems")
        .where({ section_id: section.id })
        .orderBy("item_index", "asc");

      const response = {
        section_key: section.section_key,
        top_title: translation?.top_title || "",
        main_title: translation?.main_title || "",
        items: items.map(i => ({
          item_index: i.item_index,
          title: i.title,
          history: i.history,
          image_url: i.image_url
        }))
      };

      res.status(200).json(response);
    } catch (err) {
      console.error("[GET /homepage/history]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  else if (req.method === "PUT") {
    try {
      verifyToken(req);

      const { section_key, top_title, main_title, items } = req.body;

      if (!section_key || !top_title || !main_title || !Array.isArray(items)) {
        return res.status(400).json({ error: "Eksik veya hatalı veri" });
      }

      let section = await db("HomepageHistorySection").where({ section_key }).first();
      if (!section) {
        const inserted = await db("HomepageHistorySection")
          .insert({ section_key })
          .returning("id");

        section = { id: inserted[0]?.id || inserted[0] };
      }

      await db("HomepageHistoryTranslations")
        .where({ section_id: section.id })
        .del();

      await db("HomepageHistoryTranslations").insert({
        section_id: section.id,
        lang_code: "tr",
        top_title,
        main_title,
      });

      await db("HomepageHistoryItems")
        .where({ section_id: section.id })
        .del();

      for (const item of items) {
        await db("HomepageHistoryItems").insert({
          section_id: section.id,
          lang_code: "tr",
          item_index: item.item_index,
          title: item.title,
          history: item.history,
          image_url: item.image_url,
        });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /homepage/history]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  else {
    res.status(405).json({ error: "Yalnızca GET ve PUT desteklenir" });
  }
};

export default withCors(handler);
