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
 *                 - $ref: '#/components/schemas/User'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
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
 *     User:
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
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const id = req.query.id ? parseInt(req.query.id) : null;

   // Sadece bu HTTP metodlarında token kontrolü uygula
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    try {
      verifyToken(req); // Token kontrolü yapılır
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

// GET
if (req.method === "GET") {
  try {
    const id = req.query.id ? parseInt(req.query.id) : null;
    const currentPage = parseInt(req.query.currentPage || "1");
    const pageSize = parseInt(req.query.pageSize || "10");

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

    const result = users.map((user) => ({
      id: user.id,
      username: user.username,
      password: user.password,
      isactive: user.isactive,
      date: user.date,
    }));

    const safeJson = JSON.parse(JSON.stringify(id ? result[0] : result));
    res.status(200).json(safeJson);
  } catch (err) {
    console.error("[GET /users]", err);
    res.status(500).json({ error: "GET failed", details: err.message });
  }
}


  //POST
  else if (req.method === "POST") {
    const { username, password, isactive } = req.body;

    try {
      await db("Users").insert({
        username,
        password,
        isactive,
        date: new Date(),
      });
      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /users]", err);
      res.status(500).json({ error: "POST failed" });
    }
  }

  //PUT
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });
    const { username, password, isactive, date } = req.body;

    try {
      await db("Users")
        .where({ id })
        .update({ username, password, isactive, date });
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /users]", err);
      res.status(500).json({ error: "PUT failed" });
    }
  } else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      await db("Users").where({ id }).del();
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /users]", err);
      res.status(500).json({ error: "DELETE failed" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
