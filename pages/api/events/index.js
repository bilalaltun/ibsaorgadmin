/**
 * @swagger
 * tags:
 *   - name: Events
 *     description: Etkinlik yönetimi işlemleri
 *
 * /api/events:
 *   get:
 *     summary: Etkinlikleri getir (tüm liste, ID ile detay veya sayfalı)
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Etkinlik ID'si (verilirse sadece o etkinlik döner)
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
 *         description: Etkinlik(ler) getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Event'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *
 *   post:
 *     summary: Yeni etkinlik ekle
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventInput'
 *     responses:
 *       201:
 *         description: Etkinlik başarıyla eklendi
 *
 *   put:
 *     summary: Etkinlik bilgilerini güncelle
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek etkinliğin ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventInput'
 *     responses:
 *       200:
 *         description: Etkinlik güncellendi
 *
 *   delete:
 *     summary: Etkinlik sil
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek etkinliğin ID'si
 *     responses:
 *       200:
 *         description: Etkinlik silindi
 *
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "IBSA Goalball Referee Clinic"
 *         start_date:
 *           type: string
 *           format: date
 *           example: "2025-06-20"
 *         end_date:
 *           type: string
 *           format: date
 *           example: "2025-06-22"
 *         category:
 *           type: string
 *           example: "Goalball"
 *         location:
 *           type: string
 *           example: "Lisbon (Portugal)"
 *         sanction_type:
 *           type: string
 *           example: "Sanctioned"
 *         contact_email:
 *           type: string
 *           example: "clinic@ibsa.org"
 *         image_url:
 *           type: string
 *           example: "/images/events/goalball-clinic.jpg"
 *         description:
 *           type: string
 *           example: "<p>Referee training and certification for Goalball.</p>"
 *         downloads:
 *           type: string
 *           example: '[{"title": "Invitation", "url": "/downloads/invitation.pdf"}]'
 *         isactive:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-06-05T09:00:00Z"
 *
 *     EventInput:
 *       type: object
 *       required:
 *         - title
 *         - start_date
 *         - end_date
 *         - category
 *         - location
 *         - isactive
 *       properties:
 *         title:
 *           type: string
 *           example: "IBSA Goalball Referee Clinic"
 *         start_date:
 *           type: string
 *           format: date
 *           example: "2025-06-20"
 *         end_date:
 *           type: string
 *           format: date
 *           example: "2025-06-22"
 *         category:
 *           type: string
 *           example: "Goalball"
 *         location:
 *           type: string
 *           example: "Lisbon (Portugal)"
 *         sanction_type:
 *           type: string
 *           example: "Sanctioned"
 *         contact_email:
 *           type: string
 *           example: "clinic@ibsa.org"
 *         image_url:
 *           type: string
 *           example: "/images/events/goalball-clinic.jpg"
 *         description:
 *           type: string
 *           example: "<p>Referee training and certification for Goalball.</p>"
 *         downloads:
 *           type: string
 *           example: '[{"title": "Invitation", "url": "/downloads/invitation.pdf"}]'
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
      verifyToken(req); // Yetkilendirme kontrolü
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  // GET 
  if (method === "GET") {
    try {
      if (id) {
        const event = await db("Events").where({ id }).first();
        if (!event) return res.status(404).json({ error: "Etkinlik bulunamadı" });
        return res.status(200).json(event);
      }

      const pageSize = parseInt(req.query.pageSize) || 10;
      const currentPage = parseInt(req.query.currentPage) || 1;
      const offset = (currentPage - 1) * pageSize;

      const totalCountResult = await db("Events").count("id as count").first();
      const totalCount = Number(totalCountResult?.count || 0);

      const events = await db("Events")
        .orderBy("start_date", "asc")
        .limit(pageSize)
        .offset(offset);

      return res.status(200).json({
        data: events,
        pagination: {
          currentPage,
          pageSize,
          total: totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      });
    } catch (err) {
      console.error("[GET /events]", err);
      return res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST 
  else if (method === "POST") {
    const {
      title,
      start_date,
      end_date,
      category,
      location,
      sanction_type,
      contact_email,
      image_url,
      description,
      downloads,
      isactive,
    } = req.body;

    if (!title || !start_date || !end_date || !category || !location || isactive === undefined) {
      return res.status(400).json({ error: "Zorunlu alanlar eksik." });
    }

    try {
      await db("Events").insert({
        title,
        start_date,
        end_date,
        category,
        location,
        sanction_type,
        contact_email,
        image_url,
        description,
        downloads,
        isactive,
        created_at: new Date(),
      });

      return res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /events]", err);
      return res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT 
  else if (method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID parametresi zorunludur." });

    try {
      const event = await db("Events").where({ id }).first();
      if (!event) return res.status(404).json({ error: "Etkinlik bulunamadı" });

      await db("Events").where({ id }).update({
        ...req.body
      });

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /events]", err);
      return res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE 
  else if (method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID parametresi zorunludur." });

    try {
      const exists = await db("Events").where({ id }).first();
      if (!exists) return res.status(404).json({ error: "Etkinlik bulunamadı" });

      await db("Events").where({ id }).del();
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /events]", err);
      return res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  // Diğer HTTP method'ları için:
  else {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withCors(handler);
