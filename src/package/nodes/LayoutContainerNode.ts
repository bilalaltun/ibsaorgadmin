import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  LexicalUpdateJSON,
  NodeKey,
  SerializedElementNode,
  Spread,
} from "lexical";

import { addClassNamesToElement } from "@lexical/utils";
import { ElementNode } from "lexical";

export type SerializedLayoutContainerNode = Spread<
  {
    templateColumns: string;
  },
  SerializedElementNode
>;

function $convertLayoutContainerElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const templateColumns = domNode.getAttribute("data-template-columns");
  if (templateColumns) {
    const node = $createLayoutContainerNode(templateColumns);
    return { node };
  }
  return null;
}

export class LayoutContainerNode extends ElementNode {
  __templateColumns: string;

  constructor(templateColumns: string, key?: NodeKey) {
    super(key);
    this.__templateColumns = templateColumns;
  }

  static getType(): string {
    return "layout-container";
  }

  static clone(node: LayoutContainerNode): LayoutContainerNode {
    return new LayoutContainerNode(node.__templateColumns, node.__key);
  }

createDOM(config: EditorConfig): HTMLElement {
  const dom = document.createElement("div");
  dom.setAttribute("data-lexical-layout-container", "true");
  dom.setAttribute("data-template-columns", this.__templateColumns);

  // Tema class’ı
  if (typeof config.theme.layoutContainer === "string") {
    addClassNamesToElement(dom, config.theme.layoutContainer);
  }

  // Sabit layout grid class'ı
  dom.classList.add("layout-grid");

  // Template'e göre dinamik class eşlemesi
  const classMap: Record<string, string> = {
    "1fr 1fr": "layout-cols-2",
    "1fr 3fr": "layout-cols-1-3",
    "1fr 1fr 1fr": "layout-cols-3",
    "1fr 2fr 1fr": "layout-cols-1-2-1",
    "1fr 1fr 1fr 1fr": "layout-cols-4",
  };

  const columnClass = classMap[this.__templateColumns];
  if (columnClass) {
    dom.classList.add(columnClass);
  }

  return dom;
}


  updateDOM(prevNode: this, dom: HTMLElement): boolean {
    if (prevNode.__templateColumns !== this.__templateColumns) {
      dom.setAttribute("data-template-columns", this.__templateColumns);
      // İsteğe bağlı olarak class güncellenebilir
    }
    return false;
  }

exportDOM(): DOMExportOutput {
  const element = document.createElement("div");
  element.setAttribute("data-lexical-layout-container", "true");
  element.setAttribute("data-template-columns", this.__templateColumns);

  // Sabit layout-grid sınıfı
  element.classList.add("layout-grid");

  // Template'e göre sınıf eşleşmesi
  const classMap: Record<string, string> = {
    "1fr 1fr": "layout-cols-2",
    "1fr 3fr": "layout-cols-1-3",
    "1fr 1fr 1fr": "layout-cols-3",
    "1fr 2fr 1fr": "layout-cols-1-2-1",
    "1fr 1fr 1fr 1fr": "layout-cols-4",
  };

  const columnClass = classMap[this.__templateColumns];
  if (columnClass) {
    element.classList.add(columnClass);
  }

  return { element };
}


  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (
          domNode.hasAttribute("data-lexical-layout-container") ||
          domNode.hasAttribute("data-template-columns")
        ) {
          return {
            conversion: $convertLayoutContainerElement,
            priority: 2,
          };
        }
        return null;
      },
    };
  }

  static importJSON(json: SerializedLayoutContainerNode): LayoutContainerNode {
    return $createLayoutContainerNode().updateFromJSON(json);
  }

  updateFromJSON(
    serializedNode: LexicalUpdateJSON<SerializedLayoutContainerNode>
  ): this {
    return super
      .updateFromJSON(serializedNode)
      .setTemplateColumns(serializedNode.templateColumns);
  }

  isShadowRoot(): boolean {
    return true;
  }

  canBeEmpty(): boolean {
    return false;
  }

  exportJSON(): SerializedLayoutContainerNode {
    return {
      ...super.exportJSON(),
      templateColumns: this.__templateColumns,
    };
  }

  getTemplateColumns(): string {
    return this.getLatest().__templateColumns;
  }

  setTemplateColumns(templateColumns: string): this {
    const self = this.getWritable();
    self.__templateColumns = templateColumns;
    return self;
  }
}

export function $createLayoutContainerNode(
  templateColumns: string = ""
): LayoutContainerNode {
  return new LayoutContainerNode(templateColumns);
}

export function $isLayoutContainerNode(
  node: LexicalNode | null | undefined
): node is LayoutContainerNode {
  return node instanceof LayoutContainerNode;
}
