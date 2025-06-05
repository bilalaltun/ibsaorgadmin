/**
 * @swagger
 * /api/homepage/success:
 *   get:
 *     summary: Ana sayfa başarı bölümü verisini getirir
 *     tags:
 *       - Homepage Success
 *     responses:
 *       200:
 *         description: Başarı bölümü verisi döner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 section_key:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     slider_title:
 *                       type: string
 *                       example: Başarılarımız
 *                     main_title:
 *                       type: string
 *                       example: Kalite ve Güven
 *                     description:
 *                       type: string
 *                       example: Açıklama yazısı burada
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           slider_index:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: Örnek Başlık
 *                           description:
 *                             type: string
 *                             example: Örnek açıklama
 *                           image_url:
 *                             type: string
 *                             example: /images/success1.jpg
 *
 *   put:
 *     summary: Başarı bölümü içeriğini günceller
 *     tags:
 *       - Homepage Success
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slider_title
 *               - main_title
 *               - description
 *               - items
 *             properties:
 *               slider_title:
 *                 type: string
 *                 example: Başarılarımız
 *               main_title:
 *                 type: string
 *                 example: Kalite ve Güven
 *               description:
 *                 type: string
 *                 example: Açıklama yazısı burada
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - slider_index
 *                     - title
 *                   properties:
 *                     slider_index:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: Örnek Başlık
 *                     description:
 *                       type: string
 *                       example: Örnek açıklama
 *                     image_url:
 *                       type: string
 *                       example: /images/success1.jpg
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
import { withCors } from "../../../../lib/withCors";

const successHandler = async (req, res) => {
  if (req.method === "GET") {
    try {
      const section = await db("HomepageSuccessSection").first();
      if (!section) return res.status(404).json({ error: "Section bulunamadı" });

      const translation = await db("HomepageSuccessTranslations")
        .where("section_id", section.id)
        .first();

      const items = await db("HomepageSuccessItems")
        .where("section_id", section.id)
        .orderBy("slider_index");

      const data = {
        slider_title: translation?.slider_title || "",
        main_title: translation?.main_title || "",
        description: translation?.description || "",
        items: items.map((item) => ({
          slider_index: item.slider_index,
          title: item.title,
          description: item.description,
          image_url: item.image_url,
        })),
      };

      res.status(200).json({ section_key: section.section_key, data });
    } catch (error) {
      console.error("GET /api/homepage/success", error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  else if (req.method === "PUT") {
    try {
      const { slider_title, main_title, description, items } = req.body;

      const section = await db("HomepageSuccessSection")
        .where({ section_key: "success" })
        .first();

      if (!section) {
        return res.status(404).json({ error: "Section bulunamadı" });
      }

      const exists = await db("HomepageSuccessTranslations")
        .where({ section_id: section.id })
        .first();

      if (exists) {
        await db("HomepageSuccessTranslations")
          .where({ section_id: section.id })
          .update({ slider_title, main_title, description });
      } else {
        await db("HomepageSuccessTranslations").insert({
          section_id: section.id,
          slider_title,
          main_title,
          description,
        });
      }

      await db("HomepageSuccessItems").where({ section_id: section.id }).del();

      if (Array.isArray(items)) {
        for (const item of items) {
          await db("HomepageSuccessItems").insert({
            section_id: section.id,
            slider_index: item.slider_index,
            title: item.title,
            description: item.description,
            image_url: item.image_url,
          });
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("PUT /api/homepage/success", error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  else {
    res.status(405).json({ error: "Yalnızca GET ve PUT istekleri desteklenir." });
  }
};

export default withCors(successHandler);
