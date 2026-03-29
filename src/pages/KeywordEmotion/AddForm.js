import { Col, Form, Input, Modal, Radio, Row, Select } from "antd";
import React, { useEffect, useMemo, useState } from "react";

import { TextInputBox } from "../../components/InputField";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";

const AddForm = ({ api, show, hide, data, refresh, categoryOptions = [], subCategoryOptions = [] }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const addEditApi = api.addEdit;

  const filteredSubCategoryOptions = useMemo(() => {
    if (!selectedCategories.length) {
      return [];
    }

    return subCategoryOptions.filter((item) => Array.isArray(item.category) && item.category.some((category) => selectedCategories.includes(category)));
  }, [selectedCategories, subCategoryOptions]);

  useEffect(() => {
    if (!data) {
      form.resetFields();
      setSelectedCategories([]);
      return;
    }

    const subCategoryIds = Array.isArray(data?.sub_category_ids) ? data.sub_category_ids.map((item) => item?._id || item).filter(Boolean) : [];
    const categories = Array.isArray(data?.categories) ? data.categories : [];

    form.setFieldsValue({
      ...data,
      categories,
      sub_category_ids: subCategoryIds,
      is_active: data?.is_active ?? true,
      slug: data?.slug || "",
    });
    setSelectedCategories(categories);
  }, [data, form]);

  const handleCategoryChange = (values) => {
    const nextCategories = Array.isArray(values) ? values : [];
    setSelectedCategories(nextCategories);

    const allowedSubCategoryIds = subCategoryOptions
      .filter((item) => Array.isArray(item.category) && item.category.some((category) => nextCategories.includes(category)))
      .map((item) => item._id);

    const currentSubCategoryIds = form.getFieldValue("sub_category_ids") || [];
    const filteredValues = currentSubCategoryIds.filter((id) => allowedSubCategoryIds.includes(id));
    form.setFieldsValue({ sub_category_ids: filteredValues });
  };

  const onCreate = (values) => {
    setLoading(true);

    const slugValue = String(values.slug || "").trim();

    const payload = {
      name: values.name || "",
      categories: values.categories || [],
      sub_category_ids: values.sub_category_ids || [],
      is_active: values.is_active ?? true,
      ...(slugValue ? { slug: slugValue } : {}),
    };

    request({
      url: `${data ? `${addEditApi}/${data._id}` : addEditApi}`,
      method: data ? "PUT" : "POST",
      data: payload,
      onSuccess: (response) => {
        setLoading(false);
        if (response.status) {
          ShowToast(response.message, Severty.SUCCESS);
          hide();
          refresh();
        } else {
          ShowToast(response.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error?.response?.data?.message || error?.message || "Something went wrong", Severty.ERROR);
      },
    });
  };

  return (
    <Modal
      open={show}
      width={900}
      okText={data ? lang("Update") : lang("Add")}
      cancelText={lang("Cancel")}
      onCancel={hide}
      okButtonProps={{
        form: "keyword-emotion-form",
        htmlType: "submit",
        loading,
      }}
      centered
      className="tab_modal"
      >
      <Form
        id="keyword-emotion-form"
        form={form}
        onFinish={onCreate}
        layout="vertical"
        initialValues={{
          is_active: true,
          slug: "",
          categories: [],
          sub_category_ids: [],
        }}
      >
        <h4 className="modal_title_cls">{data ? lang("Edit Keyword / Emotion") : lang("Add New Keyword / Emotion")}</h4>
        <Row gutter={[16, 0]}>
          <Col span={24} sm={12}>
            <Form.Item
              label={lang("Name")}
              name="name"
              rules={[
                { required: true, message: lang("Name is required") },
                { min: 2, message: lang("Name should contain at least 2 characters!") },
                { max: 200, message: lang("Name should not contain more then 200 characters!") },
              ]}
              normalize={(value) => value?.trimStart?.() ?? value}
            >
              <Input autoComplete="off" placeholder={lang("Enter Name")} />
            </Form.Item>
          </Col>

          <TextInputBox
            label={lang("Slug")}
            name="slug"
            rules={[
              { required: !data, message: lang("Slug is required") },
            ]}
            placeholder={lang("Example: 2-line-shayari")}
            inputProps={{ maxLength: 255 }}
            colProps={{ xs: 24, md: 12 }}
          />

          <Col span={24} sm={12}>
            <Form.Item
              label={lang("Categories")}
              name="categories"
              rules={[{ required: true, message: lang("Please select categories!") }]}
            >
              <Select
                mode="multiple"
                allowClear
                showSearch
                placeholder={lang("Select Categories")}
                optionFilterProp="label"
                onChange={handleCategoryChange}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              >
                {categoryOptions.map((item) => (
                  <Select.Option key={item.value} value={item.value} label={item.name || item.value}>
                    {item.name || item.value}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item label={lang("Sub Categories")} name="sub_category_ids">
              <Select
                mode="multiple"
                allowClear
                showSearch
                disabled={!selectedCategories.length}
                placeholder={lang("Select Sub Categories")}
                optionFilterProp="label"
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              >
                {filteredSubCategoryOptions.map((item) => (
                  <Select.Option key={item._id} value={item._id} label={item.name}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
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
