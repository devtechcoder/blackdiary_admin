import { Col, DatePicker, Form, Input, Modal, Radio, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import lang from "../../helper/langHelper";
import { NumberInputBox, SelectInput, TextAreaInputBox, TextInputBox } from "../../components/InputField";
import DescriptionEditor from "../../components/DescriptionEditor";
import { webPageHeadingOptions } from "../../constants/var";

const AddForm = ({ api, show, hide, data, refresh, sectionName, slug }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const showSlugInput = ["web_page_heading"].includes(slug);
  const showLinkInput = ["user_safety_toolkit", "user_privacy_tools", "user_account_security"].includes(slug);
  const showDescriptionInput = ["user_safety_toolkit", "user_privacy_tools", "user_account_security"].includes(slug);
  const showPriorityInput = ["user_safety_toolkit", "user_privacy_tools", "user_account_security"].includes(slug);

  useEffect(() => {
    if (!data) return;
    form.setFieldsValue({
      ...data,
    });
  }, [data]);

  const onCreate = (values) => {
    const payload = {
      slug: slug,
      ...values,
    };

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
            label={lang(`Title`)}
            name="title"
            rules={[
              {
                required: true,
                message: lang("Title is required"),
              },
              {
                max: 50,
                message: lang("Title should not contain more then 50 characters!"),
              },
              {
                min: 2,
                message: lang("Title should contain at least 2 characters!"),
              },
            ]}
            placeholder={lang(`Enter  Title`)}
          />
          <TextInputBox
            label={lang(`Sub-Title`)}
            name="sub_title"
            rules={[
              {
                required: true,
                message: lang("Sub-Title is required"),
              },
              {
                max: 200,
                message: lang("Sub-Title should not contain more then 200 characters!"),
              },
              {
                min: 2,
                message: lang("Sub-Title should contain at least 2 characters!"),
              },
            ]}
            placeholder={lang(`Enter  Sub-Title`)}
          />
          {!!showSlugInput && (
            <SelectInput
              label={lang(`Type`)}
              name="type"
              options={webPageHeadingOptions}
              rules={[
                {
                  required: true,
                  message: lang("Type is required"),
                },
              ]}
              placeholder={lang(`Select Type`)}
            />
          )}
          {!!showLinkInput && (
            <TextInputBox
              label={lang(`Link`)}
              name="link"
              rules={[
                {
                  required: true,
                  message: lang("Link is required"),
                },
              ]}
              placeholder={lang(`Enter Link`)}
            />
          )}
          {!!showPriorityInput && (
            <NumberInputBox
              label={lang(`Priority`)}
              name="priority"
              rules={[
                {
                  required: true,
                  message: lang("Priority is required"),
                },
              ]}
              placeholder={lang(`Enter Priority`)}
            />
          )}

          {!!showDescriptionInput && (
            <TextAreaInputBox
              label={lang(`Description`)}
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
              placeholder={lang(`Enter Description`)}
            />
          )}
        </Row>
      </Form>
    </Modal>
  );
};

export default AddForm;
