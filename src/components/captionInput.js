import { useState, useEffect } from "react";
import { EditorState, convertToRaw, ContentState, convertFromHTML } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";

export const CaptionInput = ({ onChange, placeholder, value }) => {
  const getInitialState = () => {
    if (value) {
      const blocksFromHTML = convertFromHTML(value);
      const content = ContentState.createFromBlockArray(blocksFromHTML);
      return EditorState.createWithContent(content);
    }
    return EditorState.createEmpty();
  };
  const [editorState, setEditorState] = useState(getInitialState);
  // Sample suggestions for @mentions
  const mentionSuggestions = [
    { text: "blackdiary", value: "blackdiary", url: "blackdiary" },
    { text: "user1", value: "user1", url: "user1" },
    { text: "shayariLover", value: "shayariLover", url: "shayariLover" },
  ];

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
      wrapperClassName="wrapperClassName"
      editorClassName="editorClassName"
      onEditorStateChange={handleEditorChange}
    />
  );
};
export default CaptionInput;
