/**
 * @swagger
 * tags:
 *   - name: Countries
 *     description: Ülke yönetimi işlemleri
 *
 * /api/countries:
 *   get:
 *     summary: Ülkeleri getir (tüm liste, ID ile detay veya filtreli)
 *     tags: [Countries]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Ülke ID'si (verilirse sadece o ülke döner)
 *       - in: query
 *         name: region_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Bölgeye göre filtreleme (region_id)
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
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Country'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                 filters:
 *                   type: object
 *                   properties:
 *                     region_id:
 *                       type: integer
 *                       example: 2
 *
 *   post:
 *     summary: Yeni ülke(leri) ekle
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/CountryInput'
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/CountryInput'
 *     responses:
 *       201:
 *         description: Ülke(ler) başarıyla eklendi
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
 *         id: { type: integer, example: 1 }
 *         name: { type: string, example: "Azerbaijan" }
 *         federation_name: { type: string, example: "Azerbaijan Football Federation" }
 *         directory: { type: string, example: "Central Office Baku" }
 *         address: { type: string, example: "28 May Street No:10, Baku" }
 *         phone: { type: string, example: "+994-12-345-67-89" }
 *         email: { type: string, example: "contact@aff.org.az" }
 *         isactive: { type: boolean, example: true }
 *         flag_url: { type: string, example: "/flags/az.png" }
 *         region_id: { type: integer, example: 2 }
 *         region_name: { type: string, example: "Europe" }
 *         created_at: { type: string, format: date-time, example: "2025-06-01T12:00:00Z" }
 *
 *     CountryInput:
 *       type: object
 *       required: [name, federation_name, isactive]
 *       properties:
 *         name: { type: string, example: "Azerbaijan" }
 *         federation_name: { type: string, example: "Azerbaijan Football Federation" }
 *         directory: { type: string, example: "Central Office Baku" }
 *         address: { type: string, example: "28 May Street No:10, Baku" }
 *         phone: { type: string, example: "+994-12-345-67-89" }
 *         email: { type: string, example: "contact@aff.org.az" }
 *         isactive: { type: boolean, example: true }
 *         flag_url: { type: string, example: "/flags/az.png" }
 *         region_id: { type: integer, example: 2 }
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const id = req.query.id ? parseInt(req.query.id) : null;

  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    try {
      await verifyToken(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  if (req.method === "GET") {
    try {
      const { pageSize = 1000, currentPage = 1, region_id } = req.query;
      const pageInt = parseInt(pageSize);
      const currentPageInt = parseInt(currentPage);

      if (id) {
        const country = await db("Countries")
          .leftJoin("Regions", "Countries.region_id", "Regions.id")
          .select("Countries.*", "Regions.name as region_name")
          .where("Countries.id", id)
          .first();

        if (!country) return res.status(404).json({ error: "Ülke bulunamadı" });
        return res.status(200).json(country);
      }

      const query = db("Countries")
        .leftJoin("Regions", "Countries.region_id", "Regions.id")
        .select("Countries.*", "Regions.name as region_name");

      if (region_id) {
        query.where("Countries.region_id", parseInt(region_id));
      }

      const totalQuery = db("Countries");
      if (region_id) {
        totalQuery.where("region_id", parseInt(region_id));
      }

      const totalResult = await totalQuery.count("* as count").first();
      const totalCount = totalResult?.count || 0;
      const totalPages = Math.ceil(totalCount / pageInt);

      const countries = await query
        .orderBy("Countries.id", "desc")
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
        filters: {
          ...(region_id && { region_id: parseInt(region_id) }),
        },
      });
    } catch (err) {
      console.error("[GET /countries]", err);
      return res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  else if (req.method === "POST") {
    const input = req.body;
    const now = new Date();

    // Çoklu kayıt (array) kontrolü
    if (Array.isArray(input)) {
      const invalid = input.find(
        (item) => !item.name || !item.federation_name || item.isactive === undefined
      );

      if (invalid) {
        return res.status(400).json({ error: "Bazı kayıtlar zorunlu alanları içermiyor" });
      }

      try {
        const insertData = input.map((item) => ({
          name: item.name,
          federation_name: item.federation_name,
          directory: item.directory,
          address: item.address,
          phone: item.phone,
          email: item.email,
          isactive: item.isactive,
          flag_url: item.flag_url,
          region_id: item.region_id || null,
          created_at: now,
        }));

        await db("Countries").insert(insertData);
        return res.status(201).json({ success: true, inserted: insertData.length });
      } catch (err) {
        console.error("[POST /countries - array]", err);
        return res.status(500).json({ error: "POST (array) failed", details: err.message });
      }
    }

    // Tekil kayıt
    const {
      name,
      federation_name,
      directory,
      address,
      phone,
      email,
      isactive,
      flag_url,
      region_id,
    } = input;

    if (!name || !federation_name || isactive === undefined) {
      return res.status(400).json({ error: "Zorunlu alanlar eksik" });
    }

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
        region_id: region_id || null,
        created_at: now,
      });

      return res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /countries]", err);
      return res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

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
      region_id,
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
          region_id: region_id || null,
          updated_at: new Date(),
        });

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /countries]", err);
      return res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      await db("Countries").where({ id }).del();
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /countries]", err);
      return res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
