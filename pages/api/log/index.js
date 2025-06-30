import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";

/**
 * @swagger
 * /api/log:
 *   post:
 *     summary: Ziyaretçi verilerini kaydeder
 *     tags: [VisitLogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ip: { type: string }
 *               country: { type: string }
 *               city: { type: string }
 *               timezone: { type: string }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               userAgent: { type: string }
 *               language: { type: string }
 *               platform: { type: string }
 *               cpuCores: { type: integer }
 *               deviceMemory: { type: integer }
 *               screenResolution: { type: string }
 *               pixelRatio: { type: number }
 *               referrer: { type: string }
 *               page: { type: string }
 *               duration: { type: integer }
 *               visitStart: { type: string }
 *               isMobile: { type: boolean }
 *               isBot: { type: boolean }
 *     responses:
 *       200:
 *         description: Log başarıyla kaydedildi
 *
 *   get:
 *     summary: Ziyaretçi loglarını listeler
 *     tags: [VisitLogs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Loglar başarıyla döndürüldü
 */

const handler = async (req, res) => {
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      const {
        ip,
        country,
        city,
        timezone,
        latitude,
        longitude,
        userAgent,
        language,
        platform,
        cpuCores,
        deviceMemory,
        screenResolution,
        pixelRatio,
        referrer,
        page,
        duration,
        visitStart,
        isMobile,
        isBot,
      } = body;

      await db("visit_logs").insert({
        ip_address: ip,
        country,
        city,
        timezone,
        latitude,
        longitude,
        user_agent: userAgent,
        language,
        platform,
        cpu_cores: cpuCores,
        device_memory: deviceMemory,
        screen_resolution: screenResolution,
        pixel_ratio: pixelRatio,
        referrer,
        page,
        duration_seconds: duration,
        visit_start: new Date(visitStart), // 🔧 en önemli düzeltme
        is_mobile: isMobile,
        is_bot: isBot,
      });

      return res.status(200).json({ message: "Visit logged successfully" });
    } catch (error) {
      console.error("[POST /log]", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

if (req.method === "GET") {
  try {
    const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (all) {
      const allLogs = await db("visit_logs").select("*").orderBy("created_at", "desc");
      return res.status(200).json({ data: allLogs });
    }

    const [totalResult] = await db("visit_logs").count("id as total");
    const total = Number(totalResult.total);

    const logs = await db("visit_logs")
      .select("*")
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    return res.status(200).json({
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /log]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Method not allowed" });
};

export default withCors(handler);
