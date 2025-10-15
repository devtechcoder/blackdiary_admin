import { Button, message, Upload, Image } from "antd";
import React, { useState, useEffect } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { uploadFile } from "react-s3";
import { s3Config } from "../config/s3Config";
import { ShowToast, Severty } from "../helper/toast";
import { getFileExtension } from "../helper/functions";

// Only banner image uplaod 600*400

const BannerImageUpload = ({
  fileType,
  value,
  imageType,
  btnName,
  onChange,
  size = 1,
  isDimension = false,
  ...props
}) => {
  const [file, setFile] = useState([]);

  const handleImgChange = async (event) => {
    const { file } = event;
    setFile([file]);
    const extension = getFileExtension(file.name);
    const name = `PLANIT_${new Date().getTime()}.${extension}`;

    const newFile = new File([file], name, { type: file.type });
    uploadFile(newFile, s3Config(imageType))
      .then((data) => {
        console.log("File Upload", newFile, data);
        const fileData = {
          uid: file.uid,
          name: name,
          status: "done",
          url: data.location,
          thumbUrl: data.location,
        };
        setFile([fileData]);
        if (onChange) {
          onChange([fileData]);
        }
      })
      .catch((err) => console.error(err));
  };

  const checkImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");

      img.onload = () => {
        if (img.width === 600 && img.height === 400) {
          resolve();
        } else {
          reject(
            `Please upload an image with dimensions 600X400. uploaded image is ${img.width} X ${img.height}`,
          );
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
        return false;
      }
      isDimension && (await checkImageDimensions(file));
      return true;
    } catch (err) {
      ShowToast(err, Severty.ERROR);
      return false;
    }
  };

  const onRemove = () => {
    setFile([]);
    if (onChange) {
      onChange([]);
    }
  };

  useEffect(() => {
    if (!value) setFile([]);
  }, [value]);

  return (
    <Upload
      listType="picture"
      maxCount={1}
      beforeUpload={beforeUpload}
      customRequest={handleImgChange}
      onRemove={onRemove}
      fileList={file}
      {...props}
    >
      {file && file.length > 0 && file !== "" ? null : (
        <Button icon={<UploadOutlined />}>
          {" "}
          {btnName ? `Upload ${btnName}` : ""}
        </Button>
      )}
    </Upload>
  );
};

export default BannerImageUpload;
