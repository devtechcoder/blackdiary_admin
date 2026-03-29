import { Col, DatePicker, Form, Image, Input, Modal, Radio, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import lang from "../../helper/langHelper";
import PhoneInput from "react-phone-input-2";
import moment from "moment";
import SingleImageUpload from "../../components/SingleImageUpload";
import notfound from "../../assets/images/not_found.png";
import { isValidUserName, normalizeUserName } from "../../helper/userNameHelper";
import apiPath from "../../constants/apiPath";

const FileType = ["image/png", "image/jpg", "image/jpeg", "image/avif", "image/webp", "image/gif"];

const AddForm = ({ api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState({
    mobile_number: "",
    country_code: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(notfound);
  const [isImageRemove, setIsImageRemove] = useState(false);
  useEffect(() => {
    if (!data) {
      form.resetFields();
      setMobileNumber({
        mobile_number: "",
        country_code: "",
      });
      setImage(null);
      setIsImageRemove(false);
      return;
    }
    form.setFieldsValue({
      ...data,
      dob: data.dob ? moment(data.dob, "DD-MM-YYYY") : "",
      mobile: data?.country_code && data?.mobile_number ? data?.country_code + data?.mobile_number : "",
    });

    setMobileNumber({
      country_code: data?.country_code,
      mobile_number: data?.mobile_number,
    });

    setImage(data?.image || data?.profile_picture || null);
    setIsImageRemove(false);
  }, [data, form]);

  useEffect(() => {
    if (!image) {
      setImagePreview(notfound);
      return;
    }

    const selectedFile = image instanceof File ? image : image?.originFileObj;
    if (selectedFile instanceof File) {
      const filePreview = URL.createObjectURL(selectedFile);
      setImagePreview(filePreview);
      return () => URL.revokeObjectURL(filePreview);
    }

    if (typeof image === "string") {
      setImagePreview(image);
      return;
    }

    if (image?.url) {
      setImagePreview(image.url);
      return;
    }

    if (image?.thumbUrl) {
      setImagePreview(image.thumbUrl);
      return;
    }

    setImagePreview(notfound);
  }, [image]);

  const onCreate = (values) => {
    setLoading(true);
    const payload = new FormData();
    payload.append("name", values.name || "");
    payload.append("user_name", values.user_name || "");
    payload.append("email", values.email || "");
    payload.append("dob", values.dob ? moment(values.dob).format("DD-MM-YYYY") : "");
    payload.append("gender", values.gender || "");
    payload.append("mobile_number", mobileNumber.mobile_number || "");
    payload.append("country_code", mobileNumber.country_code || "");

    const selectedFile = image instanceof File ? image : image?.originFileObj;
    if (selectedFile instanceof File) {
      payload.append("profile_picture", selectedFile);
    }
    if (data) {
      payload.append("isImageRemove", isImageRemove ? true : false);
    }

    request({
      url: `${data ? api.addEdit + "/" + data._id : api.addEdit}`,
      method: data ? "PUT" : "POST",
      data: payload,
      header: {
        "Content-Type": "multipart/form-data",
      },
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

  const validateUserName = async (_, value) => {
    const normalizedUserName = normalizeUserName(value);

    if (!normalizedUserName) {
      return Promise.reject(new Error(lang("User name is required")));
    }

    if (!isValidUserName(normalizedUserName)) {
      return Promise.reject(new Error(lang("User name must be 3-30 characters and can contain only lowercase letters, numbers, dot and underscore.")));
    }

    const response = await request({
      url: `${apiPath.checkCustomerUserName}?user_name=${encodeURIComponent(normalizedUserName)}${data?._id ? `&id=${data._id}` : ""}`,
      method: "GET",
      onSuccess: () => {},
      onError: () => {},
    });

    if (!response) {
      return Promise.reject(new Error(lang("Unable to validate user name right now. Please try again.")));
    }

    if (!response?.status) {
      return Promise.reject(new Error(response?.message || lang("User name already taken")));
    }

    return Promise.resolve();
  };

  const handleImage = (file) => {
    if (!file) {
      setIsImageRemove(Boolean(data));
      setImage(null);
      return;
    }
    setIsImageRemove(false);
    setImage(file || null);
  };

  const handleChange = (value, data) => {
    var country_code = data.dialCode;
    setMobileNumber({
      country_code: country_code,
      mobile_number: value.slice(data.dialCode.length),
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
        <h4 className="modal_title_cls">{data ? lang(`Edit User`) : lang(`Add New User`)}</h4>
        <Row gutter={[16, 0]}>
          <Col span={24} sm={24}>
            <Form.Item
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
            >
              <Input autoComplete="off" placeholder={lang(`Enter  Name`)} />
            </Form.Item>
          </Col>
          <Col span={24} sm={24}>
            <Form.Item
              className="customer-user-name-field"
              label={lang(`User Name`)}
              name="user_name"
              normalize={(value) => normalizeUserName(value)}
              validateTrigger="onBlur"
              rules={[
                {
                  required: true,
                  message: lang("User name is required"),
                },
                {
                  min: 3,
                  message: lang("User name should contain at least 3 characters!"),
                },
                {
                  max: 30,
                  message: lang("User name should not contain more then 30 characters!"),
                },
                {
                  validator: validateUserName,
                },
              ]}
              extra={lang("Only lowercase letters, numbers, dot and underscore are allowed.")}
            >
              <Input
                className="customer-user-name-input"
                autoComplete="off"
                prefix={<span className="customer-user-name-prefix">@</span>}
                placeholder={lang(`Enter User Name`)}
              />
            </Form.Item>
          </Col>
          <Col span={12} lg={12} sm={12}>
            <Form.Item
              label={<span>{lang(`Email ID`)}</span>}
              name="email"
              rules={[
                {
                  type: "email",
                  message: lang("The email is not a valid email!"),
                },
                {
                  required: true,
                  message: lang("Please enter the email!"),
                },
                {
                  max: 200,
                  message: lang("Email should not contain more then 200 characters!"),
                },
                {
                  min: 5,
                  message: lang("Email should contain at least 5 characters!"),
                },
                {
                  pattern: new RegExp(/^([a-zA-Z0-9._%-]*[a-zA-Z]+[a-zA-Z0-9._%-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/),
                  message: lang("Enter valid email!"),
                },
              ]}
            >
              <Input autoComplete="off" placeholder={lang("Enter Email Address")} />
            </Form.Item>
          </Col>

          <Col span={12} lg={12} sm={12} className="flagMobileNumber">
            <Form.Item
              label={<span>{lang(`Mobile Number`)}</span>}
              name="mobile"
              rules={[
                {
                  required: true,
                  validator: (rule, value) => {
                    if (!value) {
                      return Promise.reject(lang("Please enter phone number"));
                    }
                    if (!/^\d{8,12}$/.test(mobileNumber?.mobile_number)) {
                      return Promise.reject(lang("Phone number must be between 8 and 12 digits"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <PhoneInput
                inputProps={{
                  name: "mobile",
                  required: true,
                  autoFocus: false,
                  autoFormat: false,
                  autoComplete: "off",
                }}
                isValid={(value, country) => {
                  if (value.match(/1234/)) {
                    return "Invalid value: " + value + ", " + country.name;
                  } else if (value.match(/1234/)) {
                    return "Invalid value: " + value + ", " + country.name;
                  } else {
                    return true;
                  }
                }}
                country={"jo"}
                preferredCountries={["jo"]}
                onChange={handleChange}
              />
            </Form.Item>
          </Col>

          <Col span={12} sm={12}>
            <Form.Item
              label={<span>{lang(`Date of Birth`)}</span>}
              name="dob"
              rules={[
                {
                  required: true,
                  message: lang("Please select the date of birth"),
                },
              ]}
            >
              <DatePicker format={"DD-MM-YYYY"} placeholder={lang("Select Date Of Birth")} disabledDate={(current) => current && current > moment().endOf("day")} />
            </Form.Item>
          </Col>

          <Col span={12} sm={12}>
            <Form.Item
              label={<span>{lang(`Gender`)}</span>}
              name="gender"
              rules={[
                {
                  required: true,
                  message: lang("Please select the gender!"),
                },
              ]}
            >
              <Select placeholder={lang("Select Gender")} getPopupContainer={(triggerNode) => triggerNode.parentNode}>
                <Select.Option value="Male">{lang("Male")} </Select.Option>
                <Select.Option value="Female">{lang("Female")} </Select.Option>
                <Select.Option value="Other">{lang("Other")} </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item className="" label={lang("Upload Image (WEB)")} name="image">
              <SingleImageUpload value={image} fileType={FileType} btnName={"Image"} imageType="advertisement" onChange={(data) => handleImage(data)} isDimension={true} />
              <p className="img-size-details">
                **
                {lang("Images  for best view in gallery image. You can select only (.gif, .png, .jpeg, .jpg) format files upto 1 MB file size")}
                ..!!!
              </p>
              {
                <div className="mt-2">
                  <Image width={120} src={imagePreview}></Image>
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
