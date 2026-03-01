import { Button, Upload } from "antd";
import React, { useState, useEffect } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { ShowToast, Severty } from "../helper/toast";

const SingleImageUpload = ({ fileType, value, imageType, btnName, onChange, size = 5, isDimension = false, ...props }) => {
  const [file, setFile] = useState([]);

  const handleImgChange = ({ file: currentFile, fileList }) => {
    if (currentFile?.status === "removed" || !fileList?.length) {
      setFile([]);
      if (onChange) {
        onChange(null);
      }
      return;
    }

    const latestFile = fileList.slice(-1);
    setFile(latestFile);
    if (onChange) {
      onChange(currentFile?.originFileObj || currentFile || null);
    }
  };

  const checkImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");

      img.onload = () => {
        if (img.width === 600 && img.height === 600) {
          resolve();
        } else {
          reject(`Please upload an image with dimensions 600X600. uploaded image is ${img.width} X ${img.height}`);
        }
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const beforeUpload = async (file) => {
    try {
      if (fileType.includes(file.type)) {
      } else {
        ShowToast("File format is not correct", Severty.ERROR);
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < size;

      if (!isLt2M) {
        ShowToast(`Image must be smaller than ${size} MB!`, Severty.ERROR);
        return Upload.LIST_IGNORE;
      }
      // isDimension && (await checkImageDimensions(file));
      return false;
    } catch (err) {
      ShowToast(err, Severty.ERROR);
      return Upload.LIST_IGNORE;
    }
  };

  const onRemove = () => {
    setFile([]);
    if (onChange) {
      onChange(null);
    }
  };

  useEffect(() => {
    if (!value) {
      setFile([]);
      return;
    }

    if (typeof value === "string") {
      setFile([
        {
          uid: "-1",
          name: "image",
          status: "done",
          url: value,
        },
      ]);
      return;
    }

    if (value instanceof File) {
      setFile([
        {
          uid: String(value.lastModified || Date.now()),
          name: value.name,
          status: "done",
          originFileObj: value,
        },
      ]);
    }
  }, [value]);

  return (
    <Upload listType="picture" maxCount={1} beforeUpload={beforeUpload} onChange={handleImgChange} onRemove={onRemove} fileList={file} {...props}>
      {file && file.length > 0 && file !== "" ? null : <Button icon={<UploadOutlined />}> {btnName ? `Upload ${btnName}` : ""}</Button>}
    </Upload>
  );
};

export default SingleImageUpload;
