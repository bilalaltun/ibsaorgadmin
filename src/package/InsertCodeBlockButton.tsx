/* eslint-disable */
// import { HtmlRenderNode } from "./nodes/HtmlRenderNode";
import {
  $getRoot,
  $getSelection,
  $createTextNode,
} from "lexical";
import { $isCodeNode } from "@lexical/code"; // ✅ Doğru olan bu
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export default function ConvertCodeToHtmlNodeButton() {
  const [editor] = useLexicalComposerContext();

  const extractCode = (): string => {
    let code = "";
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const children = root.getChildren();
      for (const node of children) {
        if ($isCodeNode(node)) {
          code = node.getTextContent();
          break;
        }
      }
    });
    return code;
  };

  const convert = () => {
    const html = extractCode();
    editor.update(() => {
      // const htmlNode = new HtmlRenderNode(html);
      // const root = $getRoot();
      // root.clear();
      // root.append(htmlNode);
    });
  };

  return <button onClick={convert}>Manuel HTML'i Dönüştür</button>;
}
