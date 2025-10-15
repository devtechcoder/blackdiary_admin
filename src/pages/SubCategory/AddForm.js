import { Col, Form, Image, Input, Modal, Radio, Row, Select, Checkbox } from "antd";
import React, { useEffect, useState } from "react";

import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import lang from "../../helper/langHelper";
import notfound from "../../assets/images/not_found.png";
import SingleImageUpload from "../../components/SingleImageUpload";
import { colorOptions } from "../../constants/var";

const AddForm = ({ api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState([]);
  const [image, setImage] = useState();
  const FileType = ["image/png", "image/jpg", "image/jpeg", "image/avif", "image/webp", "image/gif"];
  const handleImage = (data) => {
    data ? setImage(data) : setImage();
  };
  const getCategory = () => {
    request({
      url: api.categories,
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

  useEffect(() => {
    getCategory();
  }, []);

  useEffect(() => {
    if (!data) return;
    console.log(data);
    form.setFieldsValue({ ...data });
    setImage(data.image);
  }, [data]);

  const onCreate = (values) => {
    const payload = { ...values, image: image };
    setLoading(true);
    request({
      url: `${data ? api.addEdit + "/" + data._id : api.addEdit}`,
      method: data ? "PUT" : "POST",
      data: payload,
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
        ShowToast(error.response.data.message, Severty.ERROR);
        setLoading(false);
      },
    });
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
        <h4 className="modal_title_cls">{data ? lang(`Edit Sub Category`) : lang(`Add New Sub Category`)}</h4>
        <Row gutter={[16, 0]}>
          <Col span={24} sm={24}>
            <Form.Item
              label={lang("Category Name")}
              name="category"
              rules={[
                {
                  required: true,
                  message: lang("Please select the category!"),
                },
              ]}
            >
              <Select
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                mode="multiple"
                filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                placeholder={lang("Select Category")}
                showSearch
              >
                {category.map((item) => (
                  <Select.Option key={item.value} label={item.value} value={item.value}>
                    {item.name}{" "}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24} sm={12}>
            <Form.Item
              label={lang(`Sub Category Name`)}
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
              <Input autoComplete="off" placeholder={lang(`Enter Sub Category Name`)} />
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label={lang(`Sub Category Name Hindi`)}
              name="hi_name"
              rules={[
                {
                  required: true,
                  message: lang("Hindi Name is required"),
                },
                {
                  max: 20,
                  message: lang("Name should not contain more then 20 characters!"),
                },
                {
                  min: 2,
                  message: lang("Name should contain at least 2 characters!"),
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={`Enter Category Name Hindi`} />
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

          <Col span={12} sm={12}>
            <Form.Item
              label={lang("BackGround Color")}
              name="bg_color"
              rules={[
                {
                  required: true,
                  message: lang("Please select the Color!"),
                },
              ]}
            >
              <Select
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                placeholder={lang("Select Background Color")}
                showSearch
              >
                {colorOptions.map((item) => (
                  <Select.Option key={item.value} label={item.value} value={item.value}>
                    {item.name}{" "}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12} sm={12}>
            <Form.Item label={lang("")} name="is_featured" valuePropName="checked">
              <Checkbox>Featured</Checkbox>
            </Form.Item>
          </Col>
          <Col span={12} sm={12}>
            <div className="status_wrap">
              <Form.Item label={lang("Status")} name="is_active">
                <Radio.Group>
                  <Radio value={true}>{lang("Active")}</Radio>
                  <Radio value={false}>{lang("De-Active")}</Radio>
                </Radio.Group>
              </Form.Item>
            </div>
          </Col>

          <Col span={24}>
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
              label={lang("Upload Image")}
              name="image"
            >
              <SingleImageUpload value={image} fileType={FileType} btnName={"Image"} imageType="advertisement" onChange={(data) => handleImage(data)} isDimension={true} />
              <p className="img-size-details">
                **
                {lang("Images should be 600x400 for best view in gallery image. You can select only (.gif, .png, .jpeg, .jpg) format files upto 1 MB file size")}
                ..!!!
              </p>
              {
                <div className="mt-2">
                  <Image width={120} src={image ? image : notfound}></Image>
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
