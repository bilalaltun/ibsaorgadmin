/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Kullanıcıları getir (tüm liste veya ID ile detay)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: Kullanıcı ID'si (verilirse sadece o kullanıcı döner)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Sayfa başına gösterilecek kullanıcı sayısı
 *       - in: query
 *         name: currentPage
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Görüntülenecek sayfa numarası
 *     responses:
 *       200:
 *         description: Kullanıcı(lar) başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/UserWithRole'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserWithRole'
 *
 *   post:
 *     summary: Yeni kullanıcı oluştur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla eklendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *   put:
 *     summary: Kullanıcı bilgilerini güncelle
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek kullanıcının ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       200:
 *         description: Güncelleme başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *   delete:
 *     summary: Kullanıcı sil
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek kullanıcı ID’si
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 * components:
 *   schemas:
 *     UserWithRole:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: johndoe
 *         password:
 *           type: string
 *           example: johndoe@1
 *           writeOnly: true
 *         isactive:
 *           type: boolean
 *           example: true
 *         date:
 *           type: string
 *           format: date
 *           example: 2025-06-11
 *         role:
 *           type: string
 *           example: admin
 *
 *     UserInput:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - isactive
 *       properties:
 *         username:
 *           type: string
 *           example: johndoe
 *         password:
 *           type: string
 *           example: johndoe@1
 *         isactive:
 *           type: boolean
 *           example: true
 *         role_id:
 *           type: integer
 *           example: 1
 *           description: İlgili role tablosundaki ID (opsiyonel)
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const id = req.query.id ? parseInt(req.query.id) : null;

  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    try {
      await verifyToken(req); // req.user ayarlanmalı
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  // GET
  if (req.method === "GET") {
    try {
      const currentPage = parseInt(req.query.currentPage || "1");
      const pageSize = parseInt(req.query.pageSize || "1000");

      let usersQuery = db("Users").orderBy("date", "desc");

      if (id) {
        usersQuery = usersQuery.where({ id });
      } else {
        const offset = (currentPage - 1) * pageSize;
        usersQuery = usersQuery.offset(offset).limit(pageSize);
      }

      const users = await usersQuery;

      if (!users || users.length === 0) {
        return res.status(200).json([]);
      }

      // Kullanıcı rollerini çek
      const userIds = users.map((u) => u.id);
      const roles = await db("UserRoles")
        .join("Roles", "UserRoles.role_id", "Roles.id")
        .whereIn("UserRoles.user_id", userIds)
        .select("UserRoles.user_id", "Roles.name as role");

      const result = users.map((user) => {
        const userRole = roles.find((r) => r.user_id === user.id);
        return {
          id: user.id,
          username: user.username,
          password: user.password,
          isactive: user.isactive,
          date: user.date,
          role: userRole?.role || null,
        };
      });

      res.status(200).json(id ? result[0] : result);
    } catch (err) {
      console.error("[GET /users]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST
  else if (req.method === "POST") {
    const { username, password, isactive, role_id } = req.body;

    try {
      const userId = await db.transaction(async (trx) => {
        // Kullanıcıyı oluştur
        const [newUserId] = await trx("Users")
          .insert({
            username,
            password,
            isactive,
            date: new Date(),
          })
          .returning("id"); // Yeni oluşturulan ID'yi al

        if (role_id) {
          // Eğer rol varsa, UserRoles tablosuna da ekle
          await trx("UserRoles").insert({ user_id: newUserId.id, role_id });
        }

        return newUserId.id; // Yeni kullanıcı ID'sini döndür
      });

      // Başarıyla kullanıcı oluşturuldu, ID'yi yanıt olarak gönder
      res.status(201).json({ success: true, userId });
    } catch (err) {
      console.error("[POST /users]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }
  // PUT
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    const { username, password, isactive, date, role_id } = req.body;

    try {
      await db.transaction(async (trx) => {
        await trx("Users")
          .where({ id })
          .update({ username, password, isactive, date });

        if (role_id) {
          const exists = await trx("UserRoles").where({ user_id: id }).first();
          if (exists) {
            await trx("UserRoles").where({ user_id: id }).update({ role_id });
          } else {
            await trx("UserRoles").insert({ user_id: id, role_id });
          }
        }
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /users]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE
  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      await db("Users").where({ id }).del(); // CASCADE ile UserRoles de silinir
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /users]", err);
      res.status(500).json({ error: "DELETE failed" });
    }
  }

  // Method not allowed
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
