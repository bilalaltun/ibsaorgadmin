/**
 * @swagger
 * tags:
 *   - name: SportsCommittees
 *     description: Spor komitesi üyesi iletişim bilgileri işlemleri
 *
 * /api/sports-committees:
 *   get:
 *     summary: Tüm iletişimleri veya belirli ID ile detayı getir
 *     tags: [SportsCommittees]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: İletişim(ler) getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/SportsCommitteeResponse'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/SportsCommitteeResponse'
 *
 *   post:
 *     summary: Yeni iletişim bilgisi ekle
 *     tags: [SportsCommittees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SportsCommitteeInput'
 *     responses:
 *       201:
 *         description: İletişim başarıyla eklendi
 *
 *   put:
 *     summary: İletişim bilgisini güncelle
 *     tags: [SportsCommittees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek iletişimin ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SportsCommitteeInput'
 *     responses:
 *       200:
 *         description: Güncelleme başarılı
 *
 *   delete:
 *     summary: İletişim bilgisini sil
 *     tags: [SportsCommittees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek iletişimin ID'si
 *     responses:
 *       200:
 *         description: Silme işlemi başarılı
 *
 * components:
 *   schemas:
 *     SportsCommitteeInput:
 *       type: object
 *       required:
 *         - contact_info
 *       properties:
 *         contact_info:
 *           type: object
 *           example:
 *             email: "john.doe@example.com"
 *             phone: "+994504000000"
 *             linkedin: "https://linkedin.com/in/johndoe"
 *
 *     SportsCommitteeResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         contact_info:
 *           type: object
 *           example:
 *             email: "john.doe@example.com"
 *             phone: "+994504000000"
 *             linkedin: "https://linkedin.com/in/johndoe"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
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
    let contacts;

    if (id) {
      contacts = await db("SportsCommitteeMemberContacts").where({ id }).first();

      if (!contacts) {
        return res.status(404).json({ error: "Kayıt bulunamadı" });
      }

      return res.status(200).json({ data: contacts });
    } else {
      contacts = await db("SportsCommitteeMemberContacts").orderBy("id", "desc");

      if (!contacts || contacts.length === 0) {
        return res.status(404).json({ error: "Hiçbir kayıt bulunamadı" });
      }

      return res.status(200).json({ data: contacts });
    }

  } catch (err) {
    console.error("[GET]", err);
    res.status(500).json({ error: "GET failed", details: err.message });
  }
}


  // POST 
  else if (req.method === "POST") {
    const { contact_info } = req.body;

    try {
      const [newId] = await db("SportsCommitteeMemberContacts")
        .insert({ contact_info: JSON.stringify(contact_info) })
        .returning("id");

      res.status(201).json({ success: true});
    } catch (err) {
      console.error("[POST]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT 
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID is required" });

    const { contact_info } = req.body;

    try {
      await db("SportsCommitteeMemberContacts")
        .where({ id })
        .update({ contact_info: JSON.stringify(contact_info), updated_at: db.fn.now() });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE
  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID is required" });

    try {
      await db("SportsCommitteeMemberContacts").where({ id }).del();
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
