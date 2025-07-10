/**
 * @swagger
 * /api/team:
 *   get:
 *     summary: Tüm takım sayfalarını ve üyeleri getir
 *     tags: [Team]
 *     responses:
 *       200:
 *         description: Sayfalar ve üyeler döndürüldü
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamPageStructure'
 *
 *   post:
 *     summary: Yeni takım sayfası ve üyeleri oluştur
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamPageInput'
 *     responses:
 *       201:
 *         description: Sayfa ve üyeler oluşturuldu
 *
 *   put:
 *     summary: Takım sayfasını güncelle
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Yeni Sayfa Adı
 *               isactive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Sayfa güncellendi
 *
 *   delete:
 *     summary: Takım sayfasını ve üyelerini sil
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sayfa silindi
 *
 * components:
 *   schemas:
 *     TeamMember:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         position:
 *           type: string
 *
 *     TeamPageStructure:
 *       type: object
 *       properties:
 *         Page:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             members:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TeamMember'
 *
 *     TeamPageInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         isactive:
 *           type: boolean
 *         members:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TeamMember'
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
      const pages = await db("CustomTeamPages").where({ isactive: true });

      const result = await Promise.all(
        pages.map(async (page) => {
          const members = await db("CustomTeamMembers").where({ page_id: page.id });
          return {
            Page: {
              name: page.name,
              members: members.map((m) => ({
                name: m.name,
                email: m.email,
                position: m.position,
              })),
            }
          };
        })
      );

      res.status(200).json(result);
    } catch (err) {
      console.error("[GET /team]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST
  else if (req.method === "POST") {
    const { name, isactive = true, members = [] } = req.body;

    if (!name) {
      return res.status(400).json({ error: "name alanı zorunludur" });
    }

    try {
      const [pageId] = await db("CustomTeamPages").insert({ name, isactive }).returning("id");
      const newId = typeof pageId === "object" ? pageId.id : pageId;

      for (const member of members) {
        await db("CustomTeamMembers").insert({
          page_id: newId,
          name: member.name,
          email: member.email,
          position: member.position
        });
      }

      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /team]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT
  else if (req.method === "PUT") {
    const { name, isactive } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: "id ve name zorunludur" });
    }

    try {
      const updated = await db("CustomTeamPages").where({ id }).update({ name, isactive });

      if (!updated) return res.status(404).json({ error: "Sayfa bulunamadı" });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /team]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE
  else if (req.method === "DELETE") {
    if (!id) {
      return res.status(400).json({ error: "id zorunludur" });
    }

    try {
      const deleted = await db("CustomTeamPages").where({ id }).del();

      if (!deleted) return res.status(404).json({ error: "Sayfa bulunamadı veya silinemedi" });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /team]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  // METHOD NOT ALLOWED
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
