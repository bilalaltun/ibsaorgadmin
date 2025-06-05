/**
 * @swagger
 * /api/dashboard/weather:
 *   get:
 *     summary: Bursa'nın güncel hava durumu verilerini getirir
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Güncel hava durumu verileri başarıyla alındı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 temperature:
 *                   type: number
 *                   description: Sıcaklık (°C)
 *                   example: 22.5
 *                 windspeed:
 *                   type: number
 *                   description: Rüzgar hızı (km/s)
 *                   example: 15.3
 *                 weathercode:
 *                   type: integer
 *                   description: Hava durumu kodu
 *                   example: 3
 *                 time:
 *                   type: string
 *                   description: Veri zamanı (ISO 8601 formatında)
 *                   example: "2025-06-02T10:00"
 *       500:
 *         description: Sunucu hatası
 */

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=40.7655&longitude=29.9406&current_weather=true&timezone=Europe/Istanbul"
      );

      if (!response.ok) {
        throw new Error("Open-Meteo API'den veri alınamadı");
      }

      const data = await response.json();

      if (!data.current_weather) {
        return res.status(500).json({ error: "Güncel hava durumu verisi bulunamadı" });
      }

      const { temperature, windspeed, weathercode, time } = data.current_weather;

      res.status(200).json({
        temperature,
        windspeed,
        weathercode,
        time,
      });
    } catch (error) {
      console.error("Hava durumu API hatası:", error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  } else {
    res.status(405).json({ error: "Yalnızca GET istekleri desteklenmektedir" });
  }
}
