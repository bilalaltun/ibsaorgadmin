/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Dashboard istatistik verilerini getirir
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: İstatistikler başarıyla alındı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product_count:
 *                   type: integer
 *                   example: 48
 *                 blog_count:
 *                   type: integer
 *                   example: 12
 *                 user_count:
 *                   type: integer
 *                   example: 6
 *                 language_count:
 *                   type: integer
 *                   example: 4
 */

import db from "../../../lib/db"; 

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const [productCountResult] = await db("Products").count("id as count");
      const [blogCountResult] = await db("Blogs").count("id as count");
      const [userCountResult] = await db("Users").count("id as count");
      const [languageCountResult] = await db("Languages").count("id as count");

      res.status(200).json({
        product_count: Number(productCountResult.count),
        blog_count: Number(blogCountResult.count),
        user_count: Number(userCountResult.count),
        language_count: Number(languageCountResult.count),
      });
    } catch (error) {
      console.error("Dashboard GET error:", error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  } else {
    res.status(405).json({ error: "Yalnızca GET desteklenir" });
  }
}
