import { Col, DatePicker, Form, Input, Modal, Radio, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import lang from "../../helper/langHelper";
import PhoneInput from "react-phone-input-2";
import moment from "moment";

const AddForm = ({ api, show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState({
    mobile_number: "",
    country_code: "",
  });
  useEffect(() => {
    if (!data) return;
    form.setFieldsValue({
      ...data,
      dob: data.dob ? moment(data.dob, "DD-MM-YYYY") : "",
      mobile:
        data?.country_code && data?.mobile_number ? data?.country_code + data?.mobile_number : "",
    });

    setMobileNumber({
      country_code: data?.country_code,
      mobile_number: data?.mobile_number,
    });
  }, [data]);

  const onCreate = (values) => {
    setLoading(true);
    const payload = {
      ...values,
    };
    payload.dob = values.dob ? moment(values.dob).format("DD-MM-YYYY") : null;
    payload.mobile_number = mobileNumber.mobile_number;
    payload.country_code = mobileNumber.country_code;

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
          <Col span={24} sm={12}>
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
                  pattern: new RegExp(
                    /^([a-zA-Z0-9._%-]*[a-zA-Z]+[a-zA-Z0-9._%-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/
                  ),
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
              <DatePicker
                format={"DD-MM-YYYY"}
                placeholder={lang("Select Date Of Birth")}
                disabledDate={(current) => current && current > moment().endOf("day")}
              />
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
              <Select
                placeholder={lang("Select Gender")}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              >
                <Select.Option value="Male">{lang("Male")} </Select.Option>
                <Select.Option value="Female">{lang("Female")} </Select.Option>
                <Select.Option value="Other">{lang("Other")} </Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddForm;
