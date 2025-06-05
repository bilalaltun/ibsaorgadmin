/**
 * @swagger
 * /api/homepage/facilities:
 *   get:
 *     summary: Tesis bilgilerini getirir
 *     tags: [HomepageFacilities]
 *     responses:
 *       200:
 *         description: Başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 facilities:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Tesislerimiz"
 *                     subtitle:
 *                       type: string
 *                       example: "Tesis altyapımız"
 *                     button:
 *                       type: string
 *                       example: "İncele"
 *                     button_link:
 *                       type: string
 *                       example: "/tesisler"
 *                     image:
 *                       type: string
 *                       example: "/images/facilities.jpg"
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Makine Parkuru"
 *                           description:
 *                             type: string
 *                             example: "Yüksek teknolojili makinelerimiz bulunmaktadır."
 *
 *   put:
 *     summary: Tesis bilgilerini günceller
 *     tags: [HomepageFacilities]
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
 *                 example: "Tesislerimiz"
 *               subtitle:
 *                 type: string
 *                 example: "Altyapı bilgileri"
 *               button:
 *                 type: string
 *                 example: "Detaylar"
 *               button_link:
 *                 type: string
 *                 example: "/tesisler"
 *               image:
 *                 type: string
 *                 example: "/images/tesislerv2.jpg"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Otomasyon"
 *                     description:
 *                       type: string
 *                       example: "Üretim otomasyon sistemleri açıklaması"
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
      const section = await db("HomepageFacilitiesSection").first();
      if (!section) return res.status(200).json(null);

      const sectionData = await db("HomepageFacilitiesSingle").where({ facilities_id: section.id }).first();
      const items = await db("HomepageFacilitiesItemsSingle").where({ facilities_id: section.id });

      res.status(200).json({
        facilities: {
          title: sectionData?.title || "",
          subtitle: sectionData?.subtitle || "",
          button: sectionData?.button || "",
          button_link: sectionData?.button_link || "",
          image: sectionData?.image || "",
          items: items.map(i => ({
            title: i.title,
            description: i.description,
          })),
        },
      });
    } catch (err) {
      console.error("[GET /homepage/facilities]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  else if (req.method === "PUT") {
    try {
      verifyToken(req);
      const { title, subtitle, button, button_link, image, items = [] } = req.body;

      if (!title || !subtitle || !button || !button_link) {
        return res.status(400).json({ error: "Zorunlu alanlar eksik." });
      }

      await db.transaction(async (trx) => {
        let section = await trx("HomepageFacilitiesSection").first();
        if (!section) {
          const inserted = await trx("HomepageFacilitiesSection")
            .insert({ section_key: "facilities" })
            .returning("id");
          section = { id: inserted[0]?.id || inserted[0] };
        }

        await trx("HomepageFacilitiesSingle").where({ facilities_id: section.id }).del();
        await trx("HomepageFacilitiesItemsSingle").where({ facilities_id: section.id }).del();

        await trx("HomepageFacilitiesSingle").insert({
          facilities_id: section.id,
          title,
          subtitle,
          button,
          button_link,
          image,
        });

        for (const item of items) {
          if (item.title && item.description) {
            await trx("HomepageFacilitiesItemsSingle").insert({
              facilities_id: section.id,
              title: item.title,
              description: item.description,
            });
          }
        }
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /homepage/facilities]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);


