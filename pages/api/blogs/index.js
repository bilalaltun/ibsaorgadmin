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
 *           example : "2025-06-05"
 *           format: date
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
 *         category:
 *           type: string
 *           example: "Endüstri 4.0"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *           - "mizrak"
 *           - "cnc"
 *           - "üretim"
 *           - "endüstri"
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
 *         category:
 *           type: string
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
    const { id, link, pageSize = 10, currentPage = 1 } = req.query;
    const pageInt = Math.max(parseInt(pageSize), 1);         // en az 1
    const currentPageInt = Math.max(parseInt(currentPage), 1); // en az 1

    let blog;

    if (id || link) {
      blog = id
        ? await db("Blogs").where({ id }).first()
        : await db("Blogs").where({ link }).first();

      if (!blog) return res.status(404).json({ error: "Blog bulunamadı" });

      const tags = await db("BlogTags").where({ blog_id: blog.id });

      return res.status(200).json({
        id: blog.id,
        link: blog.link,
        thumbnail: blog.thumbnail,
        date: blog.date,
        author: blog.author,
        title: blog.title,
        details: blog.details,
        content: blog.content,
        category: blog.category,
        isactive: blog.isactive,
        show_at_home: blog.show_at_home,
        tags: tags.map(t => t.tag),
      });
    }

    const total = await db("Blogs").count("* as count").first();
    const totalCount = total?.count || 0;
    const totalPages = Math.ceil(totalCount / pageInt);

    const blogs = await db("Blogs")
      .orderBy("date", "desc")
      .limit(pageInt)
      .offset((currentPageInt - 1) * pageInt);

    const allTags = await db("BlogTags");

    const data = blogs.map((blog) => ({
      id: blog.id,
      link: blog.link,
      thumbnail: blog.thumbnail,
      date: blog.date,
      author: blog.author,
      title: blog.title,
      details: blog.details,
      content: blog.content,
      category: blog.category,
      isactive: blog.isactive,
      show_at_home: blog.show_at_home,
      tags: allTags
        .filter(t => t.blog_id === blog.id)
        .map(t => t.tag),
    }));

    return res.status(200).json({
      data,
      pagination: {
        pageSize: pageInt,
        currentPage: currentPageInt,
        total: totalCount,
        totalPages,
      },
    });
  } catch (err) {
    console.error("[GET /blogs]", err);
    res.status(500).json({ error: "GET failed", details: err.message });
  }
}

  // POST
  else if (req.method === "POST") {
    const {
      link,
      thumbnail,
      date,
      author,
      title,
      details,
      content,
      category,
      isactive,
      show_at_home,
      tags = [],
    } = req.body;

    try {
      await db.transaction(async (trx) => {
        const rawResult = await trx.raw(
          `INSERT INTO Blogs (link, thumbnail, date, author, title, details, content, category, isactive, show_at_home)
           OUTPUT INSERTED.id VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [link, thumbnail, date, author, title, details, content, category, isactive, show_at_home]
        );

        const blogId = rawResult[0]?.id;
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
      link,
      thumbnail,
      date,
      author,
      title,
      details,
      content,
      category,
      tags = [],
      isactive,
      show_at_home,
    } = req.body;

    try {
      await db.transaction(async (trx) => {
        await trx("Blogs")
          .where({ id })
          .update({ link, thumbnail, date, author, title, details, content, category, isactive, show_at_home });

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
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      await db.transaction(async (trx) => {
        await trx("BlogTags").where({ blog_id: id }).del();
        await trx("Blogs").where({ id }).del();
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /blogs]", err);
      res.status(500).json({ error: "DELETE failed" });
    }
  }

  // Unsupported method
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);


