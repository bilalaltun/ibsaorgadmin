/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Team Members API
 *   version: 1.0.0
 *   description: Takım üyeleri CRUD işlemleri
 *
 * tags:
 *   - name: TeamMembers
 *     description: Takım üyeleri işlemleri
 *
 * paths:
 *   /api/teammembers:
 *     get:
 *       summary: Takım üyelerini getir (liste veya ID ile detay)
 *       tags: [TeamMembers]
 *       parameters:
 *         - in: query
 *           name: id
 *           required: false
 *           schema:
 *             type: integer
 *           description: Üye ID'si (verilirse sadece o üye döner)
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
 *           description: Üye(ler) getirildi
 *           content:
 *             application/json:
 *               schema:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/TeamMemberResponse'
 *                   - type: object
 *                     properties:
 *                       data:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/TeamMemberResponse'
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
 *       summary: Yeni takım üyesi ekle
 *       tags: [TeamMembers]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamMemberInput'
 *       responses:
 *         201:
 *           description: Üye eklendi
 *
 *     put:
 *       summary: Takım üyesini güncelle
 *       tags: [TeamMembers]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Güncellenecek üyenin ID'si
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamMemberInput'
 *       responses:
 *         200:
 *           description: Üye güncellendi
 *
 *     delete:
 *       summary: Takım üyesini sil
 *       tags: [TeamMembers]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Silinecek üyenin ID'si
 *       responses:
 *         200:
 *           description: Üye silindi
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     TeamMemberInput:
 *       type: object
 *       required:
 *         - name
 *         - position
 *         - email
 *         - isactive
 *       properties:
 *         name:
 *           type: string
 *           example: "Ayşe Yılmaz"
 *         position:
 *           type: string
 *           example: "Yazılım Mühendisi"
 *         email:
 *           type: string
 *           example: "ayse@example.com"
 *         photo_url:
 *           type: string
 *           example: "/uploads/ayse.jpg"
 *         flag_url:
 *           type: string
 *           example: "/flags/tr.png"
 *         isactive:
 *           type: boolean
 *           example: true
 *
 *     TeamMemberResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/TeamMemberInput'
 *         - type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             created_at:
 *               type: string
 *               format: date-time
 *               example: "2025-06-05T08:00:00Z"
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
      const { pageSize = 1000, currentPage = 1 } = req.query;
      const pageInt = Math.max(parseInt(pageSize), 1);
      const currentPageInt = Math.max(parseInt(currentPage), 1);

      if (id) {
        const member = await db("TeamMembers").where({ id }).first();
        if (!member) return res.status(404).json({ error: "Kayıt bulunamadı" });
        return res.status(200).json(member);
      }

      const total = await db("TeamMembers").count("* as count").first();
      const totalCount = total?.count || 0;

      const members = await db("TeamMembers")
        .orderBy("id", "desc")
        .limit(pageInt)
        .offset((currentPageInt - 1) * pageInt);

      return res.status(200).json({
        data: members,
        pagination: {
          pageSize: pageInt,
          currentPage: currentPageInt,
          total: totalCount,
          totalPages: Math.ceil(totalCount / pageInt),
        },
      });
    } catch (err) {
      console.error("[GET /teammembers]", err);
      return res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

// POST
else if (req.method === "POST") {
  const {
    name,
    position,
    email,
    photo_url = null,
    flag_url = null,
    isactive = true,
  } = req.body;

  try {
    await db("TeamMembers").insert({
      name,
      position,
      email,
      photo_url,
      flag_url,
      isactive,
      created_at: new Date(),
    });

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error("[POST /team-members]", err);
    return res.status(500).json({
      error: "POST failed",
      details: err.message,
    });
  }
}


// PUT
else if (req.method === "PUT") {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID gerekli" });
  }

  const {
    name,
    position,
    email,
    photo_url = null,
    flag_url = null,
    isactive = true,
  } = req.body;

  if (!name || !position || !email) {
    return res.status(400).json({
      error: "name, position ve email alanları zorunludur.",
    });
  }

  try {
    await db("TeamMembers")
      .where({ id })
      .update({
        name,
        position,
        email,
        photo_url,
        flag_url,
        isactive,
      });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[PUT /team-members]", err);
    return res
      .status(500)
      .json({ error: "PUT failed", details: err.message });
  }
}


  // DELETE
  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      await db("TeamMembers").where({ id }).del();
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /teammembers]", err);
      return res.status(500).json({ error: "DELETE failed" });
    }
  }

  // METHOD NOT ALLOWED
  else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);




