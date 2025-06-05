/* eslint-disable */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $setSelection,
  $createRangeSelection,
} from "lexical";
import { $isCodeNode } from "@lexical/code";

export default function ConvertCodeToHtmlButton() {
  const [editor] = useLexicalComposerContext();

  const convertCodeToHtml = () => {
    editor.update(() => {
      const root = $getRoot();
      const children = root.getChildren();

      for (const node of children) {
        if ($isCodeNode(node)) {
          const html = node.getTextContent();
          node.remove();

          // const htmlNode = new HtmlEditableNode(html, editor);
          // root.append(htmlNode);

          $setSelection($createRangeSelection());

          break;
        }
      }
    });
    // editor.dispatchCommand(FORCE_ON_CHANGE_COMMAND, undefined);
  };

  return <button onClick={convertCodeToHtml}>Kodu HTML olarak düzenle</button>;
}
