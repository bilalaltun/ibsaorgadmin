import { readFile } from "fs/promises";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { parseForm } from "../../../lib/fileHandler";
export const config = {
  api: {
    bodyParser: false,
  },
};
const firebaseConfig = {
  apiKey: "AIzaSyAGGp81BmXQBvjhD9l2b13xGo_BAFuJORQ",
  authDomain: "mizrak-makine.firebaseapp.com",
  projectId: "mizrak-makine",
  storageBucket: "mizrak-makine.firebasestorage.app",
  messagingSenderId: "470337058324",
  appId: "1:470337058324:web:d6236268e1a74886bb5901",
  measurementId: "G-X79V1SMNRJ"
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { files } = await parseForm(req);
    let file = files.file;
    if (Array.isArray(file)) file = file[0];
    if (!file || !file.filepath) {
      return res
        .status(400)
        .json({ error: "No file uploaded or invalid file" });
    }

    const { filepath, originalFilename } = file;
    let buffer = await readFile(filepath);
    const fileName = `${Date.now()}-${originalFilename}`;
    const storageRef = ref(storage, `uploads/${fileName}`);
    await uploadBytes(storageRef, buffer);
    const url = await getDownloadURL(storageRef);

    return res.status(200).json({ url });
  } catch (error) {
    console.error("🔥 Upload Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
