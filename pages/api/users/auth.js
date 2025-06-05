/**
 * @swagger
 * /api/users/auth:
 *   post:
 *     summary: Kullanıcı girişi (Basit islem)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: sfd
 *               password:
 *                 type: string
 *                 example: fdasfdas
 *     responses:
 *       200:
 *         description: Giriş başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Geçersiz giriş bilgisi
 */

import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";

const handler = async (req, res) => {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { username, password } = req.body;

    try {
        const userExists = await db("Users")
            .where({ username, password })
            .first();

        return res.status(200).json({ exists: !!userExists });
    } catch (err) {
        console.error("User existence check failed:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export default withCors(handler);


