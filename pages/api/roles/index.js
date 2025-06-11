/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Roller listesini getir (veya ID ile tek rol)
 *     tags: [Roles]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Rol ID’si (verilirse sadece o rol döner)
 *     responses:
 *       200:
 *         description: Roller başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Role'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Role'
 *
 *   post:
 *     summary: Yeni rol oluştur
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleInput'
 *     responses:
 *       201:
 *         description: Rol başarıyla oluşturuldu
 *
 *   put:
 *     summary: Mevcut rolü güncelle
 *     tags: [Roles]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek rol ID’si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleInput'
 *     responses:
 *       200:
 *         description: Rol başarıyla güncellendi
 *
 *   delete:
 *     summary: Rolü sil
 *     tags: [Roles]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek rol ID’si
 *     responses:
 *       200:
 *         description: Rol başarıyla silindi
 *
 * components:
 *   schemas:
 *     Role:
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
 *
 *     RoleInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         isactive:
 *           type: boolean
 *           default: true
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const id = req.query.id ? parseInt(req.query.id) : null;

  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    try {
      await verifyToken(req); 
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  if (req.method === "GET") {
    try {
      const query = db("Roles");
      if (id) query.andWhere("id", id);
      const roles = await query.select("id", "name", "isactive", "created_at");
      res.status(200).json(id ? roles[0] : roles);
    } catch (err) {
      console.error("[GET /roles]", err);
      res.status(500).json({ error: "GET failed" });
    }
  }

  else if (req.method === "POST") {
    const { name, isactive = true } = req.body;

    if (!name) return res.status(400).json({ error: "Rol adı gerekli" });

    try {
      await db("Roles").insert({ name, isactive });
      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /roles]", err);
      res.status(500).json({ error: "POST failed" });
    }
  }

  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });
    const { name, isactive } = req.body;

    try {
      await db("Roles").where({ id }).update({ name, isactive });
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /roles]", err);
      res.status(500).json({ error: "PUT failed" });
    }
  }

  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      await db("Roles").where({ id }).del();
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /roles]", err);
      res.status(500).json({ error: "DELETE failed" });
    }
  }

  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
