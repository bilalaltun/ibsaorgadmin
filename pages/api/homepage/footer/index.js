/**
 * @swagger
 * /api/homepage/footer:
 *   get:
 *     summary: Footer verilerini getirir
 *     tags: [HomepageFooter]
 *     responses:
 *       200:
 *         description: Footer verileri getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contactTitle:
 *                   type: string
 *                   example: "Bize Ulaşın"
 *                 email:
 *                   type: string
 *                   example: "info@ornek.com"
 *                 logo_slogan:
 *                   type: string
 *                   example: "Kalite ve Güven"
 *                 address_title:
 *                   type: string
 *                   example: "Adresimiz"
 *                 address_link:
 *                   type: string
 *                   example: "https://goo.gl/maps/ornekadres"
 *                 phone:
 *                   type: string
 *                   example: "+90 212 123 45 67"
 *                 gallery:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "/images/footer/gallery1.jpg"

 *   put:
 *     summary: Footer verilerini günceller
 *     tags: [HomepageFooter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contactTitle
 *               - email
 *               - logo_slogan
 *               - address_title
 *               - address_link
 *               - phone
 *               - gallery
 *             properties:
 *               contactTitle:
 *                 type: string
 *                 example: "İletişime Geçin"
 *               email:
 *                 type: string
 *                 example: "iletisim@ornek.com"
 *               logo_slogan:
 *                 type: string
 *                 example: "Müşteri Odaklı Hizmet"
 *               address_title:
 *                 type: string
 *                 example: "Şirket Adresi"
 *               address_link:
 *                 type: string
 *                 example: "https://maps.google.com/örnek"
 *               phone:
 *                 type: string
 *                 example: "+90 532 765 43 21"
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "/images/footer/galeri2.jpg"
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
      const section = await db("HomepageFooterSection").first();
      if (!section) return res.status(200).json(null);

      const content = await db("HomepageFooterTranslations")
        .where({ footer_id: section.id })
        .first();

      const gallery = await db("HomepageFooterGallery")
        .where({ footer_id: section.id });

      res.status(200).json({
        footer: {
          contactTitle: content?.contact_title || "",
          email: content?.email || "",
          logo_slogan: content?.logo_slogan || "",
          address_title: content?.address_title || "",
          address_link: content?.address_link || "",
          phone: content?.phone || "",
        },
        gallery: gallery.map(g => g.image_url)
      });
    } catch (err) {
      console.error("[GET /homepage/footer]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  else if (req.method === "PUT") {
    try {
      verifyToken(req);

      const {
        contactTitle,
        email,
        logo_slogan,
        address_title,
        address_link,
        phone,
        gallery
      } = req.body;

      await db.transaction(async (trx) => {
        let section = await trx("HomepageFooterSection").first();

        if (!section) {
          const inserted = await trx("HomepageFooterSection")
            .insert({ section_key: "footer" })
            .returning("id");
          section = { id: inserted[0]?.id || inserted[0] };
        }

        await trx("HomepageFooterTranslations").where({ footer_id: section.id }).del();
        await trx("HomepageFooterGallery").where({ footer_id: section.id }).del();

        await trx("HomepageFooterTranslations").insert({
          footer_id: section.id,
          contact_title: contactTitle,
          email,
          logo_slogan,
          address_title,
          address_link,
          phone
        });

        if (Array.isArray(gallery)) {
          const limited = gallery.slice(0, 6);
          for (const img of limited) {
            await trx("HomepageFooterGallery").insert({
              footer_id: section.id,
              image_url: img,
            });
          }
        }
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /homepage/footer]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
