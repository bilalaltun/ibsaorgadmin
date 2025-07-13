/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Menu API
 *   version: 1.0.0
 *   description: Tek dilli menü ve alt menü işlemleri
 *
 * tags:
 *   - name: Menus
 *     description: Menü işlemleri
 *
 * paths:
 *   /api/menus:
 *     get:
 *       summary: Menüleri getir (liste veya ID ile detay)
 *       tags: [Menus]
 *       parameters:
 *         - in: query
 *           name: id
 *           required: false
 *           schema:
 *             type: integer
 *           description: Menü ID'si (verilirse sadece o menü döner)
 *         - in: query
 *           name: pageSize
 *           required: false
 *           schema:
 *             type: integer
 *             default: 10
 *           description: Sayfa başına kayıt sayısı
 *         - in: query
 *           name: currentPage
 *           required: false
 *           schema:
 *             type: integer
 *             default: 1
 *           description: Sayfa numarası
 *       responses:
 *         200:
 *           description: Menü(ler) getirildi
 *           content:
 *             application/json:
 *               schema:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/MenuResponse'
 *                   - type: object
 *                     properties:
 *                       data:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/MenuResponse'
 *                       pagination:
 *                         type: object
 *                         properties:
 *                           pageSize:
 *                             type: integer
 *                             example: 10
 *                           currentPage:
 *                             type: integer
 *                             example: 1
 *                           total:
 *                             type: integer
 *                             example: 50
 *                           totalPages:
 *                             type: integer
 *                             example: 5
 *
 *     post:
 *       summary: Yeni menü ekle
 *       tags: [Menus]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MenuInput'
 *       responses:
 *         201:
 *           description: Menü eklendi
 *
 *     put:
 *       summary: Menü güncelle
 *       tags: [Menus]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Güncellenecek menü ID'si
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MenuInput'
 *       responses:
 *         200:
 *           description: Menü güncellendi
 *
 *     delete:
 *       summary: Menü sil
 *       tags: [Menus]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Silinecek menü ID'si
 *       responses:
 *         200:
 *           description: Menü silindi
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     SubmenuItem:
 *       type: object
 *       required:
 *         - url
 *         - isactive
 *         - title
 *       properties:
 *         url:
 *           type: string
 *           example: "/congress"
 *         isactive:
 *           type: boolean
 *           example: true
 *         title:
 *           type: string
 *           example: "Alt Menü Başlığı"
 *
 *     MenuInput:
 *       type: object
 *       required:
 *         - url
 *         - isactive
 *         - title
 *       properties:
 *         url:
 *           type: string
 *           example: "/main-link"
 *         isactive:
 *           type: boolean
 *           example: true
 *         title:
 *           type: string
 *           example: "Ana Menü"
 *         submenus:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubmenuItem'
 *
 *     MenuResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/MenuInput'
 *         - type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
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

  //GET
if (req.method === 'GET') {
  try {
    const pageSize = parseInt(req.query.pageSize) || 1000;
    const currentPage = parseInt(req.query.currentPage) || 1;
    const offset = (currentPage - 1) * pageSize;

    let menus, totalCount;

    if (id) {
      menus = await db('Menus').where({ id });
      totalCount = menus.length;
    } else {
      totalCount = await db('Menus').count('* as count').first();
      menus = await db('Menus')
        .orderBy('id', 'desc') 
        .limit(pageSize)
        .offset(offset);
    }

    if (!menus || menus.length === 0) {
      return res.status(404).json({ error: 'Menü bulunamadı' });
    }

    const submenuItems = await db('Submenus');

    const result = menus.map((menu) => {
      const submenus = submenuItems
        .filter(sub => sub.menu_id === menu.id)
        .map(sub => ({
          id: sub.id,
          url: sub.url,
          isactive: sub.isactive,
          title: sub.title || ""
        }));

      return {
        id: menu.id,
        url: menu.url,
        isactive: menu.isactive,
        title: menu.title || "",
        submenus
      };
    });

    const safeJson = JSON.parse(JSON.stringify(id ? result[0] : {
      data: result,
      pagination: {
        pageSize,
        currentPage,
        total: totalCount?.count || 0,
        totalPages: Math.ceil((totalCount?.count || 0) / pageSize)
      }
    }));

    return res.status(200).json(safeJson);
  } catch (err) {
    console.error('[GET /menus]', err);
    return res.status(500).json({ error: 'GET failed', details: err.message });
  }
}

  // POST
  if (req.method === "POST") {
    try {
      verifyToken(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }

    const { url, isactive, title, submenus } = req.body;

    if (!url || typeof isactive !== "boolean" || typeof title !== "string") {
      return res.status(400).json({ error: "Eksik veya geçersiz alanlar" });
    }

    try {
      await db.transaction(async (trx) => {
        const [menuIdRow] = await trx("Menus").insert({ url, isactive, title }).returning("id");
        const menuId = menuIdRow.id;

        if (Array.isArray(submenus)) {
          for (const submenu of submenus) {
            const { url: subUrl, isactive: subActive, title: subTitle } = submenu;

            if (!subUrl || typeof subActive !== "boolean" || typeof subTitle !== "string") {
              throw new Error("Alt menü yapısı hatalı");
            }

            await trx("Submenus").insert({
              menu_id: menuId,
              url: subUrl,
              isactive: subActive,
              title: subTitle
            });
          }
        }
      });

      return res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /menus]", err);
      return res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT
  if (req.method === "PUT") {
    try {
      verifyToken(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }

    if (!id) return res.status(400).json({ error: "Güncellenecek ID belirtilmedi" });

    const { url, isactive, title, submenus } = req.body;

    if (!url || typeof isactive !== "boolean" || typeof title !== "string") {
      return res.status(400).json({ error: "Eksik veya geçersiz alanlar" });
    }

    try {
      await db.transaction(async (trx) => {
        await trx("Menus").where({ id }).update({ url, isactive, title });

        await trx("Submenus").where({ menu_id: id }).del();

        if (Array.isArray(submenus)) {
          for (const submenu of submenus) {
            const { url: subUrl, isactive: subActive, title: subTitle } = submenu;

            if (!subUrl || typeof subActive !== "boolean" || typeof subTitle !== "string") {
              throw new Error("Alt menü yapısı hatalı");
            }

            await trx("Submenus").insert({
              menu_id: id,
              url: subUrl,
              isactive: subActive,
              title: subTitle
            });
          }
        }
      });

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /menus]", err);
      return res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE
  if (req.method === "DELETE") {
    try {
      verifyToken(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }

    if (!id) return res.status(400).json({ error: "Silinecek ID belirtilmedi" });

    try {
      await db.transaction(async (trx) => {
        await trx("Submenus").where({ menu_id: id }).del();
        await trx("Menus").where({ id }).del();
      });

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /menus]", err);
      return res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
};

export default withCors(handler);
