import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { isMimeType, mediaFileReader } from "@lexical/utils";
import { COMMAND_PRIORITY_LOW, PASTE_COMMAND } from "lexical";
import imageCompression from "browser-image-compression";
import { useEffect, useState } from "react";

// import { INSERT_IMAGE_COMMAND } from "../ImagesPlugin"; // Artık kullanılmayacak

const ACCEPTABLE_IMAGE_TYPES = [
  "image/",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/webp",
];

// ✅ File upload logic (your own API)
const uploadFile = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Yükleme hatası");
    return data.url;
  } catch (err) {
    console.error("Upload error:", err);
    return null;
  }
};

// Yeni: Props tipi
interface CopyPastePluginProps {
  onImageUploaded?: (url: string, file: File) => void;
}

export default function CopyPastePlugin({ onImageUploaded }: CopyPastePluginProps): null {
  const [editor] = useLexicalComposerContext();
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        if (!(event instanceof ClipboardEvent)) {
          return false;
        }
        const clipboardData = event.clipboardData;
        if (!clipboardData) {
          return false;
        }
        // 1. Önce files üzerinden resim var mı bak
        let files = Array.from(clipboardData.files || []) as File[];
        // 2. Eğer files boşsa, items üzerinden image blob'u ara
        if (files.length === 0 && clipboardData.items) {
          for (let i = 0; i < clipboardData.items.length; i++) {
            const item = clipboardData.items[i];
            if (item.kind === "file" && item.type.startsWith("image/")) {
              const blob = item.getAsFile();
              if (blob) {
                files.push(blob);
              }
            }
          }
        }
        if (files.length > 0) {
          (async () => {
            try {
              // mediaFileReader sadece File[] kabul ediyor, blob da File olduğu için sorun yok
              const filesResult = await mediaFileReader(files, ACCEPTABLE_IMAGE_TYPES);
              for (const { file } of filesResult) {
                if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
                  let finalFile = file;
                  try {
                    const compressed = await imageCompression(file, {
                      maxSizeMB: 1,
                      maxWidthOrHeight: 1024,
                      useWebWorker: true,
                    });
                    finalFile = new File([compressed], file.name, {
                      type: file.type,
                      lastModified: Date.now(),
                    });
                  } catch (err) {
                    console.error("Image compression error:", err);
                  }
                  const uploadedUrl = await uploadFile(finalFile);
                  if (uploadedUrl && onImageUploaded) {
                    onImageUploaded(uploadedUrl, finalFile);
                  }
                }
              }
            } catch (error) {
              console.error("Error processing files:", error);
            }
          })();
          // Sadece resim varsa upload et, default paste'i engelle (çift paste olmaz)
          return true;
        }
        // Diğer tüm durumlarda default paste davranışına izin ver
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, onImageUploaded]);

  return null;
} 