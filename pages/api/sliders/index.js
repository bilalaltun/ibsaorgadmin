/**
 * @swagger
 * /api/sliders:
 *   get:
 *     summary: Tüm sliderları getir (sayfalı veya ID ile)
 *     tags: [Sliders]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Slider ID'si (verilirse sadece o slider döner)
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
 *         description: Sliderlar başarıyla listelendi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Slider'
 *
 *   post:
 *     summary: Yeni slider ekle
 *     tags: [Sliders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SliderInput'
 *     responses:
 *       201:
 *         description: Slider eklendi
 *
 *   put:
 *     summary: Slider güncelle
 *     tags: [Sliders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek slider ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SliderInput'
 *     responses:
 *       200:
 *         description: Slider güncellendi
 *
 *   delete:
 *     summary: Slider sil
 *     tags: [Sliders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek slider ID'si
 *     responses:
 *       200:
 *         description: Slider silindi
 *
 * components:
 *   schemas:
 *     Slider:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         image_url:
 *           type: string
 *         video_url:
 *           type: string
 *         dynamic_link_title:
 *           type: string
 *         dynamic_link:
 *           type: string
 *         dynamic_link_alternative:
 *           type: string
 *         order:
 *           type: integer
 *         isactive:
 *           type: boolean
 *         titles:
 *           type: string
 *           example: "Ana Banner"
 *         description:
 *           type: string
 *           example: "Yeni sezon koleksiyonunu keşfedin."
 *         content:
 *           type: string
 *           example: "Detaylı bilgi için tıklayın."
 *
 *     SliderInput:
 *       type: object
 *       required:
 *         - isactive
 *         - titles
 *       properties:
 *         image_url:
 *           type: string
 *         video_url:
 *           type: string
 *         dynamic_link_title:
 *           type: string
 *         dynamic_link:
 *           type: string
 *         dynamic_link_alternative:
 *           type: string
 *         order:
 *           type: integer
 *         isactive:
 *           type: boolean
 *         titles:
 *           type: string
 *           example: "Ana Banner"
 *         description:
 *           type: string
 *           example: "Yeni sezon koleksiyonunu keşfedin."
 *         content:
 *           type: string
 *           example: "Detaylı bilgi için tıklayın."
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";
import { verifyToken } from "../../../lib/authMiddleware";

const handler = async (req, res) => {
  const id = req.query.id ? parseInt(req.query.id) : null;

  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    try {
      verifyToken(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  // GET
  if (req.method === "GET") {
    try {
      const sliderId = req.query.id ? parseInt(req.query.id) : null;
      if (req.query.id && isNaN(sliderId)) {
        return res.status(400).json({ error: "Geçersiz ID formatı" });
      }

      const DEFAULT_PAGE_SIZE = 1000;
      const DEFAULT_CURRENT_PAGE = 1;

      const pageSize = parseInt(req.query.pageSize) || DEFAULT_PAGE_SIZE;
      const currentPage =
        parseInt(req.query.currentPage) || DEFAULT_CURRENT_PAGE;
      const offset = (currentPage - 1) * pageSize;
      const hasPagination =
        req.query.pageSize !== undefined || req.query.currentPage !== undefined;

      let sliders;
      if (sliderId !== null) {
        sliders = await db("Sliders").where({ id: sliderId });
      } else {
        let query = db("Sliders").orderBy("order");
        if (hasPagination) {
          query = query.limit(pageSize).offset(offset);
        }
        sliders = await query;
      }

      if (!sliders || sliders.length === 0) {
        return res.status(200).json(sliderId !== null ? null : []);
      }

      const result = sliders.map((slider) => ({
        id: slider.id,
        image_url: slider.image_url,
        video_url: slider.video_url,
        dynamic_link_title: slider.dynamic_link_title,
        dynamic_link: slider.dynamic_link,
        dynamic_link_alternative: slider.dynamic_link_alternative,
        isactive: slider.isactive,
        order: slider.order,
        titles: slider.title,
        description: slider.description,
        content: slider.content,
      }));

      const totalCountResult = await db("Sliders").count("id as count").first();
      const totalCount = Number(totalCountResult?.count || 0);

      res.status(200).json(
        sliderId !== null
          ? result[0]
          : {
              data: result,
              pagination: {
                totalPagesCount: Math.ceil(totalCount / pageSize),
                currentPage,
                pageSize,
                currentPageCount: result.length,
              },
            }
      );
    } catch (err) {
      console.error("[GET /sliders]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST
  else if (req.method === "POST") {
    const {
      image_url,
      video_url,
      order,
      isactive,
      dynamic_link_title,
      dynamic_link,
      dynamic_link_alternative,
      titles,
      description,
      content,
    } = req.body;

    if (!titles || typeof titles !== "string") {
      return res
        .status(400)
        .json({ error: "titles alanı zorunludur ve string olmalıdır" });
    }

    try {
      await db("Sliders").insert({
        image_url,
        video_url,
        order,
        isactive,
        dynamic_link_title,
        dynamic_link,
        dynamic_link_alternative,
        title: titles,
        description,
        content,
      });

      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /sliders]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    const {
      image_url,
      order,
      isactive,
      video_url,
      dynamic_link_title,
      dynamic_link,
      dynamic_link_alternative,
      titles,
      description,
      content,
    } = req.body;

    if (!titles || typeof titles !== "string") {
      return res
        .status(400)
        .json({ error: "titles alanı zorunludur ve string olmalıdır" });
    }

    try {
      const updated = await db("Sliders").where({ id }).update({
        image_url,
        video_url,
        order,
        isactive,
        dynamic_link_title,
        dynamic_link,
        dynamic_link_alternative,
        title: titles,
        description,
        content,
      });

      if (!updated) {
        return res.status(404).json({ error: "Slider bulunamadı" });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /sliders]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE
  else if (req.method === "DELETE") {
    if (!id) {
      return res.status(400).json({ error: "ID gerekli" });
    }

    try {
      const deleted = await db("Sliders").where({ id }).del();
      if (!deleted) {
        return res.status(404).json({ error: "Slider bulunamadı" });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /sliders]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  // PATCH (Order update)
  else if (req.method === "PATCH") {
    const { orders } = req.body; // örn: [{ id: 1, order: 1 }, { id: 2, order: 2 }]
    try {
      await db.transaction(async (trx) => {
        for (const item of orders) {
          await trx("Sliders")
            .where({ id: item.id })
            .update({ order: item.order });
        }
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PATCH /sliders/order]", err);
      res.status(500).json({ error: "PATCH failed" });
    }
  }

  // Unsupported
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
