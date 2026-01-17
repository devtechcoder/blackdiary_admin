import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import apiPath from "../../constants/apiPath";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import { AppStateContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
import { Col, Form, Image, Input, Modal, Radio, Row, Select, Checkbox, Button } from "antd";
import { NumberInputBox, SelectInput, TextInputBox } from "../../components/InputField";
import SectionWrapper from "../../components/SectionWrapper";

function Index() {
  const heading = lang("Setting") + " " + lang("Management");
  const { setPageHeading, country } = useContext(AppStateContext);

  const sectionName = "Settings";
  const params = useParams();

  const api = {
    list: apiPath.listSettings,
    addEdit: apiPath.addEditSettings,
  };
  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);

  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const getSettings = () => {
    request({
      url: api.list,
      method: "GET",
      onSuccess: ({ data, status }) => {
        if (status) {
          setData(data?.docs || []);
        }
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  useEffect(() => {
    getSettings();
  }, []);

  useEffect(() => {
    if (!data) return;
    form.setFieldsValue({
      ...data,
    });
    if (Array.isArray(data)) {
      const formData = {};
      data.forEach((item) => (formData[item.slug] = item.value));
      form.setFieldsValue(formData);
    }
  }, [data]);

  const onCreate = (values) => {
    const payload = Object.keys(values).map((key) => ({
      slug: key || "",
      group: params?.slug || "",
      value: values[key] || "",
    }));

    setLoading(true);
    request({
      url: `${data?._id ? api.addEdit + "/" + data._id : api.addEdit}`,
      method: data?._id ? "PUT" : "POST",
      data: { data: payload },
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
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
    <>
      <SectionWrapper>
        <Form
          id="create"
          form={form}
          onFinish={onCreate}
          layout="vertical"
          initialValues={{
            is_active: true,
          }}
        >
          <h4 className="modal_title_cls">{lang(`Manage ${params?.slug} ${sectionName}`)}</h4>
          <Row gutter={[16, 0]}>
            {params?.slug === "social" ? (
              <>
                <TextInputBox label={lang(`Facebook Link`)} name="facbook_link" normalize={(value) => value.trimStart()} autoComplete="off" placeholder={lang(`Enter Facebook Link`)} />
                <TextInputBox label={lang(`Instagram Link`)} name="instagram_link" normalize={(value) => value.trimStart()} autoComplete="off" placeholder={lang(`Enter Instagram Link`)} />
                <TextInputBox label={lang(`Thread Link`)} name="thread_link" normalize={(value) => value.trimStart()} autoComplete="off" placeholder={lang(`Enter Thread Link`)} />
                <TextInputBox label={lang(`Youtube Link`)} name="youtube_link" normalize={(value) => value.trimStart()} autoComplete="off" placeholder={lang(`Enter Youtube Link`)} />
                <TextInputBox label={lang(`Twitter Link`)} name="twitter_link" normalize={(value) => value.trimStart()} autoComplete="off" placeholder={lang(`Enter Twitter Link`)} />
                <TextInputBox label={lang(`Linkedin Link`)} name="linkedin_link" normalize={(value) => value.trimStart()} autoComplete="off" placeholder={lang(`Enter Linkedin Link`)} />
                <TextInputBox label={lang(`Pinterest Link`)} name="pinterest_link" normalize={(value) => value.trimStart()} autoComplete="off" placeholder={lang(`Enter Pinterest Link`)} />
              </>
            ) : (
              <>
                <TextInputBox
                  label={lang(`Site Name`)}
                  name="site_name"
                  rules={[
                    {
                      required: true,
                      message: lang("Site Name is required"),
                    },
                  ]}
                  normalize={(value) => value.trimStart()}
                  autoComplete="off"
                  placeholder={lang(`Enter Site Name`)}
                />
                <TextInputBox
                  label={lang(`Copyright`)}
                  name="copyright_text"
                  rules={[
                    {
                      required: true,
                      message: lang("Copyright is required"),
                    },
                  ]}
                  normalize={(value) => value.trimStart()}
                  autoComplete="off"
                  placeholder={lang(`Enter Copyright`)}
                />
                <TextInputBox
                  label={lang(`Contact Email`)}
                  name="contact_email"
                  rules={[
                    {
                      type: "email",
                      message: lang("Please enter valid email"),
                    },
                  ]}
                  normalize={(value) => value.trimStart()}
                  autoComplete="off"
                  placeholder={lang(`Enter Contact Email`)}
                />
              </>
            )}
          </Row>
          <Row justify="end">
            <Col>
              <Button type="primary" htmlType="submit" loading={loading}>
                {lang("Save")}
              </Button>
            </Col>
          </Row>
        </Form>
      </SectionWrapper>
    </>
  );
}

export default Index;
