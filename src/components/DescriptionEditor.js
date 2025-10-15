import { useState, useEffect } from "react";
import { EditorState, convertToRaw, ContentState, convertFromHTML } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";

const DescriptionEditor = ({ onChange, placeholder, value }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // const handleEditorChange = (newEditorState) => {
  //   setEditorState(newEditorState);
  //   const htmlContent  = draftToHtml(convertToRaw(editorState.getCurrentContent()))
  //   if (onChange) {
  //     onChange(htmlContent);
  //   }
  // };

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

  useEffect(() => {
    if (value) {
      const blocksFromHTML = convertFromHTML(value);
      const content = ContentState.createFromBlockArray(blocksFromHTML);
      const editorState = EditorState.createWithContent(content);
      setEditorState(editorState);
    }
  }, []);

  return (
    <Editor
      editorState={editorState}
      placeholder={placeholder}
      toolbarClassName="toolbarClassName"
      wrapperClassName="wrapperClassName"
      editorClassName="editorClassName"
      onEditorStateChange={handleEditorChange}
    />
  );
};

export default DescriptionEditor;
