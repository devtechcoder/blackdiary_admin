import { Col, Form, Input, Modal, Radio, Row } from "antd";
import React, { useEffect, useRef, useState } from "react";

import DescriptionEditor from "../../components/DescriptionEditor";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";

const getPlainText = (value = "") => value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

const AddForm = ({ api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const requestRef = useRef(request);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    requestRef.current = request;
  }, [request]);

  useEffect(() => {
    if (!data) {
      form.resetFields();
      form.setFieldsValue({
        priority: 1,
        is_active: true,
      });
      setAnswer("");
      return;
    }

    setLoading(true);
    requestRef.current({
      url: `${api.addEdit}/${data._id}`,
      method: "GET",
      onSuccess: ({ data: faqData }) => {
        form.setFieldsValue({
          question: faqData?.question,
          priority: faqData?.priority || 1,
          is_active: typeof faqData?.is_active === "boolean" ? faqData.is_active : true,
        });
        setAnswer(faqData?.answer || "");
        setLoading(false);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error?.response?.data?.message || error?.message, Severty.ERROR);
      },
    });
  }, [api.addEdit, data, form]);

  const onCreate = (values) => {
    if (!getPlainText(answer)) {
      ShowToast(lang("Answer is required"), Severty.WARNING);
      return;
    }

    setLoading(true);
    requestRef.current({
      url: `${data ? api.addEdit + "/" + data._id : api.addEdit}`,
      method: data ? "PUT" : "POST",
      data: {
        ...values,
        answer,
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
        ShowToast(error?.response?.data?.message, Severty.ERROR);
      },
    });
  };

  return (
    <Modal
      open={show}
      width={850}
      okText={data ? lang("Update") : lang("Add")}
      cancelText={lang("Cancel")}
      onCancel={hide}
      okButtonProps={{
        form: "faq-form",
        htmlType: "submit",
        loading,
      }}
      centered
      className="tab_modal"
    >
      <Form
        id="faq-form"
        form={form}
        layout="vertical"
        onFinish={onCreate}
        initialValues={{
          priority: 1,
          is_active: true,
        }}
      >
        <h4 className="modal_title_cls">{data ? lang("Edit FAQ") : lang("Add New FAQ")}</h4>
        <Row gutter={[16, 0]}>
          <Col span={24}>
            <Form.Item
              label={lang("Question")}
              name="question"
              rules={[
                {
                  required: true,
                  message: lang("Question is required"),
                },
              ]}
              normalize={(value) => value.trimStart()}
            >
              <Input autoComplete="off" placeholder={lang("Enter Question")} />
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              label={lang("Priority")}
              name="priority"
              rules={[
                {
                  required: true,
                  message: lang("Priority is required"),
                },
              ]}
            >
              <Input autoComplete="off" type="number" min={1} max={10} placeholder={lang("Enter Priority")} />
            </Form.Item>
          </Col>

          <Col span={24} className="mb-2">
            <label className="ant-form-item-required" title={lang("Answer")}>
              {lang("Answer")}
            </label>
          </Col>
          <DescriptionEditor value={answer} placeholder={lang("Enter Answer")} onChange={setAnswer} colProps={{ span: 24 }} />

          <Col span={24}>
            <div className="status_wrap">
              <Form.Item label={lang("Status")} name="is_active">
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

export default AddForm;
