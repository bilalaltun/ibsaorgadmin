/**
 * @swagger
 * /api/homepage/experience-two:
 *   get:
 *     summary: Anasayfa Deneyim Alanı verisini getir
 *     tags: [HomepageExperienceTwo]
 *     responses:
 *       200:
 *         description: Deneyim verisi getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 globalTitle:
 *                   type: string
 *                 globalSubtitle:
 *                   type: string
 *                 yearsExperience:
 *                   type: string
 *                 exportCountries:
 *                   type: string
 *                 videolink:
 *                   type: string
 *   put:
 *     summary: Anasayfa Deneyim Alanı verisini güncelle
 *     tags: [HomepageExperienceTwo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - globalTitle
 *               - globalSubtitle
 *               - yearsExperience
 *               - exportCountries
 *               - videolink
 *             properties:
 *               globalTitle:
 *                 type: string
 *               globalSubtitle:
 *                 type: string
 *               yearsExperience:
 *                 type: string
 *               exportCountries:
 *                 type: string
 *               videolink:
 *                 type: string
 *     responses:
 *       200:
 *         description: Deneyim alanı güncellendi
 */


import db from "../../../../lib/db";
import { verifyToken } from "../../../../lib/authMiddleware";
import { withCors } from "../../../../lib/withCors";

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      const data = await db("HomepageExperienceTwo").first();
      if (!data) return res.status(200).json(null);

      res.status(200).json({
        globalTitle: data.global_title,
        globalSubtitle: data.global_subtitle,
        yearsExperience: data.years_experience,
        exportCountries: data.export_countries,
        videolink: data.videolink,
      });
    } catch (err) {
      console.error("[GET /homepage/experience-two]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }

  } else if (req.method === "PUT") {
    try {
      verifyToken(req);

      const {
        globalTitle,
        globalSubtitle,
        yearsExperience,
        exportCountries,
        videolink,
      } = req.body;

      if (
        !globalTitle ||
        !globalSubtitle ||
        !yearsExperience ||
        !exportCountries ||
        !videolink
      ) {
        return res.status(400).json({ error: "Tüm alanlar zorunludur." });
      }

      await db.transaction(async (trx) => {
        const existing = await trx("HomepageExperienceTwo").first();

        if (existing) {
          await trx("HomepageExperienceTwo")
            .update({
              global_title: globalTitle,
              global_subtitle: globalSubtitle,
              years_experience: yearsExperience,
              export_countries: exportCountries,
              videolink,
            })
            .where({ id: existing.id });
        } else {
          await trx("HomepageExperienceTwo").insert({
            section_key: "experienceTwo",
            global_title: globalTitle,
            global_subtitle: globalSubtitle,
            years_experience: yearsExperience,
            export_countries: exportCountries,
            videolink,
          });
        }
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /homepage/experience-two]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }

  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
