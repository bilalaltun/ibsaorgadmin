/**
 * @swagger
 * tags:
 *   - name: Blogs
 *     description: Blog işlemleri
 *
 * /api/blogs:
 *   get:
 *     summary: Blogları getir (liste, ID veya link ile detay)
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Blog ID'si (verilirse sadece o blog döner)
 *       - in: query
 *         name: link
 *         required: false
 *         schema:
 *           type: string
 *         description: Blog bağlantı linki (verilirse sadece o blog döner)
 *       - in: query
 *         name: category_id
 *         required: false
 *         style: form
 *         explode: true
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *         description: (Opsiyonel) Birden fazla kategoriye göre filtrelemek için ?category_id=1&category_id=2 şeklinde gönderilebilir
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
 *         description: Blog(lar) getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/BlogResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BlogResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         pageSize:
 *                           type: integer
 *                         currentPage:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *
 *   post:
 *     summary: Yeni blog ekle
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlogInput'
 *     responses:
 *       201:
 *         description: Blog eklendi
 *
 *   put:
 *     summary: Blog güncelle
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek blog ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlogInput'
 *     responses:
 *       200:
 *         description: Blog güncellendi
 *
 *   delete:
 *     summary: Blog sil
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek blog ID'si
 *     responses:
 *       200:
 *         description: Blog silindi
 *
 * components:
 *   schemas:
 *     BlogInput:
 *       type: object
 *       properties:
 *         link:
 *           type: string
 *           example: "ipsa-yeni-cnc-teknolojisi"
 *         thumbnail:
 *           type: string
 *           example: "/uploads/blogs/cnc-teknoloji.jpg"
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-06-05"
 *         author:
 *           type: string
 *           example: "Khanim"
 *         isactive:
 *           type: boolean
 *           example: true
 *         show_at_home:
 *           type: boolean
 *           example: true
 *         title:
 *           type: string
 *           example: "Ipsa-tan Yeni CNC Teknolojisiyle Üretim Devrimi"
 *         details:
 *           type: string
 *           example: "Yeni CNC sistemiyle %30 daha hızlı üretim artık mümkün."
 *         content:
 *           type: string
 *           example: "<p>Ipsa, geliştirdiği yeni CNC teknolojisiyle üretim süreçlerinde devrim yaratıyor. Bu sistem sayesinde enerji tüketimi düşerken, hassasiyet artıyor.</p>"
 *         category_id:
 *           type: integer
 *           example: 1
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - "mizrak"
 *             - "cnc"
 *             - "üretim"
 *             - "endüstri"
 *
 *     BlogResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         link:
 *           type: string
 *         thumbnail:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         author:
 *           type: string
 *         isactive:
 *           type: boolean
 *         show_at_home:
 *           type: boolean
 *         title:
 *           type: string
 *         details:
 *           type: string
 *         content:
 *           type: string
 *         category_id:
 *           type: integer
 *         tags:
 *           type: array
 *           items:
 *             type: string
 */


