import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { isMimeType, mediaFileReader } from "@lexical/utils";
import { COMMAND_PRIORITY_LOW, PASTE_COMMAND } from "lexical";
import imageCompression from "browser-image-compression";
import { useEffect } from "react";

import { INSERT_IMAGE_COMMAND } from "../ImagesPlugin";

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

export default function CopyPastePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) {
          return false;
        }

        // Check if there are files in clipboard
        const files = Array.from(clipboardData.files || []);
        if (files.length > 0) {
          (async () => {
            const filesResult = await mediaFileReader(files, ACCEPTABLE_IMAGE_TYPES);
            for (const { file } of filesResult) {
              if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
                let finalFile = file;

                // ✅ Compress image
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
                  console.error("Compress error:", err);
                  continue; // Skip this file
                }

                // ✅ Upload to your backend
                const uploadedUrl = await uploadFile(finalFile);

                if (uploadedUrl) {
                  editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                    altText: file.name,
                    src: uploadedUrl,
                  });
                }
              }
            }
          })();

          return true; // Prevent default paste behavior for files
        }

        return false; // Allow default paste behavior for non-file content
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
} 