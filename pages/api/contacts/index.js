/**
 * @swagger
 * tags:
 *   - name: Contacts
 *     description: İletişim bilgileri işlemleri
 *
 * /api/contacts:
 *   get:
 *     summary: Tüm iletişimleri veya belirli ID ile detay getir
 *     tags: [Contacts]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Contact ID
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
 *         description: İletişim(ler) getirildi
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ContactResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ContactResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         pageSize:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *
 *   post:
 *     summary: Yeni iletişim ekle
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactInput'
 *     responses:
 *       201:
 *         description: İletişim eklendi
 *
 *   put:
 *     summary: İletişim güncelle
 *     tags: [Contacts]
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
 *             $ref: '#/components/schemas/ContactInput'
 *     responses:
 *       200:
 *         description: Güncellendi
 *
 *   delete:
 *     summary: İletişimi sil
 *     tags: [Contacts]
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
 *         description: Silindi
 *
 * components:
 *   schemas:
 *     Phone:
 *       type: object
 *       properties:
 *         phone_number:
 *           type: string
 *           example: "+994504000000"
 *
 *     ContactInput:
 *       type: object
 *       required:
 *         - gmail
 *         - isactive
 *         - title
 *         - address
 *         - phones
 *       properties:
 *         gmail:
 *           type: string
 *           example: "khanim@gmail.com"
 *         isactive:
 *           type: boolean
 *           example: true
 *         title:
 *           type: string
 *           example: "Bize Ulaşın"
 *         address:
 *           type: string
 *           example: "İstanbul, Türkiye"
 *         phones:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Phone'
 *
 *     ContactResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         gmail:
 *           type: string
 *         isactive:
 *           type: boolean
 *         title:
 *           type: string
 *         address:
 *           type: string
 *         phones:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Phone'
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
      const { id, pageSize = 1000, currentPage = 1 } = req.query;
      const limit = parseInt(pageSize);
      const page = parseInt(currentPage);
      const offset = (page - 1) * limit;

      let contacts;
      if (id) {
        contacts = await db("Contacts").where({ id });
      } else {
       contacts = await db("Contacts")
                    .orderBy("id", "desc")
                    .limit(limit)
                    .offset(offset);
      }

      if (!contacts || contacts.length === 0) {
        return res.status(200).json({ data: [], pagination: { totalCount: 0 } });
      }

      const phones = await db("ContactPhones");

      const result = contacts.map((contact) => {
        const contactPhones = phones
          .filter(p => p.contact_id === contact.id)
          .map(p => ({ phone_number: p.phone_number }));

        return {
          id: contact.id,
          gmail: contact.gmail,
          isactive: contact.isactive,
          title: contact.title,
          address: contact.address,
          phones: contactPhones
        };
      });

      const countResult = await db("Contacts").count("id as count").first();
      const totalCount = Number(countResult?.count || 0);

      res.status(200).json({
        data: id ? result[0] : result,
        pagination: {
          totalCount,
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil(totalCount / limit),
          currentPageCount: result.length,
        },
      });
    } catch (err) {
      console.error("[GET /contacts]", err);
      res.status(500).json({ error: "GET failed", details: err.message });
    }
  }

  // POST
  else if (req.method === "POST") {
    const { gmail, isactive, title, address, phones = [] } = req.body;

    try {
      await db.transaction(async (trx) => {
        const rawResult = await trx.raw(
          `INSERT INTO Contacts (gmail, isactive, title, address)
           OUTPUT INSERTED.id VALUES (?, ?, ?, ?)`,
          [gmail, isactive, title, address]
        );

        const contactId = rawResult[0]?.id;
        if (!contactId) throw new Error("Contact ID alınamadı.");

        for (const phone of phones) {
          if (phone?.phone_number) {
            await trx("ContactPhones").insert({
              contact_id: contactId,
              phone_number: phone.phone_number,
            });
          }
        }
      });

      res.status(201).json({ success: true });
    } catch (err) {
      console.error("[POST /contacts]", err);
      res.status(500).json({ error: "POST failed", details: err.message });
    }
  }

  // PUT
  else if (req.method === "PUT") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    const { gmail, isactive, title, address, phones = [] } = req.body;

    try {
      await db.transaction(async (trx) => {
        await trx("Contacts").where({ id }).update({ gmail, isactive, title, address });

        await trx("ContactPhones").where({ contact_id: id }).del();

        for (const phone of phones) {
          if (phone?.phone_number) {
            await trx("ContactPhones").insert({
              contact_id: id,
              phone_number: phone.phone_number,
            });
          }
        }
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /contacts]", err);
      res.status(500).json({ error: "PUT failed", details: err.message });
    }
  }

  // DELETE
  else if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    try {
      await db.transaction(async (trx) => {
        await trx("ContactPhones").where({ contact_id: id }).del();
        await trx("Contacts").where({ id }).del();
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /contacts]", err);
      res.status(500).json({ error: "DELETE failed", details: err.message });
    }
  }

  // INVALID METHOD
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default withCors(handler);
