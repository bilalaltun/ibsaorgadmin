/**
 * @swagger
 * /api/user-roles:
 *   get:
 *     summary: Kullanıcının rollerini getir
 *     tags: [UserRoles]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Belirli kullanıcı ID’si (isteğe bağlı)
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Belirli rol ID’si (isteğe bağlı)
 *     responses:
 *       200:
 *         description: Atanan roller listelendi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserRole'
 *
 *   post:
 *     summary: Kullanıcıya rol ata
 *     tags: [UserRoles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRoleInput'
 *     responses:
 *       201:
 *         description: Rol başarıyla atandı
 *
 *   put:
 *     summary: Kullanıcı rolünü güncelle
 *     tags: [UserRoles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - new_role_id
 *             properties:
 *               id:
 *                 type: integer
 *               new_role_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Kullanıcı rolü başarıyla güncellendi
 *
 *   delete:
 *     summary: Kullanıcıdan rolü kaldır
 *     tags: [UserRoles]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Kullanıcı ID’si
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Silinecek rol ID’si
 *     responses:
 *       200:
 *         description: Rol başarıyla silindi
 *
 * components:
 *   schemas:
 *     UserRole:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         role_id:
 *           type: integer
 *         role_name:
 *           type: string
 *
 *     UserRoleInput:
 *       type: object
 *       required:
 *         - user_id
 *         - role_id
 *       properties:
 *         user_id:
 *           type: integer
 *         role_id:
 *           type: integer
 */


import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const { user_id, role_id } = req.query;

  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    try {
      await verifyToken(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  // GET: Belirli kullanıcıya atanmış rolleri getir
  if (req.method === "GET") {
    try {
      const query = db("UserRoles")
        .join("Roles", "UserRoles.role_id", "Roles.id")
        .select("UserRoles.id", "UserRoles.user_id", "Roles.id as role_id", "Roles.name as role_name");

      if (user_id) query.where("UserRoles.user_id", user_id);
      if (role_id) query.where("UserRoles.role_id", role_id);

      const roles = await query;
      res.status(200).json(roles);
    } catch (err) {
      console.error("[GET /user-roles]", err);
      res.status(500).json({ error: "GET failed" });
    }
  }

  // POST: Kullanıcıya rol ata
  else if (req.method === "POST") {
    const { user_id, role_id } = req.body;
    if (!user_id || !role_id) return res.status(400).json({ error: "user_id ve role_id gerekli" });

    try {
      await db("UserRoles").insert({ user_id, role_id });
      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /user-roles]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT: Var olan rolü başka bir rolle değiştir
  else if (req.method === "PUT") {
    const { id, new_role_id } = req.body;
    if (!id || !new_role_id) return res.status(400).json({ error: "id ve new_role_id gerekli" });

    try {
      await db("UserRoles").where({ id }).update({ role_id: new_role_id });
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /user-roles]", err);
      res.status(500).json({ error: "PUT failed" });
    }
  }

  // DELETE: Rolü kullanıcıdan kaldır
  else if (req.method === "DELETE") {
    if (!user_id || !role_id) return res.status(400).json({ error: "user_id ve role_id gerekli" });

    try {
      await db("UserRoles").where({ user_id, role_id }).del();
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /user-roles]", err);
      res.status(500).json({ error: "DELETE failed" });
    }
  }

  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
