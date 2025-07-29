"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the Lexical editor to avoid SSR issues
const LexicalEditor = dynamic(() => import("../../package/App"), {
  ssr: false,
  loading: () => <div>Loading editor...</div>,
});

export default function TestEditorPage() {
  const [editorValue, setEditorValue] = useState("");
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, result, details = "") => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      result,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runCopyTest = () => {
    try {
      // This is a basic test - in real usage, you'd need to interact with the editor
      addTestResult("Copy Test", "Manual test required", "Select text in editor and use Ctrl+C or right-click → Copy");
    } catch (error) {
      addTestResult("Copy Test", "Error", error.message);
    }
  };

  const runPasteTest = () => {
    try {
      addTestResult("Paste Test", "Manual test required", "Copy text from outside and paste into editor with Ctrl+V");
    } catch (error) {
      addTestResult("Paste Test", "Error", error.message);
    }
  };

  const runClipboardAPITest = () => {
    try {
      const hasClipboard = !!navigator.clipboard;
      const hasRead = !!(navigator.clipboard && navigator.clipboard.read);
      const hasWrite = !!(navigator.clipboard && navigator.clipboard.writeText);
      const isHTTPS = window.location.protocol === 'https:';
      
      addTestResult("Clipboard API Test", 
        hasClipboard ? "Available" : "Not Available",
        `Read: ${hasRead}, Write: ${hasWrite}, HTTPS: ${isHTTPS}`
      );
    } catch (error) {
      addTestResult("Clipboard API Test", "Error", error.message);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Lexical Editor Copy-Paste Test</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <h2>Test Controls</h2>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button 
            onClick={runClipboardAPITest}
            style={{
              padding: "10px 15px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Test Clipboard API
          </button>
          <button 
            onClick={runCopyTest}
            style={{
              padding: "10px 15px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Test Copy
          </button>
          <button 
            onClick={runPasteTest}
            style={{
              padding: "10px 15px",
              backgroundColor: "#ffc107",
              color: "black",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Test Paste
          </button>
          <button 
            onClick={clearResults}
            style={{
              padding: "10px 15px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Clear Results
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <h2>Editor</h2>
          <div style={{ border: "1px solid #ccc", borderRadius: "5px", minHeight: "400px" }}>
            <LexicalEditor 
              value={editorValue}
              onChange={setEditorValue}
            />
          </div>
        </div>

        <div>
          <h2>Test Results</h2>
          <div style={{ 
            border: "1px solid #ccc", 
            borderRadius: "5px", 
            padding: "10px",
            maxHeight: "400px",
            overflow: "auto"
          }}>
            {testResults.length === 0 ? (
              <p style={{ color: "#666" }}>No test results yet. Run some tests to see results here.</p>
            ) : (
              testResults.map((result) => (
                <div 
                  key={result.id}
                  style={{
                    padding: "10px",
                    margin: "5px 0",
                    backgroundColor: result.result === "Error" ? "#f8d7da" : 
                                   result.result === "Available" ? "#d4edda" : "#fff3cd",
                    border: "1px solid #dee2e6",
                    borderRadius: "3px"
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>
                    {result.test} - {result.result}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {result.timestamp}
                  </div>
                  {result.details && (
                    <div style={{ fontSize: "14px", marginTop: "5px" }}>
                      {result.details}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Instructions</h2>
        <ol>
          <li><strong>Look for the debug panel</strong> in the top-right corner of the screen</li>
          <li><strong>Test Clipboard API</strong> - Click the button to check browser capabilities</li>
          <li><strong>Test Copy</strong> - Type text in the editor, select it, and copy (Ctrl+C)</li>
          <li><strong>Test Paste</strong> - Copy text from outside the editor and paste (Ctrl+V)</li>
          <li><strong>Check debug panel</strong> for real-time clipboard event information</li>
        </ol>

        <h3>Expected Behavior</h3>
        <ul>
          <li>Copy should work with Ctrl+C or right-click menu</li>
          <li>Paste should work with Ctrl+V or right-click menu</li>
          <li>Debug panel should show clipboard events and API status</li>
          <li>No JavaScript errors in browser console (F12)</li>
        </ul>

        <h3>Troubleshooting</h3>
        <ul>
          <li>If copy-paste doesn't work, check the debug panel for error messages</li>
          <li>Ensure you're on HTTPS (clipboard API requirement)</li>
          <li>Try different browsers (Chrome, Firefox, Edge)</li>
          <li>Check browser console for JavaScript errors</li>
        </ul>
      </div>
    </div>
  );
} 