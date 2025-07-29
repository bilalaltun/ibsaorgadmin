import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_LOW, PASTE_COMMAND, COPY_COMMAND, CUT_COMMAND } from "lexical";
import { useEffect, useState } from "react";

export default function CopyPasteDebugPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    // Log clipboard API availability
    addDebugInfo(`Clipboard API available: ${!!navigator.clipboard}`);
    addDebugInfo(`Clipboard read available: ${!!(navigator.clipboard && navigator.clipboard.read)}`);
    addDebugInfo(`Clipboard write available: ${!!(navigator.clipboard && navigator.clipboard.writeText)}`);
    
    // Check if we're on HTTPS
    addDebugInfo(`HTTPS: ${window.location.protocol === 'https:'}`);
    
    // Check permissions
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'clipboard-read' as PermissionName })
        .then(permission => {
          addDebugInfo(`Clipboard read permission: ${permission.state}`);
        })
        .catch(err => {
          addDebugInfo(`Permission check failed: ${err.message}`);
        });
    }

    const removePasteListener = editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        if (event instanceof ClipboardEvent) {
          const clipboardData = event.clipboardData;
          if (clipboardData) {
            addDebugInfo(`Paste event - Types: ${Array.from(clipboardData.types).join(', ')}`);
            addDebugInfo(`Files count: ${clipboardData.files?.length || 0}`);
            addDebugInfo(`Items count: ${clipboardData.items?.length || 0}`);
            
            if (clipboardData.types.includes('text/plain')) {
              const text = clipboardData.getData('text/plain');
              addDebugInfo(`Text content length: ${text?.length || 0}`);
            }
            
            if (clipboardData.types.includes('text/html')) {
              const html = clipboardData.getData('text/html');
              addDebugInfo(`HTML content length: ${html?.length || 0}`);
            }
          }
        }
        return false; // Don't prevent default
      },
      COMMAND_PRIORITY_LOW
    );

    const removeCopyListener = editor.registerCommand(
      COPY_COMMAND,
      () => {
        addDebugInfo('Copy command triggered');
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    const removeCutListener = editor.registerCommand(
      CUT_COMMAND,
      () => {
        addDebugInfo('Cut command triggered');
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    return () => {
      removePasteListener();
      removeCopyListener();
      removeCutListener();
    };
  }, [editor]);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '300px',
      maxHeight: '400px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      overflow: 'auto',
      borderRadius: '5px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Copy-Paste Debug</div>
      {debugInfo.map((info, index) => (
        <div key={index} style={{ marginBottom: '2px' }}>{info}</div>
      ))}
      <button 
        onClick={() => setDebugInfo([])}
        style={{
          marginTop: '10px',
          padding: '5px 10px',
          backgroundColor: '#666',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        Clear
      </button>
    </div>
  );
} 