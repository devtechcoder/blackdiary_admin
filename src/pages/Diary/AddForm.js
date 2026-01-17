import { Row, Col, Card, Button, Input, Form, Skeleton, Image, Select } from "antd";
import React, { useState, useEffect } from "react";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import apiPath from "../../constants/apiPath";
import DescriptionEditor from "../../components/DescriptionEditor";
import { useAppContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
import Loader from "../../components/Loader";
import { useNavigate, useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CaptionInput from "../../components/captionInput";
import ProfileImageUpload from "../../modal/ProfileImageUpload";
function AddFrom() {
  const sectionName = lang("Feed");
  const routeName = "Diary";
  const heading = lang("Add Feed");
  const { setPageHeading, country } = useAppContext();
  const navigate = useNavigate();
  const api = {
    addEdit: apiPath.listDiary,
  };

  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [editorHiValue, setEditorHiValue] = useState("");
  const [editorValue, setEditorValue] = useState("");
  const { id } = useParams();
  const paramId = id;
  const [file, setFile] = useState([]);
  const [image, setImage] = useState();
  const [category, setCategory] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [content, setContent] = useState("");
  const [searchParams] = useSearchParams();

  const type = searchParams.get("type");
  const FileType = ["image/png", "image/jpg", "image/jpeg", "image/avif", "image/webp", "image/gif"];
  const handleImage = (data) => {
    data ? setImage(data) : setImage();
  };
  const getCategory = () => {
    request({
      url: apiPath.common.categories,
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

  const getAuthor = () => {
    request({
      url: apiPath.common.getUsers,
      method: "GET",
      onSuccess: ({ data, status }) => {
        if (status) {
          setAuthors(data);
        }
        console.log(data, "data");
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
        console.log(data, "data");
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

  const fetchData = (id) => {
    request({
      url: `${api.addEdit}/view/${id}?type=${type}`,
      method: "GET",
      onSuccess: ({ data, status }) => {
        setLoading(false);
        if (status) {
          form.setFieldsValue({ ...data, sub_category_id: data?.sub_category_id?.map(({ _id }) => _id), author: data?.author?._id ?? "" });
          setContent(data?.content);
          setImage(data?.image);
          if (data?.category) getSubCategory(data?.category);
        }
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const OnSubmit = (values) => {
    const { title } = values;
    const payload = { title, type, ...values };
    if (type === "shayari") {
      if (!content.trim() || content === "<p><br></p>") {
        ShowToast("Please write your shayari in the content box.", Severty.WARNING);
        return;
      }
      payload.content = content;
    } else {
      if (!image) {
        ShowToast("Please upload an image for your post.", Severty.WARNING);
        return;
      }
      payload.image = image;
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
    setPageHeading(heading);
  }, []);

  useEffect(() => {
    getCategory();
    getAuthor();
    getOccasion();
    if (!paramId) return;
    setLoading(true);
    fetchData(paramId);
  }, [paramId]);
  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="row">
            <div className="col-md-6">
              <h5 className="pagetitle mt-3">{(paramId ? lang("Update") : lang("Add New")) + " " + sectionName} </h5>
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
                        getSubCategory(value);
                        form.setFieldValue({ sub_category_id: [] });
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
                    <Select filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0} placeholder={lang("Select Sub Category")} showSearch mode="multiple">
                      {subCategories?.map((item) => (
                        <Select.Option key={item._id} label={item.name} value={item._id}>
                          {item.name}{" "}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
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
                    <Form.Item label="Content">
                      <CaptionInput value={content} onChange={setContent} />
                    </Form.Item>
                  </Col>
                ) : (
                  <Col span={24} sm={24}>
                    <Form.Item name="image" className="text-white" label="Image" rules={[{ required: true, message: "Please upload an image for your post." }]}>
                      <ProfileImageUpload size={10} value={image} fileType={FileType} btnName={"Choose Image"} imageType="Image" onChange={(data) => handleImage(data)} isDimension={true} />
                    </Form.Item>
                  </Col>
                )}
              </Row>

              <Row gutter={[24, 16]} className="justify-content-center">
                <Col span={6} md={6}>
                  <Button className="btn  w-100 btn-border" htmlType="reset" onClick={() => navigate(-1)}>
                    {lang("Back")}
                  </Button>
                </Col>
                <Col span={6} md={6}>
                  <Button className="btn btn-primary w-100 btn-bg" type="primary" htmlType="submit" loading={loading} disabled={loading}>
                    {"Submit"}
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
