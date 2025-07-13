/* eslint-disable */
/**
 * @swagger
 * tags:
 *   - name: Certificates
 *     description: Sertifika işlemleri
 *
 * /api/certificates:
 *   get:
 *     summary: Sertifikaları getir (tüm liste veya ID ile detay)
 *     tags: [Certificates]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Sertifika ID'si (verilirse detay döner)
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
 *         description: Sertifika(lar) getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/CertificateResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CertificateResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *
 *   post:
 *     summary: Yeni sertifika ekle
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CertificateInput'
 *     responses:
 *       201:
 *         description: Sertifika eklendi
 *
 *   put:
 *     summary: Sertifika güncelle
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CertificateInput'
 *     responses:
 *       200:
 *         description: Sertifika güncellendi
 *
 *   delete:
 *     summary: Sertifika sil
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sertifika silindi
 *
 * components:
 *   schemas:
 *     CertificateInput:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-06-05"
 *         img:
 *           type: string
 *           example: "/uploads/blogs/cnc-teknoloji.jpg"
 *         isactive:
 *           type: boolean
 *           example: true
 *         title:
 *           type: string
 *           example: "ISO 9001 Sertifikası"
 *
 *     CertificateResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         date:
 *           type: string
 *           format: date
 *         img:
 *           type: string
 *         isactive:
 *           type: boolean
 *         title:
 *           type: string
 *           example: "ISO 9001 Sertifikası"
 */
import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const id = req.query.id ? parseInt(req.query.id) : null;

  // Token kontrolü
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    try {
      verifyToken(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  // GET
  if (req.method === "GET") {
    try {
      const { pageSize = 1000, currentPage = 1 } = req.query;
      const limit = parseInt(pageSize);
      const page = parseInt(currentPage);
      const offset = (page - 1) * limit;

      let certificates;

      if (id) {
        certificates = await db("Certificates").where({ id });
        if (!certificates || certificates.length === 0) {
          return res.status(404).json({ error: "Belirtilen ID’ye ait sertifika bulunamadı." });
        }
      } else {
        certificates = await db("Certificates")
          .orderBy("date", "desc")
          .limit(limit)
          .offset(offset);

        if (!certificates || certificates.length === 0) {
          return res.status(404).json({ error: "Hiçbir sertifika kaydı bulunamadı." });
        }
      }

      const result = certificates.map((cert) => ({
        id: cert.id,
        date: cert.date,
        img: cert.img,
        title: cert.title,
        isactive: cert.isactive
      }));

      const countResult = await db("Certificates").count("id as count").first();
      const totalCount = Number(countResult?.count || 0);

      res.status(200).json({
        data: id ? result[0] : result,
        pagination: {
          totalCount,
          currentPage: page,
          pageSize: limit,
          totalPagesCount: Math.ceil(totalCount / limit),
          currentPageCount: result.length,
        },
      });
    } catch (err) {
      console.error("[GET /certificates]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST
  else if (req.method === "POST") {
    const { date, img, title, isactive } = req.body;

    try {
      await db("Certificates").insert({
        date,
        img,
        title,
        isactive,
      });

      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /certificates]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    const { date, img, title, isactive } = req.body;

    try {
      const updated = await db("Certificates")
        .where({ id })
        .update({ date, img, title, isactive });

      if (updated === 0) throw new Error(`ID ${id} ile sertifika bulunamadı.`);

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /certificates]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE
  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      await db("Certificates").where({ id }).del();
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /certificates]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  // Unsupported
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
