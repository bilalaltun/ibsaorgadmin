import db from "../../../lib/db.js";
import { withCors } from "../../../lib/withCors";
//GET
const handler = async (req, res) => {
  const id = parseInt(req.query.id);

  if (req.method === "GET") {
    try {
      const product = await db("Products").where({ id }).first();
      if (!product) return res.status(200).json([]);

      const images = await db("ProductImages").where({ product_id: id });
      const translations = await db("ProductTranslations").where({
        product_id: id,
      });
      const descriptions = await db("ProductDescriptions").where({
        product_id: id,
      });
      const tabs = await db("ProductTabs").where({ product_id: id });

      const result = {
        id: product.id,
        category_key: product.category_key,
        images: images.map((img) => img.url),
        project_name: {},
        category: {},
        description: { tr: [], en: [], ar: [] },
        tabs: { tr: [], en: [], ar: [] },
      };

      // Çok dilli alanlar
      for (const t of translations) {
        result.project_name[t.lang_code] = t.project_name;
        result.category[t.lang_code] = t.category_name;
      }

      for (const d of descriptions) {
        result.description[d.lang_code]?.push(d.description_text);
      }

      for (const tab of tabs) {
        result.tabs[tab.lang_code]?.push({
          title: tab.title,
          content: tab.content,
        });
      }

      res.status(200).json(result);
    } catch (err) {
      console.error("[GET /products/:id]", err);
      res.status(500).json({ error: "GET failed" });
    }
  } else if (req.method === "PUT") {
    const data = req.body;

    try {
      await db.transaction(async (trx) => {
        await trx("Products").where({ id }).update({
          category_key: data.category_key,
        });

        await trx("ProductImages").where({ product_id: id }).del();
        for (const url of data.images) {
          await trx("ProductImages").insert({ product_id: id, url });
        }

        await trx("ProductTranslations").where({ product_id: id }).del();
        await trx("ProductDescriptions").where({ product_id: id }).del();
        await trx("ProductTabs").where({ product_id: id }).del();

        for (const lang of ["tr", "en", "ar"]) {
          await trx("ProductTranslations").insert({
            product_id: id,
            lang_code: lang,
            project_name: data.project_name[lang],
            category_name: data.category[lang],
          });

          for (const text of data.description[lang]) {
            await trx("ProductDescriptions").insert({
              product_id: id,
              lang_code: lang,
              description_text: text,
            });
          }

          for (const tab of data.tabs[lang]) {
            await trx("ProductTabs").insert({
              product_id: id,
              lang_code: lang,
              title: tab.title,
              content: tab.content,
            });
          }
        }
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[PUT /products/:id]", err);
      res.status(500).json({ error: "PUT failed" });
    }
  } else if (req.method === "DELETE") {
    try {
      const product = await db("Products").where({ id }).first();
      if (!product) return res.status(404).json({ error: "Ürün bulunamadı" });

      await db.transaction(async (trx) => {
        await trx("ProductTabs").where({ product_id: id }).del();
        await trx("ProductDescriptions").where({ product_id: id }).del();
        await trx("ProductTranslations").where({ product_id: id }).del();
        await trx("ProductImages").where({ product_id: id }).del();
        await trx("Products").where({ id }).del();
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[DELETE /products/:id]", err);
      res.status(500).json({ error: "DELETE failed" });
    }
  } else {
    res.status(405).json({ error: "Sadece GET, PUT ve DELETE destekleniyor" });
  }
}

export default withCors(handler);
