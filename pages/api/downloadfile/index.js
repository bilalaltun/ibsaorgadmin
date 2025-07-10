/**
 * @swagger
 * /api/downloadfile:
 *   get:
 *     summary: Tüm sayfa kategorilerini ve dosyalarını getir
 *     tags: [DownloadFile]
 *     responses:
 *       200:
 *         description: Sayfa, kategori ve dosya yapısı döner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PageStructure'
 *
 *   post:
 *     summary: Yeni sayfa oluştur
 *     tags: [DownloadFile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PageInput'
 *     responses:
 *       201:
 *         description: Sayfa eklendi
 *
 *   put:
 *     summary: Sayfa güncelle
 *     tags: [DownloadFile]
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
 *             $ref: '#/components/schemas/PageInput'
 *     responses:
 *       200:
 *         description: Sayfa güncellendi
 *
 *   delete:
 *     summary: Sayfa sil
 *     tags: [DownloadFile]
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
 *         description: Sayfa silindi
 *
 * components:
 *   schemas:
 *     File:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         fileurl:
 *           type: string
 *
 *     Category:
 *       type: object
 *       properties:
 *         Title:
 *           type: string
 *         Files:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/File'
 *
 *     PageStructure:
 *       type: object
 *       properties:
 *         Pages:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               CategoryTab:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Category'
 *
 *     PageInput:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *         isactive:
 *           type: boolean
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
    const { name } = req.query;

    let pagesQuery = db("Pagess").where({ isactive: true });

    if (name && typeof name === "string") {
      pagesQuery = pagesQuery.andWhere("name", name);
    }

    const pages = await pagesQuery;

    const result = await Promise.all(
      pages.map(async (page) => {
        const categories = await db("PageCategories").where({ page_id: page.id });
        const CategoryTab = await Promise.all(
          categories.map(async (cat) => {
            const files = await db("PageFiles").where({ category_id: cat.id });
            return {
              Title: cat.title,
              Files: files.map((f) => ({
                title: f.title,
                fileurl: f.fileurl,
              })),
            };
          })
        );
        return {
          name: page.name,
          CategoryTab,
        };
      })
    );

    res.status(200).json({ Pages: result });
  } catch (err) {
    console.error("[GET /downloadfile]", err);
    res.status(500).json({ error: "GET failed", details: err.message });
  }
}


  // POST
  // POST (tekil ya da array)
  else if (req.method === "POST") {
    const input = req.body;

    // Eğer dizi olarak geldiyse
    if (Array.isArray(input)) {
      try {
        const validItems = input.filter(p => p.name && typeof p.name === "string");
        if (!validItems.length) return res.status(400).json({ error: "Geçerli sayfa verisi yok" });

        await db("Pagess").insert(validItems);
        return res.status(201).json({ success: true, count: validItems.length });
      } catch (err) {
        console.error("[POST /downloadfile - array]", err);
        return res.status(500).json({ error: "POST failed", details: err.message });
      }
    }

    // Tekil obje geldiyse
    const { name, isactive = true } = input;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "name alanı zorunludur ve string olmalıdır" });
    }

    try {
      await db("Pagess").insert({ name, isactive });
      return res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /downloadfile - single]", err);
      return res.status(500).json({ error: "POST failed", details: err.message });
    }
  }


  // PUT
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });
    const { name, isactive } = req.body;

    try {
      const updated = await db("Pagess").where({ id }).update({ name, isactive });
      if (!updated) return res.status(404).json({ error: "Sayfa bulunamadı" });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /downloadfile]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE
  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      const deleted = await db("Pagess").where({ id }).del();
      if (!deleted) return res.status(404).json({ error: "Sayfa bulunamadı" });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /downloadfile]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  // Unsupported
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
