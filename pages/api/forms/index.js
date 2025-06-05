/**
 * @swagger
 * /api/forms:
 *   get:
 *     summary: Formları getir (tüm liste veya ID ile detay)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Form ID'si (verilirse sadece ilgili kayıt döner)
 *     responses:
 *       200:
 *         description: Form(lar) getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Form'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Form'

 *   post:
 *     summary: Yeni form ekle
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FormInput'
 *     responses:
 *       201:
 *         description: Form eklendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true

 *   delete:
 *     summary: Form sil
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek form ID'si
 *     responses:
 *       200:
 *         description: Form silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true

 * components:
 *   schemas:
 *     Form:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         userinfo:
 *           type: string
 *           example: "Mahammad Sarkarlı"
 *         gsm:
 *           type: string
 *           example: "+994501234567"
 *         mail:
 *           type: string
 *           example: "mail@example.com"
 *         content:
 *           type: string
 *           example: "Destek mesajı içeriği"

 *     FormInput:
 *       type: object
 *       required:
 *         - userinfo
 *         - gsm
 *         - mail
 *         - content
 *       properties:
 *         userinfo:
 *           type: string
 *           example: "Mahammad Sarkarlı"
 *         gsm:
 *           type: string
 *           example: "+994501234567"
 *         mail:
 *           type: string
 *           example: "mail@example.com"
 *         content:
 *           type: string
 *           example: "Bu bir form mesajıdır"
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

//GET
const handler = async (req, res) => {
  const id = req.query.id ? parseInt(req.query.id) : null;

  // Sadece bu HTTP metodlarında token kontrolü uygula
  if (["GET", "DELETE"].includes(req.method)) {
    try {
      verifyToken(req); // Token kontrolü yapılır
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  // GET /api/forms veya /api/forms?id=1
  if (req.method === "GET") {
    try {
      const forms = id
        ? await db("Forms").where({ id })
        : await db("Forms").orderBy("date", "desc");

      if (!forms || forms.length === 0) {
        return res.status(200).json([]);
      }

      const result = forms.map((form) => ({
        id: form.id,
        userinfo: form.userinfo,
        gsm: form.gsm,
        mail: form.mail,
        content: form.content,
        date: form.date,
      }));

      res.status(200).json(id ? result[0] : result);
    } catch (err) {
      console.error("[GET /forms]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST
  else if (req.method === "POST") {
    const { userinfo, gsm, mail, content } = req.body;

    if (!userinfo || !gsm || !mail || !content) {
      return res.status(400).json({ error: "Tüm alanlar zorunludur." });
    }

    try {
      await db("Forms").insert({
        userinfo,
        gsm,
        mail,
        content,
        date: new Date(),
      });
      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /forms]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT /api/forms?id=1
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    const { userinfo, gsm, mail, content, date } = req.body;

    if (!userinfo || !gsm || !mail || !content || !date) {
      return res.status(400).json({ error: "Tüm alanlar zorunludur." });
    }

    try {
      await db("Forms")
        .where({ id })
        .update({ userinfo, gsm, mail, content, date: new Date(date) });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /forms]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE /api/forms?id=1
  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      await db("Forms").where({ id }).del();
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /forms]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  // Unsupported method
  else {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    res.status(405).json({ error: "Method not allowed" });
  }
};
export default withCors(handler);