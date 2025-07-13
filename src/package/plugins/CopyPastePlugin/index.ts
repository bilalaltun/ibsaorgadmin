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
        console.log("🔍 CopyPastePlugin: PASTE_COMMAND triggered");
        
        // Handle ClipboardEvent
        if (event instanceof ClipboardEvent) {
          const clipboardData = event.clipboardData;
          if (!clipboardData) {
            console.log("🔍 CopyPastePlugin: No clipboard data");
            return false;
          }

          // Check for files in clipboard
          const files = Array.from(clipboardData.files || []) as File[];
          console.log("🔍 CopyPastePlugin: Files in clipboard:", files.length);

          if (files.length > 0) {
            console.log("🔍 CopyPastePlugin: Processing files...");
            (async () => {
              try {
                const filesResult = await mediaFileReader(files, ACCEPTABLE_IMAGE_TYPES);
                console.log("🔍 CopyPastePlugin: Files result:", filesResult);
                
                for (const { file } of filesResult) {
                  console.log("🔍 CopyPastePlugin: Processing file:", file.name, file.type);
                  
                  if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
                    console.log("🔍 CopyPastePlugin: Valid image file, compressing...");
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
                      console.log("🔍 CopyPastePlugin: Image compressed successfully");
                    } catch (err) {
                      console.error("Compress error:", err);
                      continue; // Skip this file
                    }

                    // ✅ Upload to your backend
                    console.log("🔍 CopyPastePlugin: Uploading to server...");
                    const uploadedUrl = await uploadFile(finalFile);
                    console.log("🔍 CopyPastePlugin: Upload result:", uploadedUrl);

                    if (uploadedUrl) {
                      console.log("🔍 CopyPastePlugin: Inserting image with URL:", uploadedUrl);
                      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                        altText: file.name,
                        src: uploadedUrl,
                      });
                    } else {
                      console.error("🔍 CopyPastePlugin: Upload failed, no URL returned");
                    }
                  } else {
                    console.log("🔍 CopyPastePlugin: File is not a valid image type");
                  }
                }
              } catch (error) {
                console.error("🔍 CopyPastePlugin: Error processing files:", error);
              }
            })();

            return true; // Prevent default paste behavior for files
          }

          // Check for image data in clipboard
          const imageTypes = clipboardData.types.filter(type => type.startsWith('image/'));
          console.log("🔍 CopyPastePlugin: Image types in clipboard:", imageTypes);
          
          if (imageTypes.length > 0) {
            console.log("🔍 CopyPastePlugin: Processing image data from clipboard...");
            (async () => {
              try {
                const imageType = imageTypes[0];
                const imageData = clipboardData.getData(imageType);
                console.log("🔍 CopyPastePlugin: Image data length:", imageData?.length);
                
                if (imageData && imageData.startsWith('data:image/')) {
                  // Convert data URL to file
                  const response = await fetch(imageData);
                  const blob = await response.blob();
                  const file = new File([blob], `pasted-image.${imageType.split('/')[1]}`, { type: imageType });
                  console.log("🔍 CopyPastePlugin: Created file from clipboard data:", file.name);
                  
                  // Compress the image
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
                    console.log("🔍 CopyPastePlugin: Image compressed successfully");
                  } catch (err) {
                    console.error("Compress error:", err);
                    return;
                  }

                  // Upload to server
                  console.log("🔍 CopyPastePlugin: Uploading to server...");
                  const uploadedUrl = await uploadFile(finalFile);
                  console.log("🔍 CopyPastePlugin: Upload result:", uploadedUrl);

                  if (uploadedUrl) {
                    console.log("🔍 CopyPastePlugin: Inserting image with URL:", uploadedUrl);
                    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                      altText: file.name,
                      src: uploadedUrl,
                    });
                  } else {
                    console.error("🔍 CopyPastePlugin: Upload failed, no URL returned");
                  }
                }
              } catch (error) {
                console.error("🔍 CopyPastePlugin: Error processing image data:", error);
              }
            })();

            return true; // Prevent default paste behavior for image data
          }
        }

        console.log("🔍 CopyPastePlugin: No image data found, allowing default paste");
        return false; // Allow default paste behavior for non-image content
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
} 