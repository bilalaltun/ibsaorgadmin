/**
 * @swagger
 * /api/homepage/contact-form:
 *   get:
 *     summary: İletişim sayfası başlık verisini getir
 *     tags: [HomepageContactForm]
 *     responses:
 *       200:
 *         description: İletişim başlık verisi getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 section:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     fullname:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     note:
 *                       type: string
 *
 *   put:
 *     summary: İletişim başlık verisini güncelle
 *     tags: [HomepageContactForm]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               fullname:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Güncelleme başarılı
 */
import db from "../../../../lib/db";
import { verifyToken } from "../../../../lib/authMiddleware";
import { withCors } from "../../../../lib/withCors";

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      const section = await db("ContactFormSection").first();
      if (!section) return res.status(200).json(null);

      res.status(200).json({
        section: {
          title: section.title,
          description: section.description,
          fullname: section.fullname,
          email: section.email,
          phone: section.phone,
          note: section.note,
        }
      });
    } catch (err) {
      console.error("[GET /homepage/contact-form]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  else if (req.method === "PUT") {
    try {
      verifyToken(req);

      const { title, description, fullname, email, phone, note } = req.body;

      if (
        typeof title !== "string" ||
        typeof description !== "string" ||
        typeof fullname !== "string" ||
        typeof email !== "string" ||
        typeof phone !== "string" ||
        typeof note !== "string"
      ) {
        return res.status(400).json({ error: "Tüm alanlar string olmalıdır." });
      }

      await db.transaction(async (trx) => {
        const existing = await trx("ContactFormSection").first();

        const data = { title, description, fullname, email, phone, note };

        if (!existing) {
          await trx("ContactFormSection").insert({ section_key: "contact", ...data });
        } else {
          await trx("ContactFormSection").update(data);
        }
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /homepage/contact-form]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
