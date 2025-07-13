/**
 * @swagger
 * /api/sitetags:
 *   get:
 *     summary: Site etiketi getir (tüm liste, sayfalı veya ID ile detay)
 *     tags: [SiteTags]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Etiket ID'si (verilirse sadece ilgili kayıt döner)
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
 *         description: Etiket(ler) getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/SiteTag'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SiteTag'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalPagesCount:
 *                           type: integer
 *                           example: 3
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         currentPageCount:
 *                           type: integer
 *                           example: 10
 *
 *   post:
 *     summary: Yeni etiket ekle
 *     tags: [SiteTags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SiteTagInput'
 *     responses:
 *       201:
 *         description: Etiket eklendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *   put:
 *     summary: Etiket güncelle
 *     tags: [SiteTags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek etiket ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SiteTagInput'
 *     responses:
 *       200:
 *         description: Etiket güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *   delete:
 *     summary: Etiket sil
 *     tags: [SiteTags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek etiket ID'si
 *     responses:
 *       200:
 *         description: Etiket silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 * components:
 *   schemas:
 *     SiteTag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         date:
 *           type: string
 *           example: "2025-05-23"
 *         isactive:
 *           type: boolean
 *           example: true
 *         title:
 *           type: string
 *           example: "Yeni Etiket"
 *
 *     SiteTagInput:
 *       type: object
 *       required:
 *         - isactive
 *         - title
 *       properties:
 *         date:
 *           type: string
 *           example: "2025-05-23"
 *         isactive:
 *           type: boolean
 *           example: true
 *         title:
 *           type: string
 *           example: "Yeni Etiket"
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

  // GET
  if (req.method === "GET") {
    try {
      const pageSize = parseInt(req.query.pageSize) || 1000;
      const currentPage = parseInt(req.query.currentPage) || 1;
      const offset = (currentPage - 1) * pageSize;

      let tags;

      if (id) {
        tags = await db("SiteTags").where({ id });
      } else {
        tags = await db("SiteTags")
          .orderBy("id", "desc")
          .limit(pageSize)
          .offset(offset);
      }

      if (!tags || tags.length === 0) {
        return res.status(404).json({ error: "Etiket bulunamadı" });
      }

      const result = tags.map(tag => ({
        id: tag.id,
        date: tag.date,
        isactive: tag.isactive === 1 || tag.isactive === true,
        title: tag.title
      }));

      const totalCountResult = await db("SiteTags").count("id as count").first();
      const totalCount = Number(totalCountResult?.count || 0);

      res.status(200).json({
        data: id ? result[0] : result,
        pagination: !id
          ? {
              totalPagesCount: Math.ceil(totalCount / pageSize),
              currentPage,
              pageSize,
              currentPageCount: result.length
            }
          : undefined
      });
    } catch (err) {
      console.error("[GET /sitetags]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST
  else if (req.method === "POST") {
    const { isactive, title, date } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "title alanı zorunludur ve string olmalıdır" });
    }

    try {
      await db("SiteTags").insert({
        date: date || new Date(),
        isactive,
        title
      });

      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /sitetags]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    const { date, isactive, title } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "title alanı zorunludur ve string olmalıdır" });
    }

    try {
      const updated = await db("SiteTags")
        .where({ id })
        .update({
          date: date || new Date(),
          isactive,
          title
        });

      if (!updated) {
        return res.status(404).json({ error: "Etiket bulunamadı" });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /sitetags]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE
  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      const deleted = await db("SiteTags").where({ id }).del();

      if (!deleted) {
        return res.status(404).json({ error: "Etiket bulunamadı" });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /sitetags]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  // Unsupported Method
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
