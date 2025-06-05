/**
 * @swagger
 * tags:
 *   - name: Pages
 *     description: Tek dilli sayfa işlemleri
 *
 * /api/pages:
 *   get:
 *     summary: Sayfa(lar)ı getir (tekil, liste veya sayfalı)
 *     tags: [Pages]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Sayfa ID'si (verilirse sadece o sayfa döner)
 *       - in: query
 *         name: menu_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Bağlı menü ID'si (varsa filtreleme)
 *       - in: query
 *         name: link
 *         required: false
 *         schema:
 *           type: string
 *         description: Sayfa linkine göre filtreleme (örn. /hakkimizda)
 *       - in: query
 *         name: submenu_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Bağlı alt menü ID'si (varsa filtreleme)
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
 *         description: Sayfa(lar) başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/PageResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PageResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalPagesCount:
 *                           type: integer
 *                         currentPage:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         currentPageCount:
 *                           type: integer
 *
 *   post:
 *     summary: Yeni sayfa oluştur
 *     tags: [Pages]
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
 *         description: Sayfa başarıyla oluşturuldu
 *
 *   put:
 *     summary: Sayfa güncelle
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek sayfanın ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PageInput'
 *     responses:
 *       200:
 *         description: Sayfa başarıyla güncellendi
 *
 *   delete:
 *     summary: Sayfa sil
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek sayfanın ID'si
 *     responses:
 *       200:
 *         description: Sayfa başarıyla silindi
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     PageInput:
 *       type: object
 *       required:
 *         - link
 *         - isactive
 *         - meta_title
 *         - page_title
 *         - meta_keywords
 *         - meta_description
 *         - content
 *       properties:
 *         menu_id:
 *           type: integer
 *         submenu_id:
 *           type: integer
 *         link:
 *           type: string
 *           example: "/hakkimizda"
 *         isactive:
 *           type: boolean
 *           example: true
 *         meta_title:
 *           type: string
 *           example: "Hakkımızda"
 *         page_title:
 *           type: string
 *           example: "Hakkımızda Sayfası"
 *         meta_keywords:
 *           type: string
 *           example: "hakkımızda, tanıtım"
 *         meta_description:
 *           type: string
 *           example: "Kurumsal tanıtım sayfamız"
 *         content:
 *           type: string
 *           example: "<p>İçerik HTML formatında olabilir</p>"
 *
 *     PageResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         menu_id:
 *           type: integer
 *         submenu_id:
 *           type: integer
 *         link:
 *           type: string
 *         isactive:
 *           type: boolean
 *         meta_title:
 *           type: string
 *         page_title:
 *           type: string
 *         meta_keywords:
 *           type: string
 *         meta_description:
 *           type: string
 *         content:
 *           type: string
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
      const menuIdParam = req.query.menu_id;
      const submenuIdParam = req.query.submenu_id;
      const linkParam = req.query.link;

      const pageSize = parseInt(req.query.pageSize) || 10;
      const currentPage = parseInt(req.query.currentPage) || 1;
      const offset = (currentPage - 1) * pageSize;

      const id = idParam ? parseInt(idParam) : null;
      const menu_id = menuIdParam ? parseInt(menuIdParam) : null;
      const submenu_id = submenuIdParam ? parseInt(submenuIdParam) : null;
      const link = linkParam ? decodeURIComponent(linkParam) : null;

      let pagesQuery = db("Pages").orderBy("id", "desc");

      if (id) {
        pagesQuery = pagesQuery.where({ id });
      } else if (menu_id) {
        pagesQuery = pagesQuery.where({ menu_id });
      } else if (submenu_id) {
        pagesQuery = pagesQuery.where({ submenu_id });
      } else if (link) {
        pagesQuery = pagesQuery.where({ link });
      } else {
        pagesQuery = pagesQuery.limit(pageSize).offset(offset);
      }

      const pages = await pagesQuery;

      if (!pages || pages.length === 0) {
        return res.status(404).json({ error: "Sayfa bulunamadı" });
      }

      // Sayı hesaplama
      const totalCountQuery = db("Pages");
      if (menu_id) {
        totalCountQuery.where({ menu_id });
      } else if (submenu_id) {
        totalCountQuery.where({ submenu_id });
      } else if (link) {
        totalCountQuery.where({ link });
      }

      const totalCountResult = await totalCountQuery.count("id as count").first();
      const totalCount = Number(totalCountResult?.count || 0);

      return res.status(200).json({
        data: id ? pages[0] : pages,
        pagination: !id
          ? {
              totalPagesCount: Math.ceil(totalCount / pageSize),
              currentPage,
              pageSize,
              currentPageCount: pages.length,
            }
          : undefined,
      });
    } catch (err) {
      console.error("[GET /pages]", err);
      return res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST
  else if (req.method === "POST") {
    const {
      menu_id,
      submenu_id,
      link,
      isactive,
      meta_title,
      page_title,
      meta_keywords,
      meta_description,
      content,
    } = req.body;

    if (!link || (!menu_id && !submenu_id) || !page_title || !meta_title) {
      return res.status(400).json({
        error: "Eksik veya geçersiz alanlar (menu_id veya submenu_id zorunlu)",
      });
    }

    try {
      await db("Pages").insert({
        menu_id: menu_id || null,
        submenu_id: submenu_id || null,
        link,
        isactive,
        meta_title,
        page_title,
        meta_keywords,
        meta_description,
        content,
      });

      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /pages]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    const {
      menu_id,
      submenu_id,
      link,
      isactive,
      meta_title,
      page_title,
      meta_keywords,
      meta_description,
      content,
    } = req.body;

    if (!link || (!menu_id && !submenu_id) || !page_title || !meta_title) {
      return res.status(400).json({
        error: "Eksik veya geçersiz alanlar (menu_id veya submenu_id zorunlu)",
      });
    }

    try {
      const updatedCount = await db("Pages").where({ id }).update({
        menu_id: menu_id || null,
        submenu_id: submenu_id || null,
        link,
        isactive,
        meta_title,
        page_title,
        meta_keywords,
        meta_description,
        content,
      });

      if (updatedCount === 0) {
        return res.status(404).json({ error: "Sayfa bulunamadı" });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /pages]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE
  else if (req.method === "DELETE") {
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Geçerli bir sayfa ID’si gerekli" });
    }

    try {
      const deletedCount = await db("Pages").where({ id }).del();

      if (deletedCount === 0) {
        return res.status(404).json({ error: "Sayfa bulunamadı" });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /pages]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  // Unsupported
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
