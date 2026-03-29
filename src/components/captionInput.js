import { useEffect, useRef, useState } from "react";
import { EditorState, convertToRaw, ContentState, convertFromHTML } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";

export const CaptionInput = ({ onChange, placeholder, value }) => {
  const lastSyncedValueRef = useRef("");

  const createEditorStateFromValue = (inputValue) => {
    if (!inputValue || typeof inputValue !== "string") {
      return EditorState.createEmpty();
    }

    const blocksFromHTML = convertFromHTML(inputValue);
    const contentBlocks = blocksFromHTML?.contentBlocks || [];
    const entityMap = blocksFromHTML?.entityMap || {};

    if (!contentBlocks.length) {
      return EditorState.createEmpty();
    }

    const content = ContentState.createFromBlockArray(contentBlocks, entityMap);
    return EditorState.createWithContent(content);
  };

  const [editorState, setEditorState] = useState(() => createEditorStateFromValue(value));

  const mentionSuggestions = [
    { text: "blackdiary", value: "blackdiary", url: "blackdiary" },
    { text: "user1", value: "user1", url: "user1" },
    { text: "shayariLover", value: "shayariLover", url: "shayariLover" },
  ];

  useEffect(() => {
    if (value === lastSyncedValueRef.current) {
      return;
    }

    lastSyncedValueRef.current = value || "";
    setEditorState(createEditorStateFromValue(value));
  }, [value]);

  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
    const rawContent = convertToRaw(newEditorState.getCurrentContent());

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

  return (
    <Editor
      toolbarHidden
      preserveWhitespace
      stripPastedStyles={true}
      handlePastedText={() => false}
      toolbar={{
        options: [],
      }}
      mention={{
        separator: " ",
        trigger: "@",
        suggestions: mentionSuggestions,
      }}
      hashtag={{
        separator: " ",
        trigger: "#",
      }}
      editorState={editorState}
      placeholder={placeholder}
      toolbarClassName="toolbarClassName"
      wrapperClassName="caption-editor-wrapper"
      editorClassName="caption-editor-editor"
      onEditorStateChange={handleEditorChange}
    />
  );
};
export default CaptionInput;
