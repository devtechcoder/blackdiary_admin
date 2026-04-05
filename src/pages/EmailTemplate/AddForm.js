import { Col, Form, Modal, Row, Select, Tooltip } from "antd";
import React, { useEffect, useMemo, useState } from "react";

import DescriptionEditor from "../../components/DescriptionEditor";
import { SelectInput, TextInputBox } from "../../components/InputField";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";

const getPlainText = (value = "") =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const DEFAULT_SLUG_OPTIONS = [
  { _id: "user-registration", name: "User Registration" },
  { _id: "send-one-time-otp", name: "Send One-Time OTP" },
  { _id: "order-confirmation", name: "Order Confirmation" },
  { _id: "account-verification", name: "Account Verification" },
  { _id: "password-reset", name: "Password Reset" },
];

const VARIABLE_OPTIONS = [
  { value: "USER_NAME", label: "USER_NAME" },
  { value: "EMAIL", label: "EMAIL" },
  { value: "OTP", label: "OTP" },
];

const AddForm = ({ api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [insertVariable, setInsertVariable] = useState(undefined);
  const [selectedVariable, setSelectedVariable] = useState(undefined);

  const slugOptions = useMemo(() => {
    if (data?.slug && !DEFAULT_SLUG_OPTIONS.some((item) => item._id === data.slug)) {
      return [...DEFAULT_SLUG_OPTIONS, { _id: data.slug, name: data.slug }];
    }
    return DEFAULT_SLUG_OPTIONS;
  }, [data?.slug]);

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        name: data?.name || "",
        slug: data?.slug || undefined,
        subject: data?.subject || "",
      });
      setContent(data?.description || "");
      setInsertVariable(undefined);
      setSelectedVariable(undefined);
      return;
    }

    form.resetFields();
    setContent("");
    setInsertVariable(undefined);
    setSelectedVariable(undefined);
    form.setFieldsValue({
      name: "",
      slug: undefined,
      subject: "",
    });
  }, [data, form]);

  const onCreate = (values) => {
    if (!getPlainText(content)) {
      ShowToast(lang("Description is required"), Severty.WARNING);
      return;
    }

    setLoading(true);
    request({
      url: `${data ? `${api.addEdit}/${data._id}` : api.addEdit}`,
      method: data ? "PUT" : "POST",
      data: {
        ...values,
        description: content,
      },
      onSuccess: (response) => {
        setLoading(false);
        if (response.status) {
          ShowToast(response.message, Severty.SUCCESS);
          hide();
          refresh();
          return;
        }
        ShowToast(response.message, Severty.ERROR);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error?.response?.data?.message || error?.message || "Failed to save email template", Severty.ERROR);
      },
    });
  };

  return (
    <Modal
      open={show}
      width={750}
      okText={data ? lang("Update") : lang("Add")}
      cancelText={lang("Cancel")}
      onCancel={hide}
      okButtonProps={{
        form: "email-template-form",
        htmlType: "submit",
        loading,
      }}
      centered
      className="tab_modal"
    >
      <Form
        id="email-template-form"
        form={form}
        layout="vertical"
        onFinish={onCreate}
        initialValues={{
          name: "",
          slug: undefined,
          subject: "",
        }}
      >
        <h4 className="modal_title_cls">{data ? lang("Edit Email Template") : lang("Add New Email Template")}</h4>
        <Row gutter={[16, 0]}>
          <TextInputBox
            label={lang("Name")}
            name="name"
            rules={[
              {
                required: true,
                message: lang("Name is required"),
              },
            ]}
            normalize={(value) => value.trimStart()}
            autoComplete="off"
            placeholder={lang("Enter Template Name")}
          />

          <SelectInput
            label={lang("Slug")}
            name="slug"
            rules={[
              {
                required: true,
                message: lang("Slug is required"),
              },
            ]}
            options={slugOptions}
            placeholder={lang("Select Slug")}
            showSearch
            allowClear
            optionFilterProp="label"
          />

          <TextInputBox
            label={lang("Subject")}
            name="subject"
            cover={{ md: 24 }}
            rules={[
              {
                required: true,
                message: lang("Subject is required"),
              },
            ]}
            normalize={(value) => value.trimStart()}
            autoComplete="off"
            placeholder={lang("Enter Email Subject")}
          />

          <Col span={24} sm={12}>
            <Tooltip title={lang("Insert dynamic variables")} placement="topLeft">
              <Form.Item label={lang("Insert Variable")}>
                <Select
                  value={selectedVariable}
                  allowClear
                  placeholder={lang("Select Variable")}
                  options={VARIABLE_OPTIONS}
                  onChange={(value) => {
                    if (!value) {
                      setSelectedVariable(undefined);
                      return;
                    }

                    setSelectedVariable(value);
                    setInsertVariable(value);
                  }}
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                />
              </Form.Item>
            </Tooltip>
          </Col>

          <Col span={24} className="mb-2">
            <label className="ant-form-item-required" title={lang("Description / Body")}>
              {lang("Description / Body")}
            </label>
          </Col>
          <DescriptionEditor
            value={content}
            placeholder={lang("Enter Description")}
            onChange={setContent}
            colProps={{ span: 24 }}
            insertVariable={insertVariable}
            onInsertVariableDone={() => {
              setInsertVariable(undefined);
              setSelectedVariable(undefined);
            }}
          />
        </Row>
      </Form>
    </Modal>
  );
};

export default AddForm;
