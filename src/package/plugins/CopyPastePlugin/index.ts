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
        // 1. Eğer HTML varsa, <img src="..."> tag'lerini placeholder ile değiştir
        let htmlString = '';
        let imgPlaceholders: { placeholder: string, originalSrc: string }[] = [];
        let handled = false;
        if (clipboardData.items && clipboardData.items.length > 0) {
          for (let i = 0; i < clipboardData.items.length; i++) {
            const item = clipboardData.items[i];
            if (item.type === "text/html") {
              event.preventDefault(); // Default paste'i tamamen engelle
              item.getAsString((rawHtml) => {
                htmlString = rawHtml;
                // <img src="..."> tag'lerini bul ve placeholder ile değiştir
                const imgRegex = /<img([^>]+)src=["']([^"']+)["']([^>]*)>/gi;
                let match;
                let newHtml = htmlString;
                imgPlaceholders = [];
                while ((match = imgRegex.exec(htmlString)) !== null) {
                  const originalSrc = match[2];
                  const placeholder = `__uploading__${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
                  imgPlaceholders.push({ placeholder, originalSrc });
                  // Replace only this occurrence
                  newHtml = newHtml.replace(match[0], `<img${match[1]}src=\"${placeholder}\"${match[3]}>`);
                }
                // Basit bir HTML parser: <p>, <br>, <img> ve text
                editor.update(() => {
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = newHtml;
                  const root = $getRoot();
                  function parseNode(domNode: any): any {
                    if (domNode.nodeType === Node.TEXT_NODE) {
                      const text = domNode.textContent || '';
                      if (text.trim()) {
                        return $createTextNode(text);
                      }
                      return null;
                    } else if (domNode.nodeType === Node.ELEMENT_NODE) {
                      const el = domNode;
                      if (el.tagName === 'BR') {
                        return $createTextNode('\n');
                      } else if (el.tagName === 'IMG') {
                        const src = el.getAttribute('src') || '';
                        // Image node olarak ekle
                        return $createImageNode({ src, altText: '' });
                      } else if (el.tagName === 'P') {
                        const p = $createParagraphNode();
                        Array.from(el.childNodes).forEach((child: any) => {
                          const node = parseNode(child);
                          if (node) p.append(node);
                        });
                        return p;
                      } else {
                        // Diğer elementler için çocuklarını sırayla ekle
                        const frag: any[] = [];
                        Array.from(el.childNodes).forEach((child: any) => {
                          const node = parseNode(child);
                          if (node) frag.push(node);
                        });
                        return frag;
                      }
                    }
                    return null;
                  }
                  Array.from(tempDiv.childNodes).forEach((domNode: any) => {
                    const node = parseNode(domNode);
                    if (Array.isArray(node)) {
                      // Her bir array'i bir paragraph'a sar
                      const p = $createParagraphNode();
                      node.forEach((n: any) => { if (n && typeof n.getKey === 'function') p.append(n); });
                      if (p.getChildrenSize() > 0) root.append(p);
                    } else if (node && typeof node.getKey === 'function') {
                      root.append(node);
                    } else if (node) {
                      // Tek başına text node dönerse, paragraph'a sar
                      const p = $createParagraphNode();
                      p.append(node);
                      root.append(p);
                    }
                  });
                });
                // Her img için upload başlat
                imgPlaceholders.forEach(({ placeholder, originalSrc }) => {
                  (async () => {
                    try {
                      let file: File | null = null;
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
                        } catch (err) {
                          console.error("Image compression error:", err);
                        }
                        const uploadedUrl = await uploadFile(finalFile);
                        if (uploadedUrl) {
                          updateImageSrcInEditor(placeholder, uploadedUrl);
                          if (onImageUploaded) onImageUploaded(uploadedUrl, finalFile);
                        }
                      }
                    } catch (err) {
                      console.error("Image upload error:", err);
                    }
                  })();
                });
              });
              handled = true;
            }
          }
        }
        // 2. Eğer image dosyası varsa (clipboardData.files), onları upload et
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
        }
        // Eğer HTML paste işlemi yapıldıysa, default paste'i engelle
        if (handled) {
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