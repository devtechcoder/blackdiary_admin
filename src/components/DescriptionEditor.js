import { useEffect, useRef, useState } from "react";
import { EditorState, ContentState, Modifier, convertFromHTML, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";
import { Col } from "antd";

const DescriptionEditor = ({ onChange, placeholder, value, cover, colProps, insertVariable, onInsertVariableDone }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const lastSyncedValueRef = useRef("");
  const editorRef = useRef(null);

  // const handleEditorChange = (newEditorState) => {
  //   setEditorState(newEditorState);
  //   const htmlContent  = draftToHtml(convertToRaw(editorState.getCurrentContent()))
  //   if (onChange) {
  //     onChange(htmlContent);
  //   }
  // };

  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const emitHtmlChange = (contentState) => {
    const htmlContent = draftToHtml(contentState, null, null, {
      defaultBlockTag: "p",
      blockRenderers: {
        unstyled: (block) => {
          return `<p>${block.text.replace(/\n/g, "<br>")}</p>`;
        },
      },
    });

    lastSyncedValueRef.current = htmlContent;

    if (onChange) {
      onChange(htmlContent);
    }
  };

  const focusEditor = () => {
    const instance = editorRef.current;

    if (!instance) {
      return;
    }

    if (typeof instance.focus === "function") {
      instance.focus();
      return;
    }

    if (typeof instance.focusEditor === "function") {
      instance.focusEditor();
      return;
    }

    if (instance.editor && typeof instance.editor.focus === "function") {
      instance.editor.focus();
    }
  };

  const insertTextAtCursor = (text) => {
    if (!text) return;

    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const nextContentState = Modifier.insertText(currentContent, selection, text, editorState.getCurrentInlineStyle());
    const nextEditorState = EditorState.push(editorState, nextContentState, "insert-characters");
    const withSelection = EditorState.forceSelection(nextEditorState, nextContentState.getSelectionAfter());

    setEditorState(withSelection);
    const htmlContent = draftToHtml(convertToRaw(nextContentState), null, null, {
      defaultBlockTag: "p",
      blockRenderers: {
        unstyled: (block) => {
          return `<p>${block.text.replace(/\n/g, "<br>")}</p>`;
        },
      },
    });
    lastSyncedValueRef.current = htmlContent;
    if (onChange) {
      onChange(htmlContent);
    }

    setTimeout(() => {
      focusEditor();
    }, 0);
  };

  useEffect(() => {
    if (!insertVariable) return;
    insertTextAtCursor(`{{${insertVariable}}}`);
    if (onInsertVariableDone) {
      onInsertVariableDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insertVariable]);

  useEffect(() => {
    if (!value || typeof value !== "string") {
      lastSyncedValueRef.current = "";
      setEditorState(EditorState.createEmpty());
      return;
    }

    if (value === lastSyncedValueRef.current) {
      return;
    }

    const blocksFromHTML = convertFromHTML(value);
    const contentBlocks = blocksFromHTML?.contentBlocks || [];
    const entityMap = blocksFromHTML?.entityMap || {};

    if (!contentBlocks.length) {
      lastSyncedValueRef.current = value;
      setEditorState(EditorState.createWithContent(ContentState.createFromText("")));
      return;
    }

    const content = ContentState.createFromBlockArray(contentBlocks, entityMap);
    lastSyncedValueRef.current = value;
    setEditorState(EditorState.createWithContent(content));
  }, [value]);

  return (
    <Col md={cover ? cover.md : 24} {...colProps}>
      <Editor
        ref={editorRef}
        editorState={editorState}
        placeholder={placeholder}
        toolbarClassName="toolbarClassName"
        wrapperClassName="wrapperClassName"
        editorClassName="editorClassName"
        onEditorStateChange={handleEditorChange}
        onContentStateChange={emitHtmlChange}
      />
    </Col>
  );
};

export default DescriptionEditor;
