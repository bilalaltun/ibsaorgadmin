/**
 * @swagger
 * tags:
 *   - name: Links
 *     description: Site links management operations
 *
 * /api/links:
 *   get:
 *     summary: Get all links or specific link by ID
 *     tags: [Links]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Link ID (if provided, returns only that link)
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: currentPage
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Link(s) retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/LinkResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LinkResponse'
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
 *     summary: Create new link
 *     tags: [Links]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LinkInput'
 *     responses:
 *       201:
 *         description: Link created successfully
 *
 *   put:
 *     summary: Update existing link
 *     tags: [Links]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the link to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LinkInput'
 *     responses:
 *       200:
 *         description: Link updated successfully
 *
 *   delete:
 *     summary: Delete link
 *     tags: [Links]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the link to delete
 *     responses:
 *       200:
 *         description: Link deleted successfully
 *
 * components:
 *   schemas:
 *     LinkInput:
 *       type: object
 *       required:
 *         - name
 *         - link
 *         - startDate
 *         - endDate
 *         - isactive
 *       properties:
 *         name:
 *           type: string
 *           example: "Google"
 *         link:
 *           type: string
 *           format: uri
 *           example: "https://google.com"
 *         startDate:
 *           type: string
 *           format: date
 *           example: "2024-06-12"
 *         endDate:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         isactive:
 *           type: boolean
 *           example: true
 *
 *     LinkResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Google"
 *         link:
 *           type: string
 *           format: uri
 *           example: "https://google.com"
 *         startDate:
 *           type: string
 *           format: date
 *           example: "2024-06-12"
 *         endDate:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         isactive:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-06-12T10:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2024-06-12T10:00:00Z"
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";

const handler = async (req, res) => {
  const id = req.query.id ? parseInt(req.query.id) : null;

  // GET
  if (req.method === "GET") {
    try {
      if (id) {
        const link = await db("Links").where({ id }).first();
        if (!link) return res.status(404).json({ error: "Link bulunamadı" });
        return res.status(200).json(link);
      }
      const pageSize = parseInt(req.query.pageSize) || 10;
      const currentPage = parseInt(req.query.currentPage) || 1;
      const offset = (currentPage - 1) * pageSize;
      // isactive parametresi kontrolü
      let query = db("Links");
      if (req.query.isactive === "1" || req.query.isactive === 1) {
        query = query.where({ isactive: true });
      } else if (req.query.isactive === "0" || req.query.isactive === 0) {
        query = query.where({ isactive: false });
      }
      const totalCountResult = await query.clone().count("id as count").first();
      const totalCount = Number(totalCountResult?.count || 0);
      const data = await query
        .orderBy("id", "desc")
        .limit(pageSize)
        .offset(offset);
      return res.status(200).json({
        data,
        pagination: {
          currentPage,
          pageSize,
          total: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      });
    } catch (err) {
      console.error("[GET /links]", err);
      return res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST
  else if (req.method === "POST") {
    const { name, link, startDate, endDate, isactive } = req.body;
    if (!name || !link || !startDate || !endDate || isactive === undefined) {
      return res.status(400).json({ error: "Zorunlu alanlar eksik." });
    }
    try {
      await db("Links").insert({
        name,
        link,
        startDate,
        endDate,
        isactive,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /links]", err);
      return res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID parametresi zorunludur." });
    try {
      const item = await db("Links").where({ id }).first();
      if (!item) return res.status(404).json({ error: "Link bulunamadı" });
      // Artık diğerlerini pasif yapma, sadece güncelle
      await db("Links").where({ id }).update({ ...req.body, updated_at: new Date() });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /links]", err);
      return res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE
  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID parametresi zorunludur." });
    try {
      const exists = await db("Links").where({ id }).first();
      if (!exists) return res.status(404).json({ error: "Link bulunamadı" });
      await db("Links").where({ id }).del();
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /links]", err);
      return res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  // INVALID METHOD
  else {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default withCors(handler); 