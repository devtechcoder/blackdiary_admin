import { Col, Form, Image, Input, Modal, Radio, Row } from "antd";
import React, { useEffect, useState } from "react";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import lang from "../../helper/langHelper";
import Checkbox from "antd/lib/checkbox/Checkbox";
import SingleImageUpload from "../../components/SingleImageUpload";
import notfound from "../../assets/images/not_found.png";

const FileType = ["image/png", "image/jpg", "image/jpeg", "image/avif", "image/webp", "image/gif"];

const AddForm = ({ api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(notfound);
  const [isImageRemove, setIsImageRemove] = useState(false);

  useEffect(() => {
    if (!data) {
      form.resetFields();
      setImage(null);
      setImagePreview(notfound);
      setIsImageRemove(false);
      return;
    }

    form.setFieldsValue({ ...data });
    setImage(data?.image || null);
    setIsImageRemove(false);
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

  const onCreate = (values) => {
    setLoading(true);
    const payload = new FormData();
    payload.append("name", values.name || "");
    payload.append("hi_name", values.hi_name || "");
    payload.append("description", values.description || "");
    payload.append("hi_description", values.hi_description || "");
    payload.append("sort_number", values.sort_number || "");
    payload.append("is_active", values.is_active ?? true);
    payload.append("is_featured", values.is_featured ? true : false);

    const selectedFile = image instanceof File ? image : image?.originFileObj;
    if (selectedFile instanceof File) {
      payload.append("image", selectedFile);
    }
    if (data) {
      payload.append("isImageRemove", isImageRemove ? true : false);
    }

    request({
      url: `${data ? api.addEdit + "/" + data._id : api.addEdit}`,
      method: data ? "PUT" : "POST",
      data: payload,
      header: {
        "Content-Type": "multipart/form-data",
      },
      onSuccess: (data) => {
        setLoading(false);
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

  const handleImage = (file) => {
    if (!file) {
      setIsImageRemove(Boolean(data));
      setImage(null);
      form.validateFields(["image"]);
      return;
    }
    setIsImageRemove(false);
    setImage(file || null);
    form.validateFields(["image"]);
  };

  return (
    <Modal
      open={show}
      width={750}
      okText={data ? lang(`Update`) : lang(`Add`)}
      cancelText={lang(`Cancel`)}
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
    >
      <Form
        id="create"
        form={form}
        onFinish={onCreate}
        layout="vertical"
        initialValues={{
          is_active: true,
        }}
      >
        <h4 className="modal_title_cls">{data ? lang(`Edit Occasion`) : lang(`Add New Occasion`)}</h4>
        <Row gutter={[16, 0]}>
          <Col span={24} sm={12}>
            <Form.Item
              label={lang(`Occasion Name`)}
              name="name"
              rules={[
                {
                  required: true,
                  message: lang("Name is required"),
                },
                {
                  max: 200,
                  message: lang("Name should not contain more then 200 characters!"),
                },
                {
                  min: 2,
                  message: lang("Name should contain at least 2 characters!"),
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={lang(`Enter Occasion Name`)} />
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label={lang(`Occasion Name Hindi`)}
              name="hi_name"
              rules={[
                {
                  required: true,
                  message: lang("Hindi Name is required"),
                },
                {
                  max: 200,
                  message: lang("Name should not contain more then 200 characters!"),
                },
                {
                  min: 2,
                  message: lang("Name should contain at least 2 characters!"),
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={`Enter Occasion Name Hindi`} />
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label={lang(`Occasion Description`)}
              name="description"
              rules={[
                {
                  required: true,
                  message: lang("Description is required"),
                },
                {
                  max: 200,
                  message: lang("Description should not contain more then 200 characters!"),
                },
                {
                  min: 2,
                  message: lang("Description should contain at least 2 characters!"),
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={lang(`Enter Description`)} />
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label={lang(`Occasion Description Hindi`)}
              name="hi_description"
              rules={[
                {
                  required: true,
                  message: lang("Hindi Description is required"),
                },
                {
                  max: 200,
                  message: lang("Description should not contain more then 200 characters!"),
                },
                {
                  min: 2,
                  message: lang("Description should contain at least 2 characters!"),
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={`Enter Description Hindi`} />
            </Form.Item>
          </Col>
          <Col span={24} sm={12}>
            <Form.Item
              label={lang(`Sort Number (Unique)`)}
              name="sort_number"
              rules={[
                {
                  required: true,
                  message: lang("Sort Number is required"),
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" type="number" placeholder={`Enter Sort Number`} />
            </Form.Item>
          </Col>
          <Col span={24} sm={24}>
            <div className="status_wrap">
              <Form.Item label={lang("Status")} name="is_active">
                <Radio.Group>
                  <Radio value={true}>{lang("Active")}</Radio>
                  <Radio value={false}>{lang("De-Active")}</Radio>
                </Radio.Group>
              </Form.Item>
            </div>
          </Col>
          <Col span={12} sm={12}>
            <Form.Item label={lang("")} name="is_featured" valuePropName="checked">
              <Checkbox>Featured</Checkbox>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              className=""
              label={lang("Upload Image")}
              name="image"
              rules={[
                {
                  validator: () => {
                    if (!image) {
                      return Promise.reject(lang("Image is required"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <SingleImageUpload value={image} fileType={FileType} btnName={"Image"} imageType="advertisement" onChange={(data) => handleImage(data)} isDimension={true} />
              <p className="img-size-details">
                **
                {lang("Images  for best view in gallery image. You can select only (.gif, .png, .jpeg, .jpg) format files upto 1 MB file size")}
                ..!!!
              </p>
              {
                <div className="mt-2">
                  <Image width={120} src={imagePreview}></Image>
                </div>
              }
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddForm;
