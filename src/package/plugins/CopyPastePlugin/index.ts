/* eslint-disable */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { isMimeType, mediaFileReader } from "@lexical/utils";
import { COMMAND_PRIORITY_LOW, PASTE_COMMAND } from "lexical";
import imageCompression from "browser-image-compression";
import { useEffect, useState } from "react";
import { $getRoot, $getSelection, $createParagraphNode, $createTextNode } from "lexical";
import { $createImageNode } from "../../nodes/ImageNode";

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

// Helper: Resolve relative URLs to absolute using a base URL
function resolveUrl(src: string, baseUrl: string): string {
  try {
    return new URL(src, baseUrl).href;
  } catch {
    return src;
  }
}

// Helper: Generate a globally unique placeholder for each image
function generateUniquePlaceholder(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `__uploading__${crypto.randomUUID()}`;
  }
  return `__uploading__${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Yeni: Props tipi
interface CopyPastePluginProps {
  onImageUploaded?: (url: string, file: File) => void;
}

export default function CopyPastePlugin({ onImageUploaded }: CopyPastePluginProps): null {
  const [editor] = useLexicalComposerContext();
  const [uploadedImages, setUploadedImages] = useState([]);

  // Yardımcı: Editördeki <img> src'sini güncelle (placeholder'dan yeni linke)
  const updateImageSrcInEditor = (placeholder: string, newSrc: string) => {
    editor.update(() => {
      const root = $getRoot();
      const imgs = root.getChildren().flatMap((node: any) => {
        if (node.getType && node.getType() === 'image') return [node];
        if (typeof node.getChildren === 'function') {
          return node.getChildren().filter((n: any) => n.getType && n.getType() === 'image');
        }
        return [];
      });
      imgs.forEach((imgNode: any) => {
        if (imgNode.__src === placeholder) {
          const writable = imgNode.getWritable();
          writable.__src = newSrc;
        }
      });
    });
  };

  // D: Robustly update all image nodes with the placeholder src
  function updateImageSrcInEditorAll(placeholder: string, newSrc: string) {
    editor.update(() => {
      const root = $getRoot();
      function updateImages(node: any) {
        if (node.getType && node.getType() === 'image') {
          if (node.__src === placeholder) {
            // Replace the node with a new one to trigger re-render
            const newNode = $createImageNode({ src: newSrc, altText: node.__altText || '' });
            node.replace(newNode);
          }
        }
        if (typeof node.getChildren === 'function') {
          node.getChildren().forEach(updateImages);
        }
      }
      root.getChildren().forEach(updateImages);
    });
  }

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

        // Check if there are any image files in the clipboard
        const hasImageFiles = clipboardData.files && Array.from(clipboardData.files).some(f => f.type.startsWith("image/"));
        const hasImageItems = clipboardData.items && Array.from(clipboardData.items).some(item => 
          item.kind === "file" && item.type.startsWith("image/")
        );

        // Check if there's HTML content with images
        let hasHtmlWithImages = false;
        if (clipboardData.items) {
          for (let i = 0; i < clipboardData.items.length; i++) {
            const item = clipboardData.items[i];
            if (item.type === "text/html") {
              // Don't prevent default here - let the HTML be processed normally
              // Only handle images separately if needed
              hasHtmlWithImages = true;
              break;
            }
          }
        }

        // If there are image files, handle them separately
        if (hasImageFiles || hasImageItems) {
          const fileSet = new Set<File>();
          
          if (clipboardData.files && clipboardData.files.length > 0) {
            Array.from(clipboardData.files).forEach((f) => {
              if (f.type.startsWith("image/")) fileSet.add(f);
            });
          }
          
          if (clipboardData.items && clipboardData.items.length > 0) {
            for (let i = 0; i < clipboardData.items.length; i++) {
              const item = clipboardData.items[i];
              if (item.kind === "file" && item.type.startsWith("image/")) {
                const blob = item.getAsFile();
                if (blob) fileSet.add(blob);
              }
            }
          }

          const files = Array.from(fileSet);
          if (files.length > 0) {
            (async () => {
              try {
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
                      console.log('[CopyPastePlugin] Compressed pasted file:', finalFile);
                    } catch (err) {
                      console.error("[CopyPastePlugin] Image compression error:", err);
                    }
                    console.log('[CopyPastePlugin] Uploading pasted file...');
                    const uploadedUrl = await uploadFile(finalFile);
                    if (uploadedUrl && onImageUploaded) {
                      console.log('[CopyPastePlugin] Upload success! URL:', uploadedUrl);
                      onImageUploaded(uploadedUrl, finalFile);
                    } else if (!uploadedUrl) {
                      console.error('[CopyPastePlugin] Upload failed, no URL returned');
                    }
                  }
                }
              } catch (error) {
                console.error("[CopyPastePlugin] Error processing files:", error);
              }
            })();
          }
        }

        // For HTML content with images, let the default paste handle it
        // but also process images separately if needed
        if (hasHtmlWithImages && clipboardData.items) {
          for (let i = 0; i < clipboardData.items.length; i++) {
            const item = clipboardData.items[i];
            if (item.type === "text/html") {
              item.getAsString((rawHtml) => {
                // Process images in HTML without preventing default paste
                const imgRegex = /<img([^>]+)src=["']([^"']+)["']([^>]*)>/gi;
                let match;
                const localImgPlaceholders: { placeholder: string, originalSrc: string }[] = [];
                
                while ((match = imgRegex.exec(rawHtml)) !== null) {
                  let originalSrc = match[2];
                  const placeholder = generateUniquePlaceholder();
                  localImgPlaceholders.push({ placeholder, originalSrc });
                  console.log('[CopyPastePlugin] [PASTE] Detected pasted image in HTML:', originalSrc, '-> placeholder:', placeholder);
                }

                // Process each image
                localImgPlaceholders.forEach(({ placeholder, originalSrc }) => {
                  (async () => {
                    try {
                      let file = null;
                      if (originalSrc.startsWith("data:image/")) {
                        // Data URL'den File oluştur
                        const arr = originalSrc.split(",");
                        const mimeMatch = arr[0].match(/:(.*?);/);
                        const mime = mimeMatch ? mimeMatch[1] : "image/png";
                        const bstr = atob(arr[1]);
                        let n = bstr.length;
                        const u8arr = new Uint8Array(n);
                        while (n--) {
                          u8arr[n] = bstr.charCodeAt(n);
                        }
                        const ext = mime.split("/")[1] || "png";
                        file = new File([u8arr], `clipboard-img-${Date.now()}.${ext}`, { type: mime });
                        console.log('[CopyPastePlugin] Created File from data URL:', file);
                      } else if (originalSrc.startsWith("http://") || originalSrc.startsWith("https://")) {
                        // Proxy endpoint üzerinden fetch
                        const extMatch = originalSrc.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
                        const ext = extMatch ? extMatch[1] : "png";
                        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(originalSrc)}`;
                        const response = await fetch(proxyUrl);
                        if (!response.ok) throw new Error("Image fetch failed");
                        const blob = await response.blob();
                        const mime = blob.type || "image/png";
                        file = new File([blob], `clipboard-img-url-${Date.now()}.${ext}`, { type: mime });
                        console.log('[CopyPastePlugin] Created File from remote image:', file);
                      }
                      
                      if (file) {
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
                          console.log('[CopyPastePlugin] Compressed image:', finalFile);
                        } catch (err) {
                          console.error("[CopyPastePlugin] Image compression error:", err);
                        }
                        
                        console.log('[CopyPastePlugin] Uploading image...');
                        const uploadedUrl = await uploadFile(finalFile);
                        let fullUrl: any = uploadedUrl;
                        if (uploadedUrl && typeof uploadedUrl === 'object' && (uploadedUrl as any).url) {
                          fullUrl = (uploadedUrl as any).url;
                        }
                        if (fullUrl && typeof fullUrl === 'string' && !fullUrl.startsWith('http')) {
                          fullUrl = `${window.location.origin}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
                        }
                        
                        if (typeof fullUrl === 'string' && fullUrl) {
                          console.log('[CopyPastePlugin] Upload success! URL:', fullUrl);
                          updateImageSrcInEditorAll(placeholder, fullUrl);
                          if (onImageUploaded) onImageUploaded(fullUrl, finalFile);
                          console.log('[CopyPastePlugin] [REPLACE] Replacing placeholder:', placeholder, 'with URL:', fullUrl);
                        } else {
                          console.error('[CopyPastePlugin] Upload failed, no URL returned');
                        }
                      }
                    } catch (err) {
                      console.error("[CopyPastePlugin] Image upload error:", err);
                    }
                  })();
                });
              });
              break;
            }
          }
        }

        // Always allow default paste behavior for text and other content
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, onImageUploaded]);

  return null;
} 