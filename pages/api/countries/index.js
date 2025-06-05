/**
 * @swagger
 * tags:
 *   - name: Countries
 *     description: Ülke yönetimi işlemleri
 *
 * /api/countries:
 *   get:
 *     summary: Ülkeleri getir (tüm liste, ID ile detay veya sayfalı)
 *     tags: [Countries]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Ülke ID'si (verilirse sadece o ülke döner)
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
 *         description: Ülke(ler) getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Country'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Country'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *
 *   post:
 *     summary: Yeni ülke ekle
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CountryInput'
 *     responses:
 *       201:
 *         description: Ülke başarıyla eklendi
 *
 *   put:
 *     summary: Ülke bilgilerini güncelle
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek ülkenin ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CountryInput'
 *     responses:
 *       200:
 *         description: Ülke güncellendi
 *
 *   delete:
 *     summary: Ülke sil
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek ülkenin ID'si
 *     responses:
 *       200:
 *         description: Ülke silindi
 *
 * components:
 *   schemas:
 *     Country:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Azerbaijan"
 *         federation_name:
 *           type: string
 *           example: "Azerbaijan Football Federation"
 *         directory:
 *           type: string
 *           example: "Central Office Baku"
 *         address:
 *           type: string
 *           example: "28 May Street No:10, Baku"
 *         phone:
 *           type: string
 *           example: "+994-12-345-67-89"
 *         email:
 *           type: string
 *           example: "contact@aff.org.az"
 *         isactive:
 *           type: boolean
 *           example: true
 *         flag_url:
 *           type: string
 *           example: "/flags/az.png"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-06-01T12:00:00Z"
 *
 *     CountryInput:
 *       type: object
 *       required:
 *         - name
 *         - federation_name
 *         - isactive
 *       properties:
 *         name:
 *           type: string
 *           example: "Azerbaijan"
 *         federation_name:
 *           type: string
 *           example: "Azerbaijan Football Federation"
 *         directory:
 *           type: string
 *           example: "Central Office Baku"
 *         address:
 *           type: string
 *           example: "28 May Street No:10, Baku"
 *         phone:
 *           type: string
 *           example: "+994-12-345-67-89"
 *         email:
 *           type: string
 *           example: "contact@aff.org.az"
 *         isactive:
 *           type: boolean
 *           example: true
 *         flag_url:
 *           type: string
 *           example: "/flags/az.png"
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const id = req.query.id ? parseInt(req.query.id) : null;

  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    try {
      verifyToken(req); // Yetkilendirme kontrolü
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  // GET
  if (req.method === "GET") {
    try {
      const { pageSize = 10, currentPage = 1 } = req.query;
      const pageInt = parseInt(pageSize);
      const currentPageInt = parseInt(currentPage);

      if (id) {
        const country = await db("Countries").where({ id }).first();
        if (!country) return res.status(404).json({ error: "Ülke bulunamadı" });

        return res.status(200).json(country);
      }

      const total = await db("Countries").count("* as count").first();
      const totalCount = total?.count || 0;
      const totalPages = Math.ceil(totalCount / pageInt);

      const countries = await db("Countries")
        .orderBy("id", "desc")
        .limit(pageInt)
        .offset((currentPageInt - 1) * pageInt);

      return res.status(200).json({
        data: countries,
        pagination: {
          pageSize: pageInt,
          currentPage: currentPageInt,
          total: totalCount,
          totalPages,
        },
      });
    } catch (err) {
      console.error("[GET /countries]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST
  else if (req.method === "POST") {
    const {
      name,
      federation_name,
      directory,
      address,
      phone,
      email,
      isactive,
      flag_url,
    } = req.body;

    try {
      await db("Countries").insert({
        name,
        federation_name,
        directory,
        address,
        phone,
        email,
        isactive,
        flag_url,
        created_at: new Date(),
      });

      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /countries]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    const {
      name,
      federation_name,
      directory,
      address,
      phone,
      email,
      isactive,
      flag_url,
    } = req.body;

    try {
      await db("Countries")
        .where({ id })
        .update({
          name,
          federation_name,
          directory,
          address,
          phone,
          email,
          isactive,
          flag_url,
        });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /countries]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE
  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      await db("Countries").where({ id }).del();
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /countries]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  // Unsupported
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
