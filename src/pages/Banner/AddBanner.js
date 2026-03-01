import { Col, DatePicker, Form, Image, Input, InputNumber, Modal, Row, Select, Radio } from "antd";
import React, { useEffect, useState } from "react";

import notfound from "../../assets/images/not_found.png";
import SingleImageUpload from "../../components/SingleImageUpload";
import apiPath from "../../constants/apiPath";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import moment from "moment";
import lang from "../../helper/langHelper";
const bannerPositions = [
  { name: "Top banner", label: lang("Top Banner") },
  // { name: "Mid banner", label: "Mid Banner" },
  { name: "Bottom banner", label: lang("Bottom Banner") },
];

const FileType = ["image/png", "image/jpg", "image/jpeg", "image/avif", "image/webp", "image/gif"];

const AdvertisementBannerForm = ({ section, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState();
  const [mobileImage, setMobileImage] = useState();
  const [imagePreview, setImagePreview] = useState(notfound);
  const [mobileImagePreview, setMobileImagePreview] = useState(notfound);
  const [isImageRemove, setIsImageRemove] = useState(false);
  const [isMobileImageRemove, setIsMobileImageRemove] = useState(false);
  const [category, setCategory] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const handleImage = (file) => {
    if (!file) {
      setIsImageRemove(Boolean(data?.image));
      setImage();
      form.validateFields(["image"]);
      return;
    }
    setIsImageRemove(false);
    setImage(file);
    form.validateFields(["image"]);
  };

  const handleMobileImage = (file) => {
    if (!file) {
      setIsMobileImageRemove(Boolean(data?.mobile_image));
      setMobileImage();
      return;
    }
    setIsMobileImageRemove(false);
    setMobileImage(file);
  };

  const onCreate = (values) => {
    const payload = new FormData();
    Object.entries(values || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (key === "start_date" || key === "end_date") {
        payload.append(key, value);
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => payload.append(`${key}[]`, item));
        return;
      }

      if (typeof value === "boolean") {
        payload.append(key, value ? "true" : "false");
        return;
      }

      payload.append(key, value);
    });

    const selectedWebImage = image instanceof File ? image : image?.originFileObj;
    if (selectedWebImage instanceof File) {
      payload.append("image", selectedWebImage);
    }

    const selectedMobileImage = mobileImage instanceof File ? mobileImage : mobileImage?.originFileObj;
    if (selectedMobileImage instanceof File) {
      payload.append("mobile_image", selectedMobileImage);
    }
    if (data && isImageRemove) {
      payload.append("isImageRemove", "true");
    }
    if (data && isMobileImageRemove) {
      payload.append("isMobileImageRemove", "true");
    }

    setLoading(true);

    request({
      url: data ? apiPath.banner + "/" + data._id : apiPath.banner,
      method: data ? "PUT" : "POST",
      data: payload,
      header: {
        "Content-Type": "multipart/form-data",
      },
      onSuccess: (data) => {
        setLoading(false);
        console.log("data", data);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
          hide();
          refresh();
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

  useEffect(() => {
    if (!data) {
      form.resetFields();
      setImage(undefined);
      setMobileImage(undefined);
      setImagePreview(notfound);
      setMobileImagePreview(notfound);
      setIsImageRemove(false);
      setIsMobileImageRemove(false);
      return;
    }

    form.setFieldsValue({
      ...data,
      start_date: moment(data.start_date),
      end_date: moment(data.end_date),
    });

    setImage(data.image);
    setMobileImage(data?.mobile_image);
    setIsImageRemove(false);
    setIsMobileImageRemove(false);
  }, [data, form]);

  useEffect(() => {
    if (!image) {
      setImagePreview(notfound);
      return;
    }

    const selectedFile = image instanceof File ? image : image?.originFileObj;
    if (selectedFile instanceof File) {
      const filePreview = URL.createObjectURL(selectedFile);
      setImagePreview(filePreview);
      return () => URL.revokeObjectURL(filePreview);
    }

    if (typeof image === "string") {
      setImagePreview(image);
      return;
    }

    if (image?.url) {
      setImagePreview(image.url);
      return;
    }

    if (image?.thumbUrl) {
      setImagePreview(image.thumbUrl);
      return;
    }

    setImagePreview(notfound);
  }, [image]);

  useEffect(() => {
    if (!mobileImage) {
      setMobileImagePreview(notfound);
      return;
    }

    const selectedFile = mobileImage instanceof File ? mobileImage : mobileImage?.originFileObj;
    if (selectedFile instanceof File) {
      const filePreview = URL.createObjectURL(selectedFile);
      setMobileImagePreview(filePreview);
      return () => URL.revokeObjectURL(filePreview);
    }

    if (typeof mobileImage === "string") {
      setMobileImagePreview(mobileImage);
      return;
    }

    if (mobileImage?.url) {
      setMobileImagePreview(mobileImage.url);
      return;
    }

    if (mobileImage?.thumbUrl) {
      setMobileImagePreview(mobileImage.thumbUrl);
      return;
    }

    setMobileImagePreview(notfound);
  }, [mobileImage]);

  const getCategory = () => {
    request({
      url: apiPath.common.categories,
      method: "GET",
      onSuccess: ({ data, status }) => {
        if (status) {
          setCategory(data);
        }
        console.log(data, "data");
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  const getOccasion = () => {
    request({
      url: apiPath.common.getOccasion,
      method: "GET",
      onSuccess: ({ data, status }) => {
        if (status) {
          setOccasions(data);
        }
        console.log(data, "data");
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  const getSubCategory = () => {
    request({
      url: `${apiPath.common.subCategories}`,
      method: "GET",
      onSuccess: ({ data, status }) => {
        if (status) {
          setSubCategories(data);
        }
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  useEffect(() => {
    getCategory();
    getOccasion();
    getSubCategory();
  }, []);

  return (
    <Modal
      width={750}
      open={show}
      okText={data ? lang("Update") : lang("Add")}
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
      initialValue={{
        is_active: true,
      }}
      className="tab_modal"
    >
      <Form id="create" form={form} onFinish={onCreate} layout="vertical">
        <h4 className="modal_title_cls">{data ? lang("Edit Banner") : lang("Add Banner")}</h4>
        <Row gutter={[16, 0]} className="w-100">
          <Col span={12}>
            <Form.Item
              className=""
              rules={[
                {
                  validator: (_, value) => {
                    if (image) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(lang("Image is required")));
                  },
                },
              ]}
              label={lang("Upload Banner Image (WEB)")}
              name="image"
            >
              <SingleImageUpload value={image} fileType={FileType} btnName={"Image"} imageType="advertisement" onChange={(file) => handleImage(file)} isDimension={true} />
              <p className="img-size-details">
                **
                {lang("Images should be 600x400 for best view in gallery image. You can select only (.gif, .png, .jpeg, .jpg) format files upto 1 MB file size")}
                ..!!!
              </p>
              {
                <div className="mt-2">
                  <Image width={120} src={imagePreview}></Image>
                </div>
              }
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              className=""
              // rules={[
              //   {
              //     validator: (_, value) => {
              //       if (mobileImage) {
              //         return Promise.resolve();
              //       }
              //       return Promise.reject(new Error(lang("Image is required")));
              //     },
              //   },
              // ]}
              label={lang("Upload Banner Image (APP)")}
              name="mobile_image"
            >
              <SingleImageUpload value={mobileImage} fileType={FileType} btnName={"Image"} imageType="advertisement" onChange={(file) => handleMobileImage(file)} isDimension={true} />
              <p className="img-size-details">
                **
                {lang("Images should be 600x400 for best view in gallery image. You can select only (.gif, .png, .jpeg, .jpg) format files upto 1 MB file size")}
                ..!!!
              </p>
              {
                <div className="mt-2">
                  <Image width={120} src={mobileImagePreview}></Image>
                </div>
              }
            </Form.Item>
          </Col>

          <Col span={12} md={12}>
            <Form.Item
              normalize={(value) => value.trimStart()}
              label={lang("Title")}
              name="title"
              rules={[
                {
                  required: true,
                  message: lang("Please Enter the title!"),
                },
                {
                  max: 200,
                  message: lang("title should not contain more then 200 characters!"),
                },
                {
                  min: 2,
                  message: lang("title should contain at least 2 characters!"),
                },
              ]}
            >
              <Input autoComplete="off" placeholder={lang("Enter Title")} />
            </Form.Item>
          </Col>
          <Col span={12} md={12}>
            <Form.Item
              label={lang("Start Date")}
              name="start_date"
              rules={[
                {
                  required: true,
                  message: lang("Please select the start date"),
                },
              ]}
            >
              <DatePicker format={"DD-MM-YYYY"} placeholder={lang("Select Start Date")} disabledDate={(current) => current && current < moment().endOf("day")} />
            </Form.Item>
          </Col>

          <Col span={12} md={12}>
            <Form.Item
              label={lang("End Date")}
              name="end_date"
              dependencies={["start_date"]}
              rules={[
                {
                  required: true,
                  message: lang("Please select the end date"),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("start_date") > value) {
                      return Promise.reject(lang("End date is not less than start date"));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker format={"DD-MM-YYYY"} placeholder={lang("Select End Date")} disabledDate={(current) => current && current < moment().endOf("day")} />
            </Form.Item>
          </Col>

          <Col span={12} md={12}>
            <Form.Item
              label={lang("Banner Link")}
              name="banner_link"
              rules={[
                {
                  required: false,
                  message: lang("Please Enter the Link"),
                },
              ]}
            >
              <Input placeholder="Enter Link" />
            </Form.Item>
          </Col>
          <Col span={24} sm={24} md={12}>
            <Form.Item
              name="position"
              label={lang("Banner Position")}
              rules={[
                {
                  required: true,
                  message: lang("Please select the Banner Position"),
                },
              ]}
            >
              <Select getPopupContainer={(triggerNode) => triggerNode.parentNode} placeholder={lang("Select Banner Position")} className="w-100">
                {bannerPositions.map((item) => (
                  <Select.Option key={item.name} value={item.name}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24} sm={24} md={12}>
            <Form.Item
              name="rotation_time"
              label={lang("Rotation Time")}
              rules={[
                {
                  required: true,
                  message: lang("Please select the rotation Time"),
                },
              ]}
            >
              <InputNumber placeholder="Enter Seconds" />
            </Form.Item>
          </Col>
          <Col span={12} sm={12}>
            <Form.Item
              label={lang("Category Name")}
              name="category"
              rules={[
                {
                  required: false,
                  message: lang("Please select the category!"),
                },
              ]}
            >
              <Select
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                placeholder={lang("Select Category")}
                showSearch
              >
                {category.map((item) => (
                  <Select.Option key={item.value} label={item.name} value={item.value}>
                    {item.name}{" "}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12} sm={12}>
            <Form.Item
              label={lang("Sub Category Name")}
              name="sub_category_ids"
              rules={[
                {
                  required: false,
                  message: lang("Please select the sub category!"),
                },
              ]}
            >
              <Select
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                placeholder={lang("Select Sub Category")}
                showSearch
                mode="multiple"
              >
                {subCategories?.map((item) => (
                  <Select.Option key={item._id} label={item.name} value={item._id}>
                    {item.name}{" "}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12} sm={12}>
            <Form.Item
              label={lang("Occasion Name")}
              name="occasion_ids"
              rules={[
                {
                  required: false,
                  message: lang("Please select the occasion!"),
                },
              ]}
            >
              <Select
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                placeholder={lang("Select Occasions")}
                showSearch
                mode="multiple"
              >
                {occasions?.map((item) => (
                  <Select.Option key={item._id} label={item.name} value={item._id}>
                    {item.name}{" "}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12} sm={12}>
            <div className="status_wrap">
              <Form.Item label={lang("Status")} name="is_active" initialValue={true}>
                <Radio.Group>
                  <Radio value={true}>{lang("Active")}</Radio>
                  <Radio value={false}>{lang("De-Active")}</Radio>
                </Radio.Group>
              </Form.Item>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AdvertisementBannerForm;
