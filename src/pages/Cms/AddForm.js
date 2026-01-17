import { Col, DatePicker, Form, Input, Modal, Radio, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import lang from "../../helper/langHelper";
import { NumberInputBox, SelectInput, TextInputBox } from "../../components/InputField";
import DescriptionEditor from "../../components/DescriptionEditor";

const AddForm = ({ api, show, hide, data, refresh, sectionName }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(data?.description || "");

  useEffect(() => {
    if (!data) return;
    form.setFieldsValue({
      ...data,
    });
    setContent(data?.description || "");
  }, [data]);

  const onCreate = (values) => {
    const payload = {
      ...values,
    };
    if (!content.trim() || content === "<p><br></p>" || content === "<p></p>" || content === "<p></p>\n") {
      ShowToast("Please write description in the content box.", Severty.WARNING);
      return;
    }
    payload.description = content || "";

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
                max: 20,
                message: lang("Name should not contain more then 20 characters!"),
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
            label={lang(`Slug`)}
            name="slug"
            rules={[
              {
                required: true,
                message: lang("Slug is required"),
              },
              {
                max: 300,
                message: lang("Slug should not contain more then 20 characters!"),
              },
              {
                min: 2,
                message: lang("Slug should contain at least 2 characters!"),
              },
            ]}
            normalize={(value) => value.trimStart()}
            autoComplete="off"
            placeholder={lang(`Enter Slug`)}
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
        </Row>
      </Form>
    </Modal>
  );
};

export default AddForm;
