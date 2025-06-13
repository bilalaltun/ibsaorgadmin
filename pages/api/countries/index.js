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
 *         region_id:
 *           type: integer
 *           example: 2
 *         region_name:
 *           type: string
 *           example: "Europe"
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
 *         region_id:
 *           type: integer
 *           example: 2
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const id = req.query.id ? parseInt(req.query.id) : null;
  const sub = req.query.sub === "true";

  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    try {
      verifyToken(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  try {
    // SUBCATEGORY İŞLEMLERİ
    if (sub) {
      switch (req.method) {
        case "GET": {
          const currentPage = parseInt(req.query.currentPage || "1");
          const pageSize = parseInt(req.query.pageSize || "10");
          const offset = (currentPage - 1) * pageSize;

          const query = db("Subcategories")
            .select("Subcategories.*", "Categories.title as category_title")
            .join("Categories", "Subcategories.category_id", "Categories.id")
            .orderBy("Subcategories.id", "desc")
            .offset(offset)
            .limit(pageSize);

          if (id) {
            query.where("Subcategories.category_id", id);
          }

          const subcategories = await query;
          const totalResult = await db("Subcategories").count("id as count").first();
          const total = totalResult?.count || 0;

          return res.status(200).json({
            data: subcategories,
            pagination: {
              currentPage,
              pageSize,
              total,
              totalPages: Math.ceil(total / pageSize),
            },
          });
        }

        case "POST": {
          const { category_id, title, file_url, isactive } = req.body;

          if (!category_id || !title || typeof isactive !== "boolean") {
            return res.status(400).json({ error: "Eksik veya hatalı veri gönderildi." });
          }

          await db("Subcategories").insert({ category_id, title, file_url, isactive });
          return res.status(201).json({ success: true });
        }

        case "PUT": {
          if (!id) return res.status(400).json({ error: "ID gereklidir." });
          const { title, file_url, isactive } = req.body;

          if (!title || typeof isactive !== "boolean") {
            return res.status(400).json({ error: "Eksik veya hatalı veri gönderildi." });
          }

          await db("Subcategories").where({ id }).update({ title, file_url, isactive });
          return res.status(200).json({ message: "Alt kategori güncellendi." });
        }

        case "DELETE": {
          if (!id) return res.status(400).json({ error: "ID gereklidir." });

          await db("Subcategories").where({ id }).del();
          return res.status(200).json({ message: "Alt kategori silindi." });
        }

        default:
          return res.status(405).json({ error: "Yöntem desteklenmiyor." });
      }
    }

    // GET 
    switch (req.method) {
      case "GET": {
        const currentPage = parseInt(req.query.currentPage || "1");
        const pageSize = parseInt(req.query.pageSize || "10");

        if (id) {
          const category = await db("Categories").where({ id }).first();
          if (!category) {
            return res.status(404).json({ error: "Kategori bulunamadı" });
          }

          const subcategories = await db("Subcategories")
            .where("category_id", id)
            .orderBy("id", "desc");

          return res.status(200).json({ ...category, subcategories });
        }

        const offset = (currentPage - 1) * pageSize;
        const categories = await db("Categories")
          .orderBy("id", "desc")
          .offset(offset)
          .limit(pageSize);

        const ids = categories.map((c) => c.id);
        const subMap = await db("Subcategories")
          .whereIn("category_id", ids)
          .orderBy("id", "desc");

        const categoryList = categories.map((cat) => ({
          ...cat,
          subcategories: subMap.filter((sub) => sub.category_id === cat.id),
        }));

        const totalResult = await db("Categories").count("id as count").first();
        const total = totalResult?.count || 0;

        return res.status(200).json({
          data: categoryList,
          pagination: {
            currentPage,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
          },
        });
      }
// POST
      case "POST": {
        const { title, isactive, subcategories = [] } = req.body;

        if (!title || typeof isactive !== "boolean") {
          return res.status(400).json({ error: "Eksik veya hatalı veri gönderildi." });
        }

        const [categoryId] = await db("Categories").insert({ title, isactive }).returning("id");

        if (subcategories.length > 0) {
          const inserts = subcategories.map((sub) => ({
            category_id: categoryId,
            title: sub.title,
            file_url: sub.file_url || null,
            isactive: typeof sub.isactive === "boolean" ? sub.isactive : true,
          }));
          await db("Subcategories").insert(inserts);
        }

        return res.status(201).json({ success: true });
      }

      // PUT
      case "PUT": {
        if (!id) return res.status(400).json({ error: "ID gereklidir." });

        const { title, isactive, subcategories = [] } = req.body;

        if (!title || typeof isactive !== "boolean") {
          return res.status(400).json({ error: "Eksik veya hatalı veri gönderildi." });
        }

        await db("Categories").where({ id }).update({ title, isactive });

        for (const sub of subcategories) {
          if (sub.id) {
            await db("Subcategories").where({ id: sub.id }).update({
              title: sub.title,
              file_url: sub.file_url,
              isactive: sub.isactive,
            });
          } else {
            await db("Subcategories").insert({
              category_id: id,
              title: sub.title,
              file_url: sub.file_url || null,
              isactive: typeof sub.isactive === "boolean" ? sub.isactive : true,
            });
          }
        }

        return res.status(200).json({ message: "Kategori ve alt kategoriler güncellendi." });
      }

      // DELETE
      case "DELETE": {
        if (!id) return res.status(400).json({ error: "ID gereklidir." });

        await db("Categories").where({ id }).del();

        return res.status(200).json({ message: "Kategori ve alt kategoriler silindi." });
      }

      default:
        return res.status(405).json({ error: "Yöntem desteklenmiyor." });
    }
  } catch (error) {
    console.error(`[${req.method} /categories]`, error);
    return res.status(500).json({ error: `${req.method} işlemi başarısız`, details: error.message });
  }
};

export default withCors(handler);
