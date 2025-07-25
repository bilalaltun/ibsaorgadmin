import db from "../../../lib/db";
import { withCors } from "../../../lib/withCors";

const handler = async (req, res) => {
  if (req.method === "POST") {
    // Create new media accreditation
    const {
      title,
      firstName,
      lastName,
      company,
      city,
      country,
      email,
      message,
    } = req.body;
    if (
      !title ||
      !firstName ||
      !lastName ||
      !company ||
      !city ||
      !country ||
      !email ||
      !message
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }
    try {
      const [id] = await db("media_accreditations").insert({
        title,
        firstName,
        lastName,
        company,
        city,
        country,
        email,
        message,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      });
      return res.status(201).json({ id });
    } catch (err) {
      console.error("POST error:", err);
      return res.status(500).json({ error: "Failed to create record." });
    }
  }

  if (req.method === "GET") {
    const { id, pageSize = 10, currentPage = 1 } = req.query;
    if (id) {
      // Fetch a single record by id
      // Replace with your actual DB logic
      const record = await getMediaAccreditationById(id); // implement this function
      if (!record) {
        return res.status(404).json({ error: "Not found" });
      }
      return res.status(200).json(record);
    }
    // List all media accreditations
    try {
      const items = await db("media_accreditations").select();
      return res.status(200).json(items);
    } catch (err) {
      console.error("GET error:", err);
      return res.status(500).json({ error: "Failed to fetch records." });
    }
  }

  if (req.method === "DELETE") {
    // Delete by id (expects ?id=)
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID is required." });
    try {
      const deleted = await db("media_accreditations").where({ id }).del();
      if (!deleted) return res.status(404).json({ error: "Not found." });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("DELETE error:", err);
      return res.status(500).json({ error: "Failed to delete record." });
    }
  }

  return res.status(405).json({ error: "Method not allowed." });
};

async function getMediaAccreditationById(id) {
  const items = await db("media_accreditations").select();
  return items.find((item) => String(item.id) === String(id));
}
export default withCors(handler);
