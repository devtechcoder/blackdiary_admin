import { Row, Col, Button, Form, Select } from "antd";
import React, { useState, useEffect } from "react";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import apiPath from "../../constants/apiPath";
import { useAppContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
import Loader from "../../components/Loader";
import { useNavigate, useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import CaptionInput from "../../components/captionInput";
import SingleImageUpload from "../../components/SingleImageUpload";
function AddFrom() {
  const sectionName = lang("Feed");
  const { setPageHeading } = useAppContext();
  const navigate = useNavigate();
  const api = {
    addEdit: apiPath.listDiary,
  };

  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const paramId = id;
  const [image, setImage] = useState();
  const [category, setCategory] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [keywordOptions, setKeywordOptions] = useState([]);
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [content, setContent] = useState("");
  const [searchParams] = useSearchParams();

  const type = searchParams.get("type");
  const FileType = ["image/png", "image/jpg", "image/jpeg", "image/avif", "image/webp", "image/gif"];
  const handleImage = (data) => {
    setImage(data || null);
  };
  const appendFormDataValue = (formData, key, value) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      const normalizedValue = value.filter(Boolean);
      formData.append(key, normalizedValue.length ? normalizedValue.join(",") : "");
      return;
    }

    formData.append(key, value);
  };
  const getCategory = () => {
    request({
      url: apiPath.common.categories,
      method: "GET",
      onSuccess: ({ data, status }) => {
        if (status) {
          setCategory(data);
        }
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  const getAuthor = () => {
    request({
      url: apiPath.common.getUsers,
      method: "GET",
      onSuccess: ({ data, status }) => {
        if (status) {
          setAuthors(data);
        }
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  const getOccasion = () => {
    request({
      url: apiPath.common.getOccasion,
      method: "GET",
      onSuccess: ({ data, status }) => {
        if (status) {
          setOccasions(data);
        }
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  const getSubCategory = (categoryId) => {
    request({
      url: `${apiPath.common.subCategories}/${categoryId}`,
      method: "GET",
      onSuccess: ({ data, status }) => {
        if (status) {
          setSubCategories(data);
        }
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  const getKeywords = (categoryId, subCategoryIds = []) => {
    if (!categoryId) {
      setKeywordLoading(false);
      setKeywordOptions([]);
      return;
    }

    const normalizedSubCategoryIds = Array.isArray(subCategoryIds) ? subCategoryIds.filter(Boolean) : [];

    setKeywordLoading(true);
    request({
      url: `${apiPath.keywordEmotion}?page=1&pageSize=100&categoryId=${categoryId}&subCategoryIds=${normalizedSubCategoryIds.join(",")}`,
      method: "GET",
      onSuccess: ({ data, status }) => {
        setKeywordLoading(false);
        if (status) {
          setKeywordOptions(Array.isArray(data?.docs) ? data.docs : []);
        }
      },
      onError: (err) => {
        setKeywordLoading(false);
        console.log(err);
      },
    });
  };

  const fetchData = (id) => {
    request({
      url: `${api.addEdit}/view/${id}?type=${type}`,
      method: "GET",
      onSuccess: ({ data, status }) => {
        setLoading(false);
        if (status) {
          const subCategoryIds = Array.isArray(data?.sub_category_id) ? data.sub_category_id.map((item) => item?._id || item).filter(Boolean) : [];
          const keywordIds = Array.isArray(data?.keywords) ? data.keywords.map((item) => item?._id || item).filter(Boolean) : [];
          const categoryValue = data?.category || "";

          form.setFieldsValue({
            ...data,
            category: categoryValue,
            sub_category_id: subCategoryIds,
            author: data?.author?._id ?? "",
            keywords: keywordIds,
          });
          setContent(data?.content);
          setImage(data?.image);
          if (categoryValue) {
            setSubCategories([]);
            setKeywordOptions([]);
            getSubCategory(categoryValue);
            getKeywords(categoryValue, subCategoryIds);
          }
        }
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const OnSubmit = (values) => {
    const { title } = values;
    const isShayari = type === "shayari";
    const selectedFile = image instanceof File ? image : image?.originFileObj instanceof File ? image.originFileObj : null;

    if (isShayari) {
      if (!content.trim() || content === "<p><br></p>") {
        ShowToast("Please write your shayari in the content box.", Severty.WARNING);
        return;
      }
    } else {
      const hasExistingImage = typeof image === "string" && image.trim();
      if (!selectedFile && !hasExistingImage) {
        ShowToast("Please upload an image for your post.", Severty.WARNING);
        return;
      }
    }

    const payload = isShayari ? { title, type, ...values, content } : new FormData();

    if (!isShayari) {
      appendFormDataValue(payload, "title", title);
      appendFormDataValue(payload, "type", type);
      appendFormDataValue(payload, "category", values.category);
      appendFormDataValue(payload, "sub_category_id", values.sub_category_id);
      appendFormDataValue(payload, "author", values.author);
      appendFormDataValue(payload, "occasion_ids", values.occasion_ids);
      appendFormDataValue(payload, "keywords", values.keywords || []);

      if (selectedFile) {
        payload.append("image", selectedFile);
      }
    } else {
      payload.keywords = values.keywords || [];
    }

    setLoading(true);
    request({
      url: paramId ? api.addEdit + "/" + paramId : api.addEdit,
      method: paramId ? "PUT" : "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
          setTimeout(() => navigate(-1), 300);
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

  useEffect(() => {
    setPageHeading(type === "shayari" ? `${lang("Shayari")} ${lang("Management")}` : `${lang("Feed")} ${lang("Management")}`);
  }, [setPageHeading, type]);

  useEffect(() => {
    getCategory();
    getAuthor();
    getOccasion();
    if (!paramId) {
      form.resetFields();
      setImage(null);
      setContent("");
      setSubCategories([]);
      setKeywordOptions([]);
      return;
    }
    setLoading(true);
    fetchData(paramId);
  }, [paramId, type]);
  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="row">
            <div className="col-md-6">
              <h5 className="pagetitle mt-3">{(paramId ? lang("Update") : lang("Add New")) + " " + (type === "shayari" ? lang("Shayari") : sectionName)} </h5>
            </div>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <Loader />
          ) : (
            <Form form={form} onFinish={OnSubmit} autoComplete="off" layout="vertical" name="email_template_form" loading={loading} disabled={loading}>
              <Row gutter={[24, 16]}>
                <Col span={12} sm={12}>
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
                      filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      placeholder={lang("Select Category")}
                      showSearch
                      onChange={(value) => {
                        setSubCategories([]);
                        setKeywordOptions([]);
                        form.setFieldsValue({ sub_category_id: [], keywords: [] });
                        getSubCategory(value);
                        getKeywords(value, []);
                      }}
                    >
                      {category.map((item) => (
                        <Select.Option key={item.value} label={item.name} value={item.value}>
                          {item.name}{" "}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12} sm={12}>
                  <Form.Item
                    label={lang("Sub Category Name")}
                    name="sub_category_id"
                    rules={[
                      {
                        required: true,
                        message: lang("Please select the sub category!"),
                      },
                    ]}
                  >
                    <Select
                      filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      placeholder={lang("Select Sub Category")}
                      showSearch
                      mode="multiple"
                      onChange={(values) => {
                        const nextSubCategoryIds = Array.isArray(values) ? values.filter(Boolean) : [];
                        form.setFieldsValue({ keywords: [] });
                        getKeywords(form.getFieldValue("category"), nextSubCategoryIds);
                      }}
                    >
                      {subCategories?.map((item) => (
                        <Select.Option key={item._id} label={item.name} value={item._id}>
                          {item.name}{" "}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                {type === "post" || type === "shayari" ? (
                  <Col span={12} sm={12}>
                    <Form.Item label={lang("Keywords")} name="keywords">
                      <Select
                        mode="multiple"
                        allowClear
                        showSearch
                        disabled={!form.getFieldValue("category")}
                        loading={keywordLoading}
                        placeholder={lang("Select Keywords")}
                        optionFilterProp="label"
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                      >
                        {keywordOptions.map((item) => (
                          <Select.Option key={item._id} label={`${item.name}${item.slug ? ` (${item.slug})` : ""}`} value={item._id}>
                            {item.name}
                            {item.slug ? <span className="ms-1 text-muted">({item.slug})</span> : null}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                ) : null}
                <Col span={12} sm={12}>
                  <Form.Item
                    label={lang("Occasion Name")}
                    name="occasion_ids"
                    rules={[
                      {
                        required: false,
                        message: lang("Please select the occasion!"),
                      },
                    ]}
                  >
                    <Select filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0} placeholder={lang("Select Occasions")} showSearch mode="multiple">
                      {occasions?.map((item) => (
                        <Select.Option key={item._id} label={item.name} value={item._id}>
                          {item.name}{" "}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12} sm={12}>
                  <Form.Item
                    label={lang("Author Name")}
                    name="author"
                    rules={[
                      {
                        required: true,
                        message: lang("Please select the author!"),
                      },
                    ]}
                  >
                    <Select filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0} placeholder={lang("Select  Author")} showSearch>
                      {authors.map((item) => (
                        <Select.Option key={item._id} label={item.name} value={item._id}>
                          {item.name}{" "}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                {type === "shayari" ? (
                  <Col span={24} sm={24}>
                    <Form.Item className="feed-content-item" label={lang("Content")}>
                      <CaptionInput placeholder={lang("Write your shayari here...")} value={content} onChange={setContent} />
                    </Form.Item>
                  </Col>
                ) : (
                  <Col span={24} sm={24}>
                    <Form.Item className="feed-image-item" label="Image">
                      <SingleImageUpload size={10} value={image} fileType={FileType} btnName={"Image"} imageType="Image" onChange={(data) => handleImage(data)} isDimension={true} accept={FileType.join(",")} />
                    </Form.Item>
                  </Col>
                )}
              </Row>

              <Row gutter={[24, 16]} className="justify-content-end feed-form-actions">
                <Col span={6} md={5} xs={12}>
                  <Button className="w-100 feed-cancel-btn" type="default" htmlType="button" onClick={() => navigate(-1)}>
                    {lang("Cancel")}
                  </Button>
                </Col>
                <Col span={6} md={5} xs={12}>
                  <Button className="btn btn-primary w-100 btn-bg feed-submit-btn" type="primary" htmlType="submit" loading={loading} disabled={loading}>
                    {type === "shayari" ? lang("Save") : lang("Submit")}
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </div>
      </div>
    </>
  );
}

export default AddFrom;
