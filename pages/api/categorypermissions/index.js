/**
 * @swagger
 * /api/categorypermissions:
 *   get:
 *     summary: Bir kullanıcının kategoriye özel izinlerini getir *
 *     tags: [CategoryPermissions]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kullanıcının ID'si *
 *     responses:
 *       200:
 *         description: Kullanıcının yetkileri listelendi *
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoryPermission'
 *
 *   post:
 *     summary: Yeni kategori yetkisi ata *
 *     tags: [CategoryPermissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryPermissionInput'
 *     responses:
 *       201:
 *         description: Yetki başarıyla atandı *
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
 *     summary: Kategori yetkisini güncelle *
 *     tags: [CategoryPermissions]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek izin kaydının ID'si *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               can_create:
 *                 type: boolean
 *               can_read:
 *                 type: boolean
 *               can_update:
 *                 type: boolean
 *               can_delete:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Güncelleme başarılı *
 *
 *   delete:
 *     summary: Kategori yetkisini sil *
 *     tags: [CategoryPermissions]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek izin kaydının ID'si *
 *     responses:
 *       200:
 *         description: Yetki başarıyla silindi *
 *
 * components:
 *   schemas:
 *     CategoryPermission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         category_id:
 *           type: integer
 *           example: 5
 *         category_name:
 *           type: string
 *           example: Teknoloji
 *         can_create:
 *           type: boolean
 *           example: true
 *         can_read:
 *           type: boolean
 *           example: true
 *         can_update:
 *           type: boolean
 *           example: false
 *         can_delete:
 *           type: boolean
 *           example: false
 *
 *     CategoryPermissionInput:
 *       type: object
 *       required:
 *         - user_id
 *         - category_id
 *       properties:
 *         user_id:
 *           type: integer
 *           example: 3
 *         category_id:
 *           type: integer
 *           example: 5
 *         can_create:
 *           type: boolean
 *           default: false
 *         can_read:
 *           type: boolean
 *           default: false
 *         can_update:
 *           type: boolean
 *           default: false
 *         can_delete:
 *           type: boolean
 *           default: false
 */


import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    try {
      await verifyToken(req);
      if (!req.user || req.user.role !== "superadmin") {
        return res.status(403).json({ error: "Sadece superadmin işlem yapabilir" });
      }
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  // GET: Belirli kullanıcının izinlerini getir
  if (req.method === "GET") {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "user_id gerekli" });

    try {
      const permissions = await db("Permissions")
        .join("Categories", "Permissions.category_id", "Categories.id")
        .where("Permissions.user_id", user_id)
        .select(
          "Permissions.id",
          "Permissions.category_id",
          "Categories.name as category_name",
          "Permissions.can_create",
          "Permissions.can_read",
          "Permissions.can_update",
          "Permissions.can_delete"
        );

      if (!permissions || permissions.length === 0) {
        return res.status(404).json({ error: 'Veri bulunamadı' });
      }

      res.status(200).json(permissions);
    } catch (err) {
      console.error("[GET /categorypermissions]", err);
      res.status(500).json({ error: "GET failed" });
    }
  }

  // POST: Yeni yetki ata
  else if (req.method === "POST") {
    const {
      user_id,
      category_id,
      can_create = false,
      can_read = false,
      can_update = false,
      can_delete = false,
    } = req.body;

    if (!user_id || !category_id) {
      return res.status(400).json({ error: "user_id ve category_id zorunludur" });
    }

    try {
      await db("Permissions").insert({
        user_id,
        category_id,
        can_create,
        can_read,
        can_update,
        can_delete,
      });

      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /categorypermissions]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }


  //PUT
else if (req.method === "PUT") {
  const { can_create, can_read, can_update, can_delete } = req.body;
  const { id } = req.query; // Now fetching ID from query

  if (!id) return res.status(400).json({ error: "ID query parametresi gerekli" });

  try {
    await db("Permissions").where({ id }).update({
      can_create,
      can_read,
      can_update,
      can_delete,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("[PUT /categorypermissions]", err);
    res.status(500).json({ error: "PUT failed", details: err.message });
  }
}


  // DELETE: Yetkiyi kaldır
  else if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      await db("Permissions").where({ id }).del();
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /categorypermissions]", err);
      res.status(500).json({ error: "DELETE failed" });
    }
  }

  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
