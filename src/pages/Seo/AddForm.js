import { Collapse, Form, Modal, Row } from "antd";
import React, { useEffect, useState } from "react";
import { SelectInput, TextAreaInputBox, TextInputBox } from "../../components/InputField";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";

const { Panel } = Collapse;

const AddForm = ({ api, show, hide, data, refresh, sectionName }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data) {
      form.resetFields();
      form.setFieldsValue({ section: "page" });
      return;
    }

    form.setFieldsValue({
      section: data.section || "page",
      page_key: data.page_key || "",
      primary: {
        title: data?.primary?.title || "",
        description: data?.primary?.description || "",
        keywords: data?.primary?.keywords || "",
      },
      openGraph: {
        title: data?.openGraph?.title || "",
        description: data?.openGraph?.description || "",
        image: data?.openGraph?.image || "",
        url: data?.openGraph?.url || "",
        type: data?.openGraph?.type || "",
        site_name: data?.openGraph?.site_name || "",
      },
      twitter: {
        title: data?.twitter?.title || "",
        description: data?.twitter?.description || "",
        image: data?.twitter?.image || "",
        url: data?.twitter?.url || "",
        type: data?.twitter?.type || "",
        site_name: data?.twitter?.site_name || "",
      },
      common: {
        title: data?.common?.title || "",
        robots: data?.common?.robots || "",
        language: data?.common?.language || "",
        author: data?.common?.author || "",
        description: data?.common?.description || "",
        keywords: data?.common?.keywords || "",
        image: data?.common?.image || "",
        url: data?.common?.url || "",
        type: data?.common?.type || "",
        site_name: data?.common?.site_name || "",
      },
    });
  }, [data, form]);

  const onCreate = (values) => {
    const payload = {
      section: values.section || "page",
      page_key: values.page_key || "",
      primary: values.primary || {},
      openGraph: values.openGraph || {},
      twitter: values.twitter || {},
      common: values.common || {},
    };

    setLoading(true);
    request({
      url: `${data ? `${api.addEdit}/${data._id}` : api.addEdit}`,
      method: data ? "PUT" : "POST",
      data: payload,
      onSuccess: (response) => {
        setLoading(false);
        if (response?.status) {
          ShowToast(response?.message, Severty.SUCCESS);
          hide();
          refresh();
          return;
        }
        ShowToast(response?.message || "Something went wrong", Severty.ERROR);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error?.response?.data?.message || "Something went wrong", Severty.ERROR);
      },
    });
  };

  const commonUrlRules = [{ type: "url", message: lang("Please enter a valid URL") }];

  return (
    <Modal
      open={show}
      width={1100}
      okText={data ? lang(`Update`) : lang(`Add`)}
      cancelText={lang(`Cancel`)}
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
      centered
      className="tab_modal"
    >
      <Form id="create" form={form} onFinish={onCreate} layout="vertical" initialValues={{ section: "page" }}>
        <h4 className="modal_title_cls">{data ? lang(`Edit ${sectionName}`) : lang(`Add New ${sectionName}`)}</h4>
        <Row gutter={[16, 0]}>
          <SelectInput
            label={lang("Section")}
            name="section"
            rules={[{ required: true, message: lang("Section is required") }]}
            placeholder={lang("Select Section")}
            options={[
              { _id: "page", name: "page" },
              { _id: "common", name: "common" },
            ]}
          />
          <TextInputBox
            label={lang("Page Key")}
            name="page_key"
            rules={[
              { required: true, message: lang("Page key is required") },
              { pattern: /^[a-zA-Z0-9_-]+$/, message: lang("Use only letters, numbers, underscore and hyphen") },
            ]}
            inputProps={{ maxLength: 100 }}
            placeholder={lang("Example: home, login, subCategoryDetailsPage")}
          />
        </Row>

        <Collapse defaultActiveKey={["primary"]}>
          <Panel header="Primary" key="primary">
            <Row gutter={[16, 0]}>
              <TextInputBox label="Title" name={["primary", "title"]} placeholder="Primary title" colProps={{ xs: 24, md: 24 }} />
              <TextAreaInputBox label="Description" name={["primary", "description"]} placeholder="Primary description" colProps={{ xs: 24, md: 24 }} inputProps={{ rows: 3 }} />
              <TextAreaInputBox label="Keywords" name={["primary", "keywords"]} placeholder="Comma separated keywords" colProps={{ xs: 24, md: 24 }} inputProps={{ rows: 2 }} />
            </Row>
          </Panel>

          <Panel header="Open Graph" key="openGraph">
            <Row gutter={[16, 0]}>
              <TextInputBox label="Title" name={["openGraph", "title"]} placeholder="Open Graph title" />
              <TextInputBox label="Type" name={["openGraph", "type"]} placeholder="website" />
              <TextAreaInputBox label="Description" name={["openGraph", "description"]} placeholder="Open Graph description" colProps={{ xs: 24, md: 24 }} inputProps={{ rows: 3 }} />
              <TextInputBox label="Image URL" name={["openGraph", "image"]} placeholder="https://..." rules={commonUrlRules} />
              <TextInputBox label="Page URL" name={["openGraph", "url"]} placeholder="https://..." rules={commonUrlRules} />
              <TextInputBox label="Site Name" name={["openGraph", "site_name"]} placeholder="Black Diary" />
            </Row>
          </Panel>

          <Panel header="Twitter" key="twitter">
            <Row gutter={[16, 0]}>
              <TextInputBox label="Title" name={["twitter", "title"]} placeholder="Twitter title" />
              <TextInputBox label="Type" name={["twitter", "type"]} placeholder="website" />
              <TextAreaInputBox label="Description" name={["twitter", "description"]} placeholder="Twitter description" colProps={{ xs: 24, md: 24 }} inputProps={{ rows: 3 }} />
              <TextInputBox label="Image URL" name={["twitter", "image"]} placeholder="https://..." rules={commonUrlRules} />
              <TextInputBox label="Page URL" name={["twitter", "url"]} placeholder="https://..." rules={commonUrlRules} />
              <TextInputBox label="Site Name" name={["twitter", "site_name"]} placeholder="Black Diary" />
            </Row>
          </Panel>

          <Panel header="Common" key="common">
            <Row gutter={[16, 0]}>
              <TextInputBox label="Title" name={["common", "title"]} placeholder="Common title" />
              <TextInputBox label="Robots" name={["common", "robots"]} placeholder="index, follow" />
              <TextInputBox label="Language" name={["common", "language"]} placeholder="hi" />
              <TextInputBox label="Author" name={["common", "author"]} placeholder="Author name" />
              <TextAreaInputBox label="Description" name={["common", "description"]} placeholder="Common description" colProps={{ xs: 24, md: 24 }} inputProps={{ rows: 3 }} />
              <TextAreaInputBox label="Keywords" name={["common", "keywords"]} placeholder="Comma separated keywords" colProps={{ xs: 24, md: 24 }} inputProps={{ rows: 2 }} />
              <TextInputBox label="Image URL" name={["common", "image"]} placeholder="https://..." rules={commonUrlRules} />
              <TextInputBox label="URL" name={["common", "url"]} placeholder="https://..." rules={commonUrlRules} />
              <TextInputBox label="Type" name={["common", "type"]} placeholder="website" />
              <TextInputBox label="Site Name" name={["common", "site_name"]} placeholder="Black Diary" />
            </Row>
          </Panel>
        </Collapse>
      </Form>
    </Modal>
  );
};

export default AddForm;
