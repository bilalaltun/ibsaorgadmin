/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Tüm ürünleri getir veya ID ile tekil ürün
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Ürün ID (opsiyonel)
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
 *         description: Ürün(ler) başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductResponse'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalPagesCount:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     currentPageCount:
 *                       type: integer
 *
 *   post:
 *     summary: Yeni bir ürün ekle
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Ürün başarıyla eklendi
 *
 *   put:
 *     summary: Ürün güncelle (id ile)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek ürün ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Ürün başarıyla güncellendi
 *
 *   delete:
 *     summary: Ürünü sil (id ile)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek ürün ID'si
 *     responses:
 *       200:
 *         description: Ürün silindi
 *       404:
 *         description: Ürün bulunamadı
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     TabField:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Teknik Özellikler"
 *         content:
 *           type: string
 *           example: "İşlemci: Intel i7, RAM: 16GB"
 *
 *     ProductInput:
 *       type: object
 *       properties:
 *         category_key:
 *           type: string
 *           example: "electronics"
 *         is_active:
 *           type: boolean
 *           example: true
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             example: "/images/product1.jpg"
 *         project_name:
 *           type: string
 *           example: "Yenilikçi Proje"
 *         category:
 *           type: string
 *           example: "Elektronik"
 *         description:
 *           type: string
 *           example: "Bu ürün, yüksek performanslı bileşenleriyle dikkat çeker."
 *         tabs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TabField'
 *
 *     ProductResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         category_key:
 *           type: string
 *         is_active:
 *           type: boolean
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         project_name:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         tabs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TabField'
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

      const pageSize = parseInt(req.query.pageSize) || 10;
      const currentPage = parseInt(req.query.currentPage) || 1;
      const offset = (currentPage - 1) * pageSize;

      let products;
      if (id) {
        products = await db("Products").where({ id });
        if (products.length === 0) {
          return res.status(404).json({ error: "Ürün bulunamadı" });
        }
      } else {
        products = await db("Products")
          .limit(pageSize)
          .offset(offset)
          .orderBy("id", "desc");
      }

      const fullData = await Promise.all(
        products.map(async (product) => {
          const images = await db("ProductImages").where("product_id", product.id);
          const tabs = await db("ProductTabs").where("product_id", product.id);

          return {
            id: product.id,
            category_key: product.category_key,
            is_active: product.isactive === 1 || product.isactive === true,
            images: images.map((img) => img.url),
            project_name: product.project_name,
            category: product.category_name,
            description: product.description_text,
            tabs: tabs.map((tab) => ({
              title: tab.title,
              content: tab.content
            })),
          };
        })
      );

      const totalCountResult = await db("Products").count("id as count").first();
      const totalCount = Number(totalCountResult?.count || 0);

      res.status(200).json({
        data: id ? fullData[0] : fullData,
        pagination: id
          ? undefined
          : {
              totalPagesCount: Math.ceil(totalCount / pageSize),
              currentPage: currentPage,
              pageSize: pageSize,
              currentPageCount: fullData.length,
            },
      });
    } catch (err) {
      console.error("[GET /products]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST
  else if (req.method === "POST") {
    const {
      category_key,
      is_active = true,
      images = [],
      project_name = "",
      category = "",
      description = "",
      tabs = []
    } = req.body;

    try {
      await db.transaction(async (trx) => {
        const inserted = await trx("Products")
          .insert({
            category_key,
            isactive: is_active,
            project_name,
            category_name: category,
            description_text: description
          })
          .returning("id");

        const productId = inserted?.[0]?.id || inserted?.[0]; // PostgreSQL/MSSQL uyumluluğu
        if (!productId) throw new Error("Product ID alınamadı.");

        for (const url of images) {
          await trx("ProductImages").insert({ product_id: productId, url });
        }

        for (const tab of tabs || []) {
          await trx("ProductTabs").insert({
            product_id: productId,
            title: tab.title,
            content: tab.content
          });
        }
      });

      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /products]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    const {
      category_key,
      is_active = true,
      images = [],
      project_name = "",
      category = "",
      description = "",
      tabs = []
    } = req.body;

    try {
      await db.transaction(async (trx) => {
        await trx("Products").where({ id }).update({
          category_key,
          isactive: is_active,
          project_name,
          category_name: category,
          description_text: description
        });

        await trx("ProductImages").where({ product_id: id }).del();
        await trx("ProductTabs").where({ product_id: id }).del();

        for (const url of images || []) {
          await trx("ProductImages").insert({ product_id: id, url });
        }

        for (const tab of tabs || []) {
          await trx("ProductTabs").insert({
            product_id: id,
            title: tab.title,
            content: tab.content
          });
        }
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /products]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE
  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gereklidir" });

    try {
      const exists = await db("Products").where({ id }).first();
      if (!exists) return res.status(404).json({ error: "Ürün bulunamadı" });

      await db.transaction(async (trx) => {
        await trx("ProductTabs").where({ product_id: id }).del();
        await trx("ProductImages").where({ product_id: id }).del();
        await trx("Products").where({ id }).del();
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /products]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }
};

export default withCors(handler);
