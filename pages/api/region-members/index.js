/**
 * @swagger
 * tags:
 *   - name: RegionMembers
 *     description: Bölge üyeleri ile ilgili işlemler
 *
 * /api/region-members:
 *   get:
 *     summary: Bölge üyelerini getir (liste veya tekil)
 *     tags: [RegionMembers]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: Üye ID'si (tekil kayıt için)
 *       - in: query
 *         name: region_id
 *         schema:
 *           type: integer
 *         description: Bölge ID'si (sadece o bölgedeki üyeler)
 *     responses:
 *       200:
 *         description: Üyeler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RegionMember'
 *
 *   post:
 *     summary: Yeni bölge üyesi ekle
 *     tags: [RegionMembers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegionMemberInput'
 *     responses:
 *       201:
 *         description: Üye başarıyla eklendi
 *
 *   put:
 *     summary: Üye bilgilerini güncelle
 *     tags: [RegionMembers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek üyenin ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegionMemberInput'
 *     responses:
 *       200:
 *         description: Üye bilgisi güncellendi
 *
 *   delete:
 *     summary: Üye sil
 *     tags: [RegionMembers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek üyenin ID'si
 *     responses:
 *       200:
 *         description: Üye başarıyla silindi
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     RegionMember:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         region_id:
 *           type: integer
 *         name:
 *           type: string
 *         title:
 *           type: string
 *         email:
 *           type: string
 *         flag_url:
 *           type: string
 *         isactive:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     RegionMemberInput:
 *       type: object
 *       required:
 *         - region_id
 *         - name
 *         - title
 *       properties:
 *         region_id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "John Doe"
 *         title:
 *           type: string
 *           example: "Chairperson"
 *         email:
 *           type: string
 *           example: "john@example.com"
 *         flag_url:
 *           type: string
 *           example: "/flags/az.png"
 *         isactive:
 *           type: boolean
 *           example: true
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const { method } = req;
  const id = req.query.id ? parseInt(req.query.id) : null;

  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    try {
      await verifyToken(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  // GET: Tüm üyeler veya tekil üye
  if (method === "GET") {
    try {
      const { region_id, name, title } = req.query;

      if (id) {
        const member = await db("RegionMembers").where({ id }).first();
        if (!member) return res.status(404).json({ error: "Üye bulunamadı" });
        return res.status(200).json(member);
      }

      const query = db("RegionMembers").where(function () {
        if (region_id) this.where("region_id", region_id);
        if (name) this.where("name", "like", `%${name}%`);
        if (title) this.where("title", "like", `%${title}%`);
      });

      const members = await query.orderBy("created_at", "desc");
      return res.status(200).json({ data: members });
    } catch (err) {
      return res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST: Yeni üye oluştur
  if (method === "POST") {
    const { region_id, name, title, email, flag_url, isactive = true } = req.body;

    if (!region_id || !name || !title) {
      return res.status(400).json({ error: "region_id, name ve title zorunludur" });
    }

    try {
      await db("RegionMembers").insert({
        region_id,
        name,
        title,
        email,
        flag_url,
        isactive,
        created_at: new Date(),
      });
      return res.status(201).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT: Üye güncelle
  if (method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID zorunludur" });
    const { region_id, name, title, email, flag_url, isactive } = req.body;

    if (!region_id || !name || !title) {
      return res.status(400).json({ error: "region_id, name ve title zorunludur" });
    }

    try {
      await db("RegionMembers").where({ id }).update({
        region_id,
        name,
        title,
        email,
        flag_url,
        isactive
      });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE: Üye sil
  if (method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID zorunludur" });

    try {
      const deleted = await db("RegionMembers").where({ id }).del();
      if (!deleted) return res.status(404).json({ error: "Silinecek üye bulunamadı" });

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  return res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]).status(405).end();
};

export default withCors(handler);
