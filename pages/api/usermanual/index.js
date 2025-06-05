/**
 * @swagger
 * /api/usermanual:
 *   get:
 *     summary: Kullanım kılavuzlarını getir (tekil veya liste)
 *     tags: [UserManual]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: Belirli bir kılavuzun ID'si
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Sayfa başına kayıt sayısı
 *       - in: query
 *         name: currentPage
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Sayfa numarası
 *     responses:
 *       200:
 *         description: Kılavuz(lar) başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserManual'
 *
 *   post:
 *     summary: Yeni kullanım kılavuzu oluştur
 *     tags: [UserManual]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserManualInput'
 *     responses:
 *       201:
 *         description: Kılavuz başarıyla eklendi
 *
 *   put:
 *     summary: Kullanım kılavuzunu güncelle
 *     tags: [UserManual]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek kılavuz ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserManualInput'
 *     responses:
 *       200:
 *         description: Güncelleme başarılı
 *
 *   delete:
 *     summary: Kullanım kılavuzunu sil
 *     tags: [UserManual]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek kılavuzun ID’si
 *     responses:
 *       200:
 *         description: Kılavuz başarıyla silindi
 *
 * components:
 *   schemas:
 *     UserManual:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         cover_img:
 *           type: string
 *           example: "/images/usermanuals/cover.jpg"
 *         title:
 *           type: string
 *           example: "Kullanıcı Kılavuzu"
 *         file:
 *           type: string
 *           example: "/uploads/usermanuals/manual.pdf"
 *         isactive:
 *           type: boolean
 *           example: true
 *
 *     UserManualInput:
 *       type: object
 *       required:
 *         - cover_img
 *         - isactive
 *         - title
 *         - file
 *       properties:
 *         cover_img:
 *           type: string
 *           example: "/images/usermanuals/cover.jpg"
 *         title:
 *           type: string
 *           example: "Kullanıcı Kılavuzu"
 *         file:
 *           type: string
 *           example: "/uploads/usermanuals/manual.pdf"
 *         isactive:
 *           type: boolean
 *           example: true
 */
import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const id = req.query.id ? parseInt(req.query.id) : null;

  // Sadece bu metodlarda token kontrolü
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
      const id = req.query.id ? parseInt(req.query.id) : null;
      const currentPage = parseInt(req.query.currentPage || "1");
      const pageSize = parseInt(req.query.pageSize || "10");

      let manualQuery = db("UserManuals").orderBy("id", "desc");

      if (id) {
        manualQuery = manualQuery.where({ id });
      } else {
        const offset = (currentPage - 1) * pageSize;
        manualQuery = manualQuery.offset(offset).limit(pageSize);
      }

      const manuals = await manualQuery;

      if (!manuals || manuals.length === 0) {
        return res.status(404).json({ error: "Kılavuz bulunamadı" });
      }

      const result = manuals.map((manual) => ({
        id: manual.id,
        cover_img: manual.cover_img,
        title: manual.title,
        file: manual.file,
        isactive: manual.isactive === true || manual.isactive === 1,
      }));

      res.status(200).json(id ? result[0] : result);
    } catch (err) {
      console.error("[GET /usermanual]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST
  else if (req.method === "POST") {
    const { cover_img, title, file, isactive } = req.body;

    if (!title || !file) {
      return res.status(400).json({ error: "title ve file alanları zorunludur" });
    }

    try {
      await db("UserManuals").insert({
        cover_img,
        title,
        file,
        isactive,
      });

      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /usermanual]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    const { cover_img, title, file, isactive } = req.body;

    if (!title || !file) {
      return res.status(400).json({ error: "title ve file zorunludur" });
    }

    try {
      const updated = await db("UserManuals")
        .where({ id })
        .update({
          cover_img,
          title,
          file,
          isactive,
        });

      if (!updated) {
        return res.status(404).json({ error: "Kılavuz bulunamadı" });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /usermanual]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE
  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      const deleted = await db("UserManuals").where({ id }).del();

      if (!deleted) {
        return res.status(404).json({ error: "Kılavuz bulunamadı" });
      }

      res.status(200).json({ success: true, message: "Kılavuz silindi" });
    } catch (err) {
      console.error("[DELETE /usermanual]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  // Desteklenmeyen metod
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);


