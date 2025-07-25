import { parseForm } from "../../../lib/fileHandler";
import FormData from "form-data";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { files } = await parseForm(req);

    let allFiles = files.file;
    if (!allFiles) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    if (!Array.isArray(allFiles)) {
      allFiles = [allFiles]; // Tek dosya da diziye çevrilir
    }

    const uploadedUrls = [];

    for (const file of allFiles) {
      const form = new FormData();
      const fileStream = fs.createReadStream(file.filepath);
      form.append("files", fileStream, {
        filename: file.originalFilename || "upload.jpg",
        contentType: file.mimetype || "application/octet-stream",
      });

      const fetch = (...args) =>
        import("node-fetch").then(({ default: fetch }) => fetch(...args));

      const username = "aifuser";
      const password = "bjtrdX}o_yd_=uqxL-[ukktvFKFo";
      const basicAuth = Buffer.from(`${username}:${password}`).toString(
        "base64"
      );

      const response = await fetch(
        "https://fileservice.aifdigitalsolutions.com/api/File/ibsa/upload-full-path",
        {
          method: "POST",
          headers: {
            ...form.getHeaders(),
            accept: "application/json",
            Authorization: `Basic ${basicAuth}`,
          },
          body: form,
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Upload failed: ${errText} ${response}`);
      }

      const responseData = await response.json();
      const uploadedFile = responseData?.[0];

      if (!uploadedFile || !uploadedFile.pathOrContainerName) {
        throw new Error("Upload succeeded but path not returned");
      }

      uploadedUrls.push(`${uploadedFile.pathOrContainerName}`);
    }

    return res.status(200).json({ urls: uploadedUrls });
  } catch (error) {
    console.error("🔥 Upload Error:", error?.message || error);
    return res.status(500).json({ error: error?.message || "Upload failed" });
  }
}
