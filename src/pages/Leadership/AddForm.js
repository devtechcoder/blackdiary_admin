import { Col, Form, Image, Modal, Row } from "antd";
import React, { useEffect, useState } from "react";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import lang from "../../helper/langHelper";
import { NumberInputBox, SelectInput, TextInputBox } from "../../components/InputField";
import DescriptionEditor from "../../components/DescriptionEditor";
import SingleImageUpload from "../../components/SingleImageUpload";
import notfound from "../../assets/images/not_found.png";

const FileType = ["image/png", "image/jpg", "image/jpeg", "image/avif", "image/webp", "image/gif"];

const AddForm = ({ api, show, hide, data, refresh, sectionName }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(data?.description || "");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(notfound);
  const [isImageRemove, setIsImageRemove] = useState(false);

  useEffect(() => {
    if (!data) {
      form.resetFields();
      setContent("");
      setImage(null);
      setImagePreview(notfound);
      setIsImageRemove(false);
      return;
    }
    form.setFieldsValue({
      ...data,
    });
    setContent(data?.description || "");
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
    if (!content.trim() || content === "<p><br></p>" || content === "<p></p>" || content === "<p></p>\n") {
      ShowToast("Please write description in the content box.", Severty.WARNING);
      return;
    }
    const payload = new FormData();
    payload.append("name", values.name || "");
    payload.append("designation", values.designation || "");
    payload.append("gender", values.gender || "");
    payload.append("sequence", values.sequence || "");
    payload.append("description", content || "");

    const selectedFile = image instanceof File ? image : image?.originFileObj;
    if (selectedFile instanceof File) {
      payload.append("image", selectedFile);
    }
    if (data) {
      payload.append("isImageRemove", isImageRemove ? true : false);
    }

    setLoading(true);
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
        <h4 className="modal_title_cls">{data ? lang(`Edit ${sectionName}`) : lang(`Add New ${sectionName}`)}</h4>
        <Row gutter={[16, 0]}>
          <TextInputBox
            label={lang(`Name`)}
            name="name"
            rules={[
              {
                required: true,
                message: lang("Name is required"),
              },
              {
                max: 100,
                message: lang("Name should not contain more then 100 characters!"),
              },
              {
                min: 2,
                message: lang("Name should contain at least 2 characters!"),
              },
            ]}
            normalize={(value) => value.trimStart()}
            autoComplete="off"
            placeholder={lang(`Enter  Name`)}
          />
          <TextInputBox
            label={lang(`Designation`)}
            name="designation"
            rules={[
              {
                required: true,
                message: lang("Designation is required"),
              },
              {
                max: 300,
                message: lang("Designation should not contain more then 20 characters!"),
              },
              {
                min: 2,
                message: lang("Designation should contain at least 2 characters!"),
              },
            ]}
            normalize={(value) => value.trimStart()}
            autoComplete="off"
            placeholder={lang(`Enter Designation Name`)}
          />

          <SelectInput
            label={lang(`Gender`)}
            name="gender"
            rules={[
              {
                required: true,
                message: lang("Please select the gender!"),
              },
            ]}
            placeholder={lang(`Select Gender`)}
            options={[
              { _id: "Male", name: lang("Male") },
              { _id: "Female", name: lang("Female") },
              { _id: "Other", name: lang("Other") },
            ]}
          />
          <NumberInputBox
            label={lang(`Sequence`)}
            name="sequence"
            rules={[
              {
                required: true,
                message: lang("Sequence is required"),
              },
            ]}
            autoComplete="off"
            placeholder={lang(`Enter Sequence Number`)}
          />
          <DescriptionEditor
            label={lang(`Description`)}
            name="description"
            rules={[
              {
                required: true,
                message: lang("Description is required"),
              },
            ]}
            placeholder={lang(`Enter Description`)}
            value={content}
            onChange={setContent}
          />
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
