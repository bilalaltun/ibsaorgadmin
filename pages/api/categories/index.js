/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Kategori ve Alt Kategori işlemleri
 *
 * /api/categories:
 *   get:
 *     summary: Kategorileri ve iç içe alt kategorileri getir
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: Belirli kategori ID'si
 *       - in: query
 *         name: currentPage
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Kategoriler getirildi
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
 *
 *   post:
 *     summary: Yeni kategori ve alt kategorileri oluştur
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryWithSubcategoriesInput'
 *     responses:
 *       201:
 *         description: Kategori ve alt kategoriler eklendi
 *
 *   put:
 *     summary: Kategori ve alt kategorileri güncelle
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek kategori ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryWithSubcategoriesUpdateInput'
 *     responses:
 *       200:
 *         description: Güncelleme başarılı
 *       400:
 *         description: Geçersiz veri
 *
 *   delete:
 *     summary: Kategori ve alt kategorilerini sil
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek kategori ID
 *     responses:
 *       200:
 *         description: Kategori ve alt kategorileri silindi
 *
 * components:
 *   schemas:
 *     CategoryWithSubcategoriesInput:
 *       type: object
 *       required:
 *         - name
 *         - isactive
 *       properties:
 *         name:
 *           type: string
 *           example: "Erkek Giyim"
 *         isactive:
 *           type: boolean
 *           example: true
 *         subcategories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubcategoryCreateInput'
 *
 *     CategoryWithSubcategoriesUpdateInput:
 *       type: object
 *       required:
 *         - name
 *         - isactive
 *       properties:
 *         name:
 *           type: string
 *           example: "Erkek Giyim"
 *         isactive:
 *           type: boolean
 *           example: true
 *         subcategories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubcategoryUpdateInput'
 *
 *     SubcategoryCreateInput:
 *       type: object
 *       required:
 *         - title
 *         - isactive
 *       properties:
 *         title:
 *           type: string
 *           example: "Tişört"
 *         isactive:
 *           type: boolean
 *           example: true
 *         files:
 *           type: array
 *           description: Alt kategoriye ait dosya URL'leri
 *           items:
 *             type: string
 *           example:
 *             - "https://example.com/ti-sort1.pdf"
 *             - "https://example.com/ti-sort2.jpg"
 *
 *     SubcategoryUpdateInput:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - isactive
 *       properties:
 *         id:
 *           type: integer
 *           example: 5
 *           description: Güncellenecek alt kategori ID
 *         title:
 *           type: string
 *           example: "Tişört"
 *         isactive:
 *           type: boolean
 *           example: true
 *         files:
 *           type: array
 *           description: Alt kategoriye ait dosya URL'leri
 *           items:
 *             type: string
 *           example:
 *             - "https://example.com/ti-sort1.pdf"
 *             - "https://example.com/ti-sort2.jpg"
 *
 *     CategoryResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         isactive:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         subcategories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubcategoryResponse'
 *
 *     SubcategoryResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         category_id:
 *           type: integer
 *         isactive:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         files:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - "https://example.com/ti-sort1.pdf"
 *             - "https://example.com/ti-sort2.jpg"
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
        if (sub) {
            switch (req.method) {
                case "GET": {
                    const currentPage = parseInt(req.query.currentPage || "1");
                    const pageSize = parseInt(req.query.pageSize || "1000");
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
                    const subIds = subcategories.map((s) => s.id);
                    const files = await db("SubcategoryFiles").whereIn("subcategory_id", subIds);

                    const enriched = subcategories.map((sub) => ({
                        ...sub,
                        files: files.filter(f => f.subcategory_id === sub.id).map(f => f.file_url)
                    }));

                    const totalResult = await db("Subcategories").count("id as count").first();
                    const total = totalResult?.count || 0;

                    return res.status(200).json({
                        data: enriched,
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
                    const { name, isactive, subcategories = [] } = req.body;

                    if (!name || typeof isactive !== "boolean") {
                        return res.status(400).json({ error: "Eksik veya hatalı veri gönderildi." });
                    }

                    const [categoryId] = await db("Categories")
                        .insert({ name, isactive })
                        .returning("id");

                    for (const sub of subcategories) {
                        if (!sub.title || typeof sub.isactive !== "boolean") continue;

                        const [subId] = await db("Subcategories")
                            .insert({
                                category_id: categoryId,
                                title: sub.title,
                                isactive: sub.isactive
                            })
                            .returning("id");

                        if (Array.isArray(sub.files)) {
                            const insertFiles = sub.files.map((url) => ({
                                subcategory_id: subId,
                                file_url: url
                            }));
                            await db("SubcategoryFiles").insert(insertFiles);
                        }
                    }

                    return res.status(201).json({ success: true });
                }


                // PUT (category)
                case "PUT": {
                    if (!id) return res.status(400).json({ error: "ID gereklidir." });

                    const { name, isactive, subcategories = [] } = req.body;

                    if (!name || typeof isactive !== "boolean") {
                        return res.status(400).json({ error: "Eksik veya hatalı veri gönderildi." });
                    }

                    await db("Categories").where({ id }).update({ name, isactive });

                    for (const sub of subcategories) {
                        if (sub.id) {
                            await db("Subcategories").where({ id: sub.id }).update({
                                title: sub.title,
                                isactive: sub.isactive
                            });

                            await db("SubcategoryFiles").where({ subcategory_id: sub.id }).del();

                            if (Array.isArray(sub.files)) {
                                const insertFiles = sub.files.map((url) => ({
                                    subcategory_id: sub.id,
                                    file_url: url
                                }));
                                await db("SubcategoryFiles").insert(insertFiles);
                            }
                        }
                    }

                    return res.status(200).json({ message: "Kategori güncellendi." });
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

        switch (req.method) {
            case "GET": {
                const currentPage = parseInt(req.query.currentPage || "1");
                const pageSize = parseInt(req.query.pageSize || "10");
                const offset = (currentPage - 1) * pageSize;

                if (id) {
                    const category = await db("Categories").where({ id }).first();
                    if (!category) {
                        return res.status(404).json({ error: "Kategori bulunamadı" });
                    }

                    const subcategories = await db("Subcategories")
                        .where("category_id", id)
                        .orderBy("id", "desc");

                    const subIds = subcategories.map((s) => s.id);
                    const files = await db("SubcategoryFiles").whereIn("subcategory_id", subIds);

                    const enrichedSubs = subcategories.map((sub) => ({
                        ...sub,
                        files: files.filter(f => f.subcategory_id === sub.id).map(f => f.file_url)
                    }));

                    return res.status(200).json({ ...category, subcategories: enrichedSubs });
                }

                const categories = await db("Categories")
                    .orderBy("id", "desc")
                    .offset(offset)
                    .limit(pageSize);

                const categoryIds = categories.map((c) => c.id);
                const subcategories = await db("Subcategories").whereIn("category_id", categoryIds);
                const subIds = subcategories.map((s) => s.id);
                const files = await db("SubcategoryFiles").whereIn("subcategory_id", subIds);

                const enrichedSubs = subcategories.map((sub) => ({
                    ...sub,
                    files: files.filter((f) => f.subcategory_id === sub.id).map((f) => f.file_url)
                }));

                const categoryList = categories.map((category) => ({
                    ...category,
                    subcategories: enrichedSubs.filter((sub) => sub.category_id === category.id)
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

         case "POST": {
    const { name, isactive, subcategories = [] } = req.body;

    if (!name || typeof isactive !== "boolean") {
        return res.status(400).json({ error: "Eksik veya hatalı veri gönderildi." });
    }

    try {
        await db.transaction(async (trx) => {
            // Ana kategori ekleniyor
            const rawCategory = await trx.raw(
                `INSERT INTO Categories (name, isactive)
                 OUTPUT INSERTED.id
                 VALUES (?, ?)`,
                [name, isactive]
            );

            const categoryId = rawCategory?.[0]?.id;
            if (!categoryId) throw new Error("Kategori ID alınamadı.");

            // Alt kategoriler ekleniyor
            for (const sub of subcategories) {
                if (!sub.title || typeof sub.isactive !== "boolean") continue;

                const rawSub = await trx.raw(
                    `INSERT INTO Subcategories (category_id, title, isactive)
                     OUTPUT INSERTED.id
                     VALUES (?, ?, ?)`,
                    [categoryId, sub.title, sub.isactive]
                );

                const subId = rawSub?.[0]?.id;
                if (!subId) throw new Error("Alt kategori ID alınamadı.");

                // Alt kategoriye ait dosya URL'leri varsa
                if (Array.isArray(sub.files) && sub.files.length > 0) {
                    const insertFiles = sub.files.map((url) => ({
                        subcategory_id: subId,
                        file_url: url
                    }));

                    await trx("SubcategoryFiles").insert(insertFiles);
                }
            }
        });

        return res.status(201).json({ success: true });
    } catch (err) {
        console.error("Kategori oluşturma hatası:", err);
        return res.status(500).json({ error: "Kategori oluşturulurken hata oluştu", details: err.message });
    }
}

case "PUT": {
    if (!id) return res.status(400).json({ error: "ID gereklidir." });

    const { name, isactive, subcategories = [] } = req.body;

    if (!name || typeof isactive !== "boolean") {
        return res.status(400).json({ error: "Eksik veya hatalı veri gönderildi." });
    }

    try {
        await db.transaction(async (trx) => {
            await trx("Categories").where({ id }).update({ name, isactive });

            for (const sub of subcategories) {
                if (sub.id) {
                    const existingSub = await trx("Subcategories").where({ id: sub.id }).first();

                    if (!existingSub) {
                        throw new Error(`Alt kategori bulunamadı: ID ${sub.id}`);
                    }

                    await trx("Subcategories").where({ id: sub.id }).update({
                        title: sub.title,
                        isactive: sub.isactive
                    });

                    // Önce eski dosyaları sil
                    await trx("SubcategoryFiles").where({ subcategory_id: sub.id }).del();

                    // Yeni dosyaları ekle
                    if (Array.isArray(sub.files) && sub.files.length > 0) {
                        const insertFiles = sub.files.map((url) => ({
                            subcategory_id: sub.id,
                            file_url: url
                        }));
                        await trx("SubcategoryFiles").insert(insertFiles);
                    }
                }
            }
        });

        return res.status(200).json({ message: "Kategori güncellendi." });
    } catch (err) {
        console.error("PUT hata:", err);
        return res.status(500).json({
            error: "Kategori güncellenirken hata oluştu",
            details: err.message
        });
    }
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
        return res.status(500).json({
            error: `${req.method} işlemi başarısız`,
            details: error.message,
        });
    }
};

export default withCors(handler);