import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const id = req.query.id ? parseInt(req.query.id) : null;

  if (["GET", "POST", "PUT", "DELETE"].includes(req.method)) {
    try {
      await verifyToken(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }


  const checkPermission = async (userId, categoryId, action) => {
    const permission = await db("Permissions")
      .where({ user_id: userId, category_id: categoryId })
      .first();

    if (!permission) return false;

    return permission[`can_${action}`];
  };


// GET /api/blogs
if (req.method === "GET") {
  try {
    let { id, link, category_id, pageSize = 10, currentPage = 1 } = req.query;

    // category_id'yi normalize et (tekil veya dizi olabilir)
    const categoryIds = Array.isArray(category_id)
      ? category_id.map(id => parseInt(id))
      : category_id
      ? [parseInt(category_id)]
      : [];

    // Sadece superadmin olmayan kullanıcılar için kategori kontrolü
    if (req.user?.role !== "superadmin") {
      if (!categoryIds.length) {
        return res.status(400).json({ error: "En az bir kategori seçilmelidir" });
      }

      // Her kategori için okuma yetkisi kontrolü
      const checks = await Promise.all(
        categoryIds.map(catId => checkPermission(req.user.id, catId, "read"))
      );
      const allAllowed = checks.every(Boolean);

      if (!allAllowed) {
        return res.status(403).json({
          error: "Bazı kategoriler için blog okuma yetkiniz yok.",
        });
      }
    }

    const pageInt = Math.max(parseInt(pageSize), 1);
    const currentPageInt = Math.max(parseInt(currentPage), 1);

    // Tekil blog sorgusu (id veya link ile)
    if (id || link) {
      const blog = id
        ? await db("Blogs").where({ id }).first()
        : await db("Blogs").where({ link }).first();

      if (!blog) {
        return res.status(404).json({ error: "Blog bulunamadı" });
      }

      const tags = await db("BlogTags").where({ blog_id: blog.id });
      const category = blog.category_id
        ? await db("Categories").where({ id: blog.category_id }).first()
        : null;

      return res.status(200).json({
        ...blog,
        category: category ? { id: category.id, name: category.name } : null,
        tags: tags.map(t => t.tag),
      });
    }

    // Çoklu blog listeleme (sayfalama + filtre)
    let query = db("Blogs").orderBy("date", "desc");

    if (categoryIds.length) {
      query = query.whereIn("category_id", categoryIds);
    }

    // MSSQL uyumlu toplam sorgusu (orderBy YOK!)
    const countQuery = db("Blogs");
    if (categoryIds.length) {
      countQuery.whereIn("category_id", categoryIds);
    }
    const totalData = await countQuery.count("* as count").first();

    // Sayfalı blog verisi
    const blogs = await query
      .limit(pageInt)
      .offset((currentPageInt - 1) * pageInt);

    const allTags = await db("BlogTags");
    const allCategories = await db("Categories");

    const filtered = await Promise.all(
      blogs.map(async blog => {
        const category = allCategories.find(c => c.id === blog.category_id);
        return {
          ...blog,
          category: category ? { id: category.id, name: category.name } : null,
          tags: allTags.filter(t => t.blog_id === blog.id).map(t => t.tag),
        };
      })
    );

    return res.status(200).json({
      data: filtered,
      pagination: {
        pageSize: pageInt,
        currentPage: currentPageInt,
        total: totalData.count,
        totalPages: Math.ceil(totalData.count / pageInt),
      },
    });
  } catch (err) {
    console.error("[GET /blogs]", err);
    res.status(500).json({ error: "GET failed", details: err.message });
  }
}



  //POST
  else if (req.method === "POST") {
    const {
      link,
      thumbnail,
      date,
      author,
      title,
      details,
      content,
      category_id,
      isactive,
      show_at_home,
      tags = [],
    } = req.body;

    try {
      // sadece superadmin olmayan kullanıcılar için 
      if (req.user?.role !== "superadmin") {
        if (!category_id) {
          return res.status(400).json({ error: "Kategori seçilmelidir" });
        }

        const allowed = await checkPermission(req.user.id, category_id, "create");
        if (!allowed) {
          return res.status(403).json({
            error: "Bu kategori için blog oluşturma yetkiniz yok.",
          });
        }
      }

      await db.transaction(async (trx) => {
        const rawResult = await trx("Blogs")
          .insert({
            link,
            thumbnail,
            date,
            author,
            title,
            details,
            content,
            category_id,
            isactive,
            show_at_home,
          })
          .returning("id");

        const blogId = rawResult[0]?.id || rawResult[0];
        if (!blogId) throw new Error("Blog ID alınamadı.");

        for (const tag of tags) {
          await trx("BlogTags").insert({ blog_id: blogId, tag });
        }
      });

      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /blogs]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }


  // PUT
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    const {
      link, thumbnail, date, author, title, details, content,
      category_id, tags = [], isactive, show_at_home,
    } = req.body;

    if (req.user?.role !== "superadmin") {
      if (!category_id) {
        return res.status(400).json({ error: "Kategori seçilmelidir" });
      }

      const allowed = await checkPermission(req.user.id, category_id, "read");
      if (!allowed) {
        return res.status(403).json({
          error: "Bu kategori için blog düzenleme yetkiniz yok.",
        });
      }
    }

    try {
      const existing = await db("Blogs").where({ id }).first();
      if (!existing) return res.status(404).json({ error: "Blog bulunamadı" });

      if (req.user?.role !== "superadmin") {
        const allowed = await checkPermission(req.user.id, existing.category_id, "update");
        if (!allowed) return res.status(403).json({ error: "Yetkiniz yok (update)" });
      }

      await db.transaction(async (trx) => {
        await trx("Blogs")
          .where({ id })
          .update({
            link, thumbnail, date, author, title,
            details, content, category_id, isactive, show_at_home
          });

        await trx("BlogTags").where({ blog_id: id }).del();
        for (const tag of tags) {
          await trx("BlogTags").insert({ blog_id: id, tag });
        }
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /blogs]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE
  else if (req.method === "DELETE") {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "ID gerekli" });
    }

    try {
      const blog = await db("Blogs").where({ id }).first();

      if (!blog) {
        return res.status(404).json({ error: "Blog bulunamadı" });
      }

      // 💡 Sadece superadmin değilse izin kontrolü yap
      if (req.user?.role !== "superadmin") {
        const allowed = await checkPermission(req.user.id, blog.category_id, "delete");
        if (!allowed) {
          return res.status(403).json({
            error: "Bu kategoriye ait blogu silme yetkiniz yok.",
          });
        }
      }

      await db.transaction(async (trx) => {
        await trx("BlogTags").where({ blog_id: id }).del();
        await trx("Blogs").where({ id }).del();
      });

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /blogs]", err);
      return res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }
}


export default withCors(handler);

