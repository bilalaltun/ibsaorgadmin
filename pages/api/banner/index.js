/**
 * @swagger
 * tags:
 *   - name: Banner
 *     description: Anasayfa banner görselini yönetme

 * /api/banner:
 *   get:
 *     summary: Mevcut banner görselini getir *
 *     tags: [Banner]
 *     responses:
 *       200:
 *         description: Banner başarıyla getirildi *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bannerImage:
 *                   type: string
 *                   example: "/uploads/banner/banner.jpg"
 *       404:
 *         description: Banner verisi bulunamadı
 *       500:
 *         description: Sunucu hatası

 *   put:
 *     summary: Banner görselini güncelle *
 *     tags: [Banner]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bannerImage
 *             properties:
 *               bannerImage:
 *                 type: string
 *                 example: "/uploads/banner/updated-banner.jpg"
 *     responses:
 *       200:
 *         description: Güncelleme başarılı *
 *       400:
 *         description: Eksik parametre
 *       401:
 *         description: Yetkisiz erişim (token hatalı)
 *       500:
 *         description: Güncelleme sırasında hata oluştu
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const method = req.method;

  // PUT işlemi için token kontrolü
  if (method === "PUT") {
    try {
      await verifyToken(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  // GET: Banner bilgisi al
  if (method === "GET") {
    try {
      const banner = await db("SiteBanner").first();
      if (!banner) {
        return res.status(404).json({ error: "Banner verisi bulunamadı" });
      }

      return res.status(200).json({ bannerImage: banner.bannerImage });
    } catch (err) {
      console.error("[GET /banner]", err);
      return res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // PUT: Banner bilgisi güncelle
  if (method === "PUT") {
    const { bannerImage } = req.body;
    if (!bannerImage) {
      return res.status(400).json({ error: "bannerImage zorunludur." });
    }

    try {
      await db("SiteBanner")
        .update({ bannerImage, updated_at: new Date() })
        .where({ id: 1 });

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /banner]", err);
      return res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // Desteklenmeyen method
  return res.status(405).json({ error: "Method not allowed" });
};

export default withCors(handler);
