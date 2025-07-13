/**
 * @swagger
 * tags:
 *   - name: Catalogs
 *     description: Katalog işlemleri
 *
 * /api/catalogs:
 *   get:
 *     summary: Katalogları getir (liste veya ID ile detay)
 *     tags: [Catalogs]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Katalog ID'si (verilirse sadece o katalog döner)
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
 *         description: Katalog(lar) getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/CatalogResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CatalogResponse'
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
 *     summary: Yeni katalog ekle
 *     tags: [Catalogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CatalogInput'
 *     responses:
 *       201:
 *         description: Katalog eklendi
 *
 *   put:
 *     summary: Katalog güncelle
 *     tags: [Catalogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek katalog ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CatalogInput'
 *     responses:
 *       200:
 *         description: Katalog güncellendi
 *
 *   delete:
 *     summary: Katalog sil
 *     tags: [Catalogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek katalog ID'si
 *     responses:
 *       200:
 *         description: Katalog silindi
 *
 * components:
 *   schemas:
 *     CatalogInput:
 *       type: object
 *       required:
 *         - cover_img
 *         - isactive
 *         - title
 *         - file
 *       properties:
 *         cover_img:
 *           type: string
 *           example: "/images/catalogs/cover.jpg"
 *         isactive:
 *           type: boolean
 *           example: true
 *         title:
 *           type: string
 *           example: "Main Product Catalog"
 *         file:
 *           type: string
 *           example: "/files/catalog.pdf"
 *
 *     CatalogResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         cover_img:
 *           type: string
 *           example: "/images/catalogs/cover.jpg"
 *         isactive:
 *           type: boolean
 *           example: true
 *         title:
 *           type: string
 *           example: "Main Product Catalog"
 *         file:
 *           type: string
 *           example: "/files/catalog.pdf"
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
      const currentPage = parseInt(req.query.currentPage || "1");
      const pageSize = parseInt(req.query.pageSize || "1000");

      if (id) {
        const catalog = await db("Catalogs").where({ id }).first();
        if (!catalog) return res.status(404).json({ error: "Katalog bulunamadı" });

        return res.status(200).json({
          id: catalog.id,
          cover_img: catalog.cover_img,
          isactive: catalog.isactive,
          title: catalog.title,
          file: catalog.file
        });
      }

      const offset = (currentPage - 1) * pageSize;
      const catalogs = await db("Catalogs")
        .orderBy("id", "desc")
        .offset(offset)
        .limit(pageSize);

      const data = catalogs.map(c => ({
        id: c.id,
        cover_img: c.cover_img,
        isactive: c.isactive,
        title: c.title,
        file: c.file
      }));

      res.status(200).json({
        data,
        pagination: {
          currentPage,
          pageSize,
          total: data.length
        }
      });
    } catch (err) {
      console.error("[GET /catalogs]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST
  else if (req.method === 'POST') {
    const { cover_img, isactive, title, file } = req.body;

    if (!title || !file) {
      return res.status(400).json({ error: "title ve file zorunludur" });
    }

    try {
      await db("Catalogs").insert({
        cover_img,
        isactive,
        title,
        file
      });

      res.status(201).json({ success: true });
    } catch (err) {
      console.error('[POST /catalogs]', err);
      res.status(500).json({ error: 'POST failed', details: err.message });
    }
  }

  // PUT
  else if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'ID gerekli' });

    const { cover_img, isactive, title, file } = req.body;

    try {
      await db("Catalogs")
        .where({ id })
        .update({ cover_img, isactive, title, file });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error('[PUT /catalogs]', err);
      res.status(500).json({ error: 'PUT failed', details: err.message });
    }
  }

  // DELETE
  else if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'ID gerekli' });

    try {
      await db("Catalogs").where({ id }).del();
      res.status(200).json({ success: true });
    } catch (err) {
      console.error('[DELETE /catalogs]', err);
      res.status(500).json({ error: 'DELETE failed', details: err.message });
    }
  }

  // INVALID METHOD
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default withCors(handler);
