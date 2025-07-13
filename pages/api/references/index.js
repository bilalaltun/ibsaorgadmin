/**
 * @swagger
 * tags:
 *   - name: References
 *     description: Referans işlemleri
 *
 * /api/references:
 *   get:
 *     summary: Referansları getir (tüm liste, sayfalı veya ID ile detay)
 *     tags: [References]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Referans ID'si (verilirse sadece ilgili kayıt döner)
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
 *         description: Referans(lar) getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Referance'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Referance'
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
 *     summary: Yeni referans ekle
 *     tags: [References]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReferanceInput'
 *     responses:
 *       201:
 *         description: Referans eklendi
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
 *     summary: Referans güncelle
 *     tags: [References]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek referans ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReferanceInput'
 *     responses:
 *       200:
 *         description: Referans güncellendi
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
 *     summary: Referans sil
 *     tags: [References]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek referans ID'si
 *     responses:
 *       200:
 *         description: Referans silindi
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
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     ReferanceInput:
 *       type: object
 *       required:
 *         - img
 *         - name
 *         - isactive
 *         - show_at_home
 *       properties:
 *         img:
 *           type: string
 *           example: "/images/Referance/01.jpg"
 *         name:
 *           type: string
 *           example: "ABC Firması"
 *         isactive:
 *           type: boolean
 *           example: true
 *         show_at_home:
 *           type: boolean
 *           example: true
 *
 *     Referance:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         img:
 *           type: string
 *           example: "/images/Referance/01.jpg"
 *         name:
 *           type: string
 *           example: "ABC Firması"
 *         isactive:
 *           type: boolean
 *           example: true
 *         show_at_home:
 *           type: boolean
 *           example: true
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
      const idParam = req.query.id;
      const id = idParam ? parseInt(idParam) : null;

      const pageSizeParam = req.query.pageSize ;
      const currentPageParam = req.query.currentPage;
      const hasPagination = pageSizeParam !== undefined && currentPageParam !== undefined;

      const pageSize = hasPagination ? parseInt(pageSizeParam) : null;
      const currentPage = hasPagination ? parseInt(currentPageParam) : null;
      const offset = hasPagination ? (currentPage - 1) * pageSize : null;

      let referances;
      if (id) {
        referances = await db("Referances").where({ id });
      } else {
        let query = db("Referances").orderBy("id", "desc");
        if (hasPagination) {
          query = query.limit(pageSize).offset(offset);
        }
        referances = await query;
      }

      if (!referances || referances.length === 0) {
        return res.status(404).json({ error: "Referans bulunamadı" });
      }

      const result = referances.map((r) => ({
        id: r.id,
        img: r.img,
        name: r.name,
        isactive: r.isactive === 1 || r.isactive === true,
        show_at_home: r.show_at_home === 1 || r.show_at_home === true,
      }));

      const totalCountResult = await db("Referances").count("id as count").first();
      const totalCount = Number(totalCountResult?.count || 0);

      res.status(200).json({
        data: id ? result[0] : result,
        pagination: !id && hasPagination
          ? {
              totalPagesCount: Math.ceil(totalCount / pageSize),
              currentPage,
              pageSize,
              currentPageCount: result.length,
            }
          : undefined,
      });
    } catch (err) {
      console.error("[GET /references]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST
  else if (req.method === "POST") {
    const { img, name, isactive, show_at_home } = req.body;

    try {
      await db("Referances").insert({
        img,
        name,
        isactive,
        show_at_home,
      });

      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /references]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });
    const { img, name, isactive, show_at_home } = req.body;

    try {
      const updated = await db("Referances")
        .where({ id })
        .update({ img, name, isactive, show_at_home });

      if (!updated) {
        return res.status(404).json({ error: "Referans bulunamadı" });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /references]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE
  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      const deleted = await db("Referances").where({ id }).del();

      if (!deleted) {
        return res.status(404).json({ error: "Referans bulunamadı" });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /references]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  // Unsupported
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
