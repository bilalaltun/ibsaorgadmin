/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Kategori işlemleri
 *
 * /api/categories:
 *   get:
 *     summary: Kategorileri getir (liste veya ID ile detay)
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Kategori ID'si (verilirse sadece o kategori döner)
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
 *         description: Kategori(ler) getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/CategoryResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CategoryResponse'
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
 *     summary: Yeni kategori ekle
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Kategori eklendi
 *
 *   put:
 *     summary: Kategori güncelle
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek kategori ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       200:
 *         description: Kategori güncellendi
 *
 *   delete:
 *     summary: Kategori sil
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek kategori ID'si
 *     responses:
 *       200:
 *         description: Kategori silindi
 *
 * components:
 *   schemas:
 *     CategoryInput:
 *       type: object
 *       required:
 *         - name
 *         - isactive
 *       properties:
 *         name:
 *           type: string
 *           example: "Ürün Kategorisi"
 *         isactive:
 *           type: boolean
 *           example: true
 *
 *     CategoryResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Ürün Kategorisi"
 *         isactive:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-06-10T12:00:00.000Z"
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

    try {
        switch (req.method) {
            case "GET": {
                const currentPage = parseInt(req.query.currentPage || "1");
                const pageSize = parseInt(req.query.pageSize || "10");

                if (id) {
                    const category = await db("Categories").where({ id }).first();
                    if (!category) {
                        return res.status(404).json({ error: "Kategori bulunamadı" });
                    }
                    return res.status(200).json(category);
                }

                const offset = (currentPage - 1) * pageSize;
                const categories = await db("Categories")
                    .orderBy("id", "desc")
                    .offset(offset)
                    .limit(pageSize);

                const totalResult = await db("Categories").count("id as count").first();
                const total = totalResult?.count || 0;

                return res.status(200).json({
                    data: categories,
                    pagination: {
                        currentPage,
                        pageSize,
                        total,
                        totalPages: Math.ceil(total / pageSize),
                    },
                });
            }

            case "POST": {
                const { name, isactive } = req.body;

                if (!name || typeof isactive !== "boolean") {
                    return res.status(400).json({ error: "Eksik veya hatalı veri gönderildi." });
                }

                try {
                    await db("Categories").insert({ name, isactive });

                    return res.status(201).json({ success: true });
                } catch (err) {
                    console.error("[POST /categories]", err);
                    return res.status(500).json({ error: "POST failed", details: err.message });
                }
            }

            case "PUT": {
                if (!id) return res.status(400).json({ error: "ID gereklidir." });

                const { name, isactive } = req.body;

                if (!name || typeof isactive !== "boolean") {
                    return res.status(400).json({ error: "Eksik veya hatalı veri gönderildi." });
                }

                await db("Categories").where({ id }).update({ name, isactive });

                return res.status(200).json({ message: "Kategori güncellendi." });
            }

            case "DELETE": {
                if (!id) return res.status(400).json({ error: "ID gereklidir." });

                await db("Categories").where({ id }).del();

                return res.status(200).json({ message: "Kategori silindi." });
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
