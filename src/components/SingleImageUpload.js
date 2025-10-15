import { Button, message, Upload, Image } from "antd";
import React, { useState, useEffect } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { uploadFile } from "react-s3";
import { s3Config } from "../config/s3Config";
import { ShowToast, Severty } from "../helper/toast";
import { getFileExtension } from "../helper/functions";
import apiPath from "../constants/apiPath";
import useRequest from "../hooks/useRequest";

const SingleImageUpload = ({ fileType, value, imageType, btnName, onChange, size = 1, isDimension = false, ...props }) => {
  const [file, setFile] = useState([]);
  const [loading, setLoading] = useState(false);
  const { request } = useRequest();

  const handleImgChange = async ({ file }) => {
    const formData = new FormData();
    formData.append("image", file);
    setLoading(true);
    request({
      url: apiPath.common.imageUpload,
      method: "POST",
      data: formData,
      onSuccess: ({ data, status }) => {
        setLoading(false);
        if (status) {
          ShowToast(data.message, Severty.SUCCESS);
          setFile([file]);
          console.log(data, "data+++");
          if (onChange) {
            onChange(data?.path); // if you want to pass image URL/path to parent
          }
        } else {
          ShowToast(data.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        ShowToast(error?.response?.data?.message, Severty.ERROR);
        setLoading(false);
      },
    });
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

      // if (!isLt2M) {
      //   ShowToast(`Image must be smaller than ${size} MB!`, Severty.ERROR);
      //   return false;
      // }
      // isDimension && (await checkImageDimensions(file));
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
    <Upload listType="picture" maxCount={1} beforeUpload={beforeUpload} customRequest={handleImgChange} onRemove={onRemove} fileList={file} {...props}>
      {file && file.length > 0 && file !== "" ? null : <Button icon={<UploadOutlined />}> {btnName ? `Upload ${btnName}` : ""}</Button>}
    </Upload>
  );
};

export default SingleImageUpload;
