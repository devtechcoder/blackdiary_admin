import { useEffect, useRef, useState } from "react";
import { EditorState, ContentState, convertFromHTML } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";
import { Col } from "antd";

const DescriptionEditor = ({ onChange, placeholder, value, cover, colProps }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const lastSyncedValueRef = useRef("");

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

  const handleContentChange = (rawContent) => {
    const htmlContent = draftToHtml(rawContent, null, null, {
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
        editorState={editorState}
        placeholder={placeholder}
        toolbarClassName="toolbarClassName"
        wrapperClassName="wrapperClassName"
        editorClassName="editorClassName"
        onEditorStateChange={handleEditorChange}
        onContentStateChange={handleContentChange}
      />
    </Col>
  );
};

export default DescriptionEditor;
