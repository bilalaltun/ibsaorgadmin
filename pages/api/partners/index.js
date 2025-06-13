/**
 * @swagger
 * tags:
 *   - name: Partners
 *     description: İş ortakları işlemleri
 *
 * /api/partners:
 *   get:
 *     summary: Partnerleri getir (liste veya ID ile detay)
 *     tags: [Partners]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Partner ID'si (verilirse sadece o partner döner)
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Sayfa başına kayıt sayısı
 *       - in: query
 *         name: currentPage
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Sayfa numarası
 *     responses:
 *       200:
 *         description: Partner(ler) getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/PartnerResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PartnerResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         total:
 *                           type: integer
 *                           example: 25
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *
 *   post:
 *     summary: Yeni partner ekle
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PartnerInput'
 *     responses:
 *       201:
 *         description: Partner eklendi
 *
 *   put:
 *     summary: Partner güncelle
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek partner ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PartnerInput'
 *     responses:
 *       200:
 *         description: Partner güncellendi
 *
 *   delete:
 *     summary: Partner sil
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek partner ID'si
 *     responses:
 *       200:
 *         description: Partner silindi
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     PartnerInput:
 *       type: object
 *       required:
 *         - title
 *         - isactive
 *       properties:
 *         title:
 *           type: string
 *           example: "Turkish Airlines"
 *         url:
 *           type: string
 *           example: "https://www.turkishairlines.com"
 *         isactive:
 *           type: boolean
 *           example: true
 *
 *     PartnerResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "Turkish Airlines"
 *         url:
 *           type: string
 *           example: "https://www.turkishairlines.com"
 *         isactive:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-06-05T08:00:00Z"
 */


import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const id = req.query.id ? parseInt(req.query.id) : null;

if (["POST", "PUT", "DELETE"].includes(req.method)) {
  try {
    verifyToken(req); 
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
}

  // Authentication kontrolü sadece POST, PUT, DELETE için gerekli
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    try {
      verifyToken(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  // GET -
  if (req.method === "GET") {
    try {
      const { pageSize = 10, currentPage = 1 } = req.query;
      const pageInt = parseInt(pageSize);
      const currentPageInt = parseInt(currentPage);

      if (id) {
        const partner = await db("Partners").where({ id }).first();
        if (!partner) return res.status(404).json({ error: "Partner bulunamadı" });
        return res.status(200).json(partner);
      }

      const total = await db("Partners").count("* as count").first();
      const totalCount = total?.count || 0;
      const totalPages = Math.ceil(totalCount / pageInt);

      const partners = await db("Partners")
        .orderBy("id", "desc")
        .limit(pageInt)
        .offset((currentPageInt - 1) * pageInt);

      return res.status(200).json({
        data: partners,
        pagination: {
          pageSize: pageInt,
          currentPage: currentPageInt,
          total: totalCount,
          totalPages,
        },
      });
    } catch (err) {
      console.error("[GET /partners]", err);
      return res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST 
  else if (req.method === "POST") {
    const { title, url, isactive } = req.body;

    try {
      await db("Partners").insert({
        title,
        url,
        isactive,
        created_at: new Date(),
      });
      return res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /partners]", err);
      return res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT 
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    const { title, url, isactive } = req.body;

    try {
      const updated = await db("Partners")
        .where({ id })
        .update({
          title,
          url,
          isactive,
        });

      if (!updated) return res.status(404).json({ error: "Partner bulunamadı" });

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /partners]", err);
      return res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE 
  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      const deleted = await db("Partners").where({ id }).del();

      if (!deleted) return res.status(404).json({ error: "Partner bulunamadı" });

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /partners]", err);
      return res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }
  else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler); 
