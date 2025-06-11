/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Kullanıcı girişi (JWT token al)
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
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: johndoe@1
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
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: johndoe
 *         isactive:
 *           type: boolean
 *           example: true
 *         date:
 *           type: string
 *           format: date
 *           example: "2024-05-29"
 */

import db from "../../../lib/db";
import jwt from "jsonwebtoken";
import { withCors } from "../../../lib/withCors";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body;

  try {
    const user = await db("Users as u")
      .leftJoin("UserRoles as ur", "u.id", "ur.user_id")
      .leftJoin("Roles as r", "ur.role_id", "r.id")
      .select(
        "u.id",
        "u.username",
        "u.password",
        "u.isactive",
        "u.date",
        "r.name as role"
      )
      .where({ "u.username": username, "u.password": password })
      .first();

    if (!user || user.isactive !== true) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        isactive: user.isactive,
        role: user.role,

      },
      "kjhgfdJHGFDSDFGH9876rfghGFDS84",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        isactive: user.isactive,
        role: user.role,
        date: user.date,
      },
    });
  } catch (err) {
    console.error("[POST /users/login]", err);
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};

export default withCors(handler);
