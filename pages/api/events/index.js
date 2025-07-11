/* eslint-disable */
/**
 * @swagger
 * tags:
 *   - name: Events
 *     description: Etkinlik yönetimi işlemleri (superadmin ve kategori bazlı yetkiyle)
 *
 * /api/events:
 *   get:
 *     summary: Etkinlik(ler)i getir *
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Tekil etkinlik ID'si (verilirse sadece o döner) *
 *       - in: query
 *         name: category_id
 *         required: false
 *         schema:
 *           oneOf:
 *             - type: integer
 *             - type: array
 *               items:
 *                 type: integer
 *         description: Kategori ID'si (tekil veya dizi olabilir) *
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Sayfa başına gösterilecek kayıt sayısı
 *       - in: query
 *         name: currentPage
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Sayfa numarası
 *     responses:
 *       200:
 *         description: Etkinlik(ler) getirildi *
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
 *     summary: Yeni etkinlik ekle *
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
 *         description: Etkinlik başarıyla eklendi *
 *
 *   put:
 *     summary: Etkinliği güncelle *
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek etkinlik ID'si *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventInput'
 *     responses:
 *       200:
 *         description: Etkinlik güncellendi *
 *
 *   delete:
 *     summary: Etkinliği sil *
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek etkinlik ID'si *
 *     responses:
 *       200:
 *         description: Etkinlik silindi *
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
 *         category_id:
 *           type: integer
 *           example: 1
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
 *         - category_id
 *         - location
 *         - isactive
 *       properties:
 *         title:
 *           type: string
 *         start_date:
 *           type: string
 *           format: date
 *         end_date:
 *           type: string
 *           format: date
 *         category_id:
 *           type: integer
 *         location:
 *           type: string
 *         sanction_type:
 *           type: string
 *         contact_email:
 *           type: string
 *         image_url:
 *           type: string
 *         description:
 *           type: string
 *         downloads:
 *           type: string
 *         isactive:
 *           type: boolean
 *
 * securitySchemes:
 *   bearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const { method } = req;
  const id = req.query.id ? parseInt(req.query.id) : null;

  if (["POST", "PUT", "DELETE"].includes(method)) {
    try {
      await verifyToken(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  const checkPermission = async (userId, categoryId, action) => {
    const permission = await db("Permissions")
      .where({ user_id: userId, category_id: categoryId })
      .first();

    return permission ? permission[`can_${action}`] === true : false;
  };

  if (method === "GET") {
    try {
      let { category_id, pageSize = 10, currentPage = 1 } = req.query;

      const categoryIds = Array.isArray(category_id)
        ? category_id.map((id) => parseInt(id))
        : category_id
          ? [parseInt(category_id)]
          : [];

      if (req.user?.role !== "superadmin") {
        const checks = await Promise.all(
          categoryIds.map((catId) =>
            checkPermission(req.user?.id, catId, "read")
          )
        );
        const allAllowed = checks.every(Boolean);
        if (!allAllowed) {
          return res.status(403).json({
            error: "Bazı kategoriler için etkinlik okuma yetkiniz yok.",
          });
        }
      }

      const pageInt = Math.max(parseInt(pageSize), 1);
      const currentPageInt = Math.max(parseInt(currentPage), 1);
      const offset = (currentPageInt - 1) * pageInt;

      if (id) {
        const event = await db("Events")
          .leftJoin("Categories", "Events.category_id", "Categories.id")
          .select("Events.*", "Categories.name as category_name")
          .where("Events.id", id)
          .first();

        if (!event)
          return res.status(404).json({ error: "Etkinlik bulunamadı" });

        event.downloads = event.downloads ? JSON.parse(event.downloads) : [];

        return res.status(200).json(event);
      }

      let query = db("Events").orderBy("start_date", "asc");
      if (categoryIds.length) {
        query = query.whereIn("Events.category_id", categoryIds);
      }

      const countQuery = db("Events");
      if (categoryIds.length) {
        countQuery.whereIn("category_id", categoryIds);
      }
      const totalData = await countQuery.count("id as count").first();

      const events = await query
        .leftJoin("Categories", "Events.category_id", "Categories.id")
        .select("Events.*", "Categories.name as category_name")
        .limit(pageInt)
        .offset(offset);

      const parsedEvents = events.map((e) => ({
        ...e,
        contact_name: e.Contact_name,
        contact_number: e.Contact_number,
        downloads: e.downloads ? JSON.parse(e.downloads) : [],
      }));

      return res.status(200).json({
        data: parsedEvents,
        pagination: {
          currentPage: currentPageInt,
          pageSize: pageInt,
          total: totalData.count,
          totalPages: Math.ceil(totalData.count / pageInt),
        },
      });
    } catch (err) {
      console.error("[GET /events]", err);
      return res
        .status(500)
        .json({ error: "GET failed", details: err.message });
    }
  }

  if (method === "POST") {
    const {
      title,
      start_date,
      end_date,
      category_id,
      location,
      sanction_type,
      contact_email,
      contact_name,
      contact_number,
      image_url,
      description,
      downloads,
      isactive,
    } = req.body;

    if (
      !title ||
      !start_date ||
      !end_date ||
      !category_id ||
      !location ||
      isactive === undefined
    ) {
      return res.status(400).json({ error: "Zorunlu alanlar eksik." });
    }

    try {
      if (req.user?.role !== "superadmin") {
        const allowed = await checkPermission(
          req.user.id,
          category_id,
          "create"
        );
        if (!allowed) {
          return res.status(403).json({
            error: "Bu kategori için etkinlik oluşturma yetkiniz yok.",
          });
        }
      }

      await db("Events").insert({
        title,
        start_date,
        end_date,
        category_id,
        location,
        sanction_type,
        contact_email,
        contact_name,
        contact_number,
        image_url,
        description,
        downloads: JSON.stringify(downloads ?? []),
        isactive,
        created_at: new Date(),
      });

      return res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /events]", err);
      return res
        .status(500)
        .json({ error: "POST failed", details: err.message });
    }
  }

  if (method === "PUT") {
    if (!id)
      return res.status(400).json({ error: "ID parametresi zorunludur." });

    try {
      const existing = await db("Events").where({ id }).first();
      if (!existing)
        return res.status(404).json({ error: "Etkinlik bulunamadı" });

      const newCategoryId = req.body.category_id || existing.category_id;

      if (req.user?.role !== "superadmin") {
        const allowed = await checkPermission(
          req.user.id,
          newCategoryId,
          "update"
        );
        if (!allowed) {
          return res
            .status(403)
            .json({ error: "Bu etkinliği güncelleme yetkiniz yok." });
        }
      }

      await db("Events")
        .where({ id })
        .update({
          title: req.body.title,
          start_date: req.body.start_date,
          end_date: req.body.end_date,
          location: req.body.location,
          sanction_type: req.body.sanction_type,
          contact_email: req.body.contact_email,
          contact_name: req.body.contact_name,
          contact_number: req.body.contact_number,
          image_url: req.body.image_url,
          description: req.body.description,
          downloads: JSON.stringify(req.body.downloads ?? []),
          isactive: req.body.isactive,
          category_id: req.body.category_id,
        });

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /events]", err);
      return res
        .status(500)
        .json({ error: "PUT failed", details: err.message });
    }
  }

  if (method === "DELETE") {
    if (!id)
      return res.status(400).json({ error: "ID parametresi zorunludur." });

    try {
      const event = await db("Events").where({ id }).first();
      if (!event) return res.status(404).json({ error: "Etkinlik bulunamadı" });

      if (req.user?.role !== "superadmin") {
        const allowed = await checkPermission(
          req.user.id,
          event.category_id,
          "delete"
        );
        if (!allowed) {
          return res
            .status(403)
            .json({ error: "Bu etkinliği silme yetkiniz yok." });
        }
      }

      await db("Events").where({ id }).del();
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /events]", err);
      return res
        .status(500)
        .json({ error: "DELETE failed", details: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
};

export default withCors(handler);
