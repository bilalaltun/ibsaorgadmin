/**
 * @swagger
 * /api/sitesettings:
 *   get:
 *     summary: Site ayarlarını getir (tekil veya sayfalı liste)
 *     tags: [SiteSettings]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Ayar ID'si (verilirse sadece o kayıt döner)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Sayfa başına kayıt sayısı
 *       - in: query
 *         name: currentPage
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Sayfa numarası
 *     responses:
 *       200:
 *         description: Site ayarları getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/SiteSettings'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SiteSettings'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalPagesCount:
 *                           type: integer
 *                         currentPage:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         currentPageCount:
 *                           type: integer
 *
 *   post:
 *     summary: Yeni site ayarları oluştur
 *     tags: [SiteSettings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SiteSettingsInput'
 *     responses:
 *       201:
 *         description: Site ayarları oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true

 *   put:
 *     summary: Site ayarlarını güncelle
 *     tags: [SiteSettings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek ayar ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SiteSettingsInput'
 *     responses:
 *       200:
 *         description: Site ayarları güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true

 *   delete:
 *     summary: Site ayarlarını sil
 *     tags: [SiteSettings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek ayar ID'si
 *     responses:
 *       200:
 *         description: Ayar silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true

 * components:
 *   schemas:
 *     SiteSettings:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-05-23"
 *         general:
 *           $ref: '#/components/schemas/GeneralSettings'
 *         contact:
 *           $ref: '#/components/schemas/ContactSettings'
 *         theme:
 *           $ref: '#/components/schemas/ThemeSettings'

 *     SiteSettingsInput:
 *       type: object
 *       required: [date, general, contact, theme]
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-05-23"
 *         general:
 *           $ref: '#/components/schemas/GeneralSettings'
 *         contact:
 *           $ref: '#/components/schemas/ContactSettings'
 *         theme:
 *           $ref: '#/components/schemas/ThemeSettings'

 *     GeneralSettings:
 *       type: object
 *       properties:
 *         site_address:
 *           type: string
 *           example: "https://example.com"
 *         site_code:
 *           type: string
 *           example: "EX123"
 *         google_analytics:
 *           type: string
 *           example: "UA-XXXXX-Y"
 *         whatsapp_number:
 *           type: string
 *           example: "+905551112233"

 *     ContactSettings:
 *       type: object
 *       properties:
 *         phone:
 *           type: string
 *           example: "+902122223344"
 *         email:
 *           type: string
 *           example: "info@example.com"

 *     ThemeSettings:
 *       type: object
 *       properties:
 *         logo_img:
 *           type: string
 *           example: "/images/logo.png"
 *         instagram:
 *           type: string
 *           example: "https://instagram.com/example"
 *         facebook:
 *           type: string
 *           example: "https://facebook.com/example"
 *         twitter:
 *           type: string
 *           example: "https://twitter.com/example"
 *         youtube:
 *           type: string
 *           example: "https://youtube.com/example"
 *         linkedin:
 *           type: string
 *           example: "https://linkedin.com/company/example"
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const id = req.query.id ? parseInt(req.query.id) : null;

  // Token 
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    try {
      verifyToken(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  // GET /sitesettings
  if (req.method === "GET") {
    try {
      const pageSize = parseInt(req.query.pageSize) || 10;
      const currentPage = parseInt(req.query.currentPage) || 1;
      const offset = (currentPage - 1) * pageSize;

      let settingsList;

      if (id) {
        settingsList = await db("SiteSettings").where({ id });
      } else {
        settingsList = await db("SiteSettings")
          .orderBy("id", "desc")
          .limit(pageSize)
          .offset(offset);
      }

      if (!settingsList || settingsList.length === 0) {
        return res.status(404).json({ error: "Site ayarları bulunamadı" });
      }

      const results = await Promise.all(
        settingsList.map(async (site) => {
          const [general, contact, theme] = await Promise.all([
            db("GeneralSettings").where({ site_id: site.id }).first(),
            db("ContactSettings").where({ site_id: site.id }).first(),
            db("ThemeSettings").where({ site_id: site.id }).first(),
          ]);

          return {
            id: site.id,
            date: site.date,
            general,
            contact,
            theme,
          };
        })
      );

      const totalCountResult = await db("SiteSettings").count("id as count").first();
      const totalCount = Number(totalCountResult?.count || 0);

      res.status(200).json({
        data: id ? results[0] : results,
        pagination: !id
          ? {
              totalPagesCount: Math.ceil(totalCount / pageSize),
              currentPage,
              pageSize,
              currentPageCount: results.length,
            }
          : undefined,
      });
    } catch (err) {
      console.error("[GET /sitesettings]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST /sitesettings
  else if (req.method === "POST") {
    const { date, general, contact, theme } = req.body;

    try {
      await db.transaction(async (trx) => {
        const inserted = await trx("SiteSettings").insert({ date }).returning("id");
        const siteId = inserted?.[0]?.id || inserted?.[0];

        if (!siteId || typeof siteId !== "number") {
          throw new Error("Site ID alınamadı.");
        }

        await trx("GeneralSettings").insert({ site_id: siteId, ...general });
        await trx("ContactSettings").insert({ site_id: siteId, ...contact });
        await trx("ThemeSettings").insert({ site_id: siteId, ...theme });
      });

      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /sitesettings]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT /sitesettings?id={id}
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    const { date, general, contact, theme } = req.body;

    try {
      await db.transaction(async (trx) => {
        await trx("SiteSettings").where({ id }).update({ date });
        await trx("GeneralSettings").where({ site_id: id }).update(general);
        await trx("ContactSettings").where({ site_id: id }).update(contact);
        await trx("ThemeSettings").where({ site_id: id }).update(theme);
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /sitesettings]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE /sitesettings?id={id}
  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      await db.transaction(async (trx) => {
        await trx("ThemeSettings").where({ site_id: id }).del();
        await trx("ContactSettings").where({ site_id: id }).del();
        await trx("GeneralSettings").where({ site_id: id }).del();
        const deleted = await trx("SiteSettings").where({ id }).del();

        if (deleted === 0) {
          throw new Error("Kayıt bulunamadı veya silinemedi.");
        }
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /sitesettings]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  // Unsupported Method
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
