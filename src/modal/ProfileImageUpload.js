import { Button, Upload } from "antd";
import React, { useState, useEffect } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { ShowToast, Severty } from "../helper/toast";
import apiPath from "../constants/apiPath";
import useRequest from "../hooks/useRequest";
import ImgCrop from "antd-img-crop"; // <-- CROP SUPPORT

const ProfileImageUpload = ({ fileType, value, imageType, btnName, onChange, size = 10, isDimension = false, ...props }) => {
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
      onSuccess: ({ data, status, message }) => {
        setLoading(false);
        if (status) {
          ShowToast(message, Severty.SUCCESS);
          setFile([{ ...file, status: "done", url: data?.path }]);
          if (onChange) {
            onChange(data?.path);
          }
        } else {
          ShowToast(message, Severty.ERROR);
        }
      },
      onError: (error) => {
        ShowToast(error?.response?.data?.message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  const beforeUpload = async (file) => {
    try {
      if (!fileType.includes(file.type)) {
        ShowToast("File format is not correct", Severty.ERROR);
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < size;
      if (!isLt2M) {
        ShowToast(`Image must be smaller than ${size} MB!`, Severty.ERROR);
        return false;
      }
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
    <ImgCrop rotate quality={1} modalTitle="Crop Image" showGrid shape="round" modalClassName="bg-[#121212] text-white">
      <Upload listType="picture" maxCount={1} beforeUpload={beforeUpload} customRequest={handleImgChange} onRemove={onRemove} fileList={file} {...props}>
        {file && file.length > 0 ? null : <Button icon={<UploadOutlined />}> {btnName ? `${btnName}` : "Upload"}</Button>}
      </Upload>
    </ImgCrop>
  );
};

export default ProfileImageUpload;
