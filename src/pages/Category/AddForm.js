import { Col, Form, Input, Modal, Radio, Row } from "antd";
import React, { useEffect, useState } from "react";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import lang from "../../helper/langHelper";
import Checkbox from "antd/lib/checkbox/Checkbox";

const AddForm = ({ api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data) return;
    form.setFieldsValue({ ...data });
  }, [data]);

  const onCreate = (values) => {
    setLoading(true);
    const payload = {
      ...values,
    };

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
        ShowToast(error?.response?.data?.message, Severty.ERROR);
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
        <h4 className="modal_title_cls">{data ? lang(`Edit Category`) : lang(`Add New Category`)}</h4>
        <Row gutter={[16, 0]}>
          <Col span={24} sm={12}>
            <Form.Item
              label={lang(`Category Name`)}
              name="name"
              rules={[
                {
                  required: true,
                  message: lang("Name is required"),
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
              <Input autoComplete="off" placeholder={lang(`Enter Category Name`)} />
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label={lang(`Category Name Hindi`)}
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
        </Row>
      </Form>
    </Modal>
  );
};

export default AddForm;
