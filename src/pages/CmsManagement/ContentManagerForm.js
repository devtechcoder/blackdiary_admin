import { Button, Col, Form, Row, Skeleton } from "antd";
import { useEffect, useState } from "react";

import DescriptionEditor from "../../components/DescriptionEditor";
import apiPath from "../../constants/apiPath";
import useRequest from "../../hooks/useRequest";
import { Severty, ShowToast } from "../../helper/toast";
import lang from "../../helper/langHelper";

const slug = {
  PRIVACY_POLICY: "privacy-policy",
  TERMS_AND_CONDITIONS: "terms-and-conditions",
  DRIVER_AGREEMENT: "driver-agreement",
  SERVICE_PROVIDER_AGREEMENT: "service-provider-agreement",
};

export const ContentManagerForm = () => {
  const [form] = Form.useForm();

  const [editorValue, setEditorValue] = useState("");
  const { request } = useRequest();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState();
  const [termArDescription, setTermArDescription] = useState("");
  const [termDescription, setTermDescription] = useState("");
  const [policyArDescription, setPolicyArDescription] = useState("");
  const [policyDescription, setPolicyDescription] = useState("");
  const [drAgrArDescription, setDrAgrArDescription] = useState("");
  const [drAgrDescription, setDrAgrDescription] = useState("");
  const [rsAgrArDescription, setRsAgrArDescription] = useState("");
  const [rsAgrDescription, setRsAgrDescription] = useState("");

  const getContent = () => {
    request({
      url: apiPath.content,
      method: "GET",
      onSuccess: (data) => {
        console.log(data.data);
        let privacyPolicy;
        let termsAndConditions;

        let serviceProviderAgreement;

        data.data.forEach((item) => {
          if (item.slug === slug.PRIVACY_POLICY) {
            privacyPolicy = item;
          } else if (item.slug === slug.TERMS_AND_CONDITIONS) {
            termsAndConditions = item;
          } else if (item.slug === slug.SERVICE_PROVIDER_AGREEMENT) {
            serviceProviderAgreement = item;
          }
        });

        setContent({
          privacyPolicy,
          termsAndConditions,

          serviceProviderAgreement: serviceProviderAgreement,
        });

        setTermArDescription(termsAndConditions?.ar_description);
        setTermDescription(termsAndConditions?.description);

        setPolicyArDescription(privacyPolicy?.ar_description);
        setPolicyDescription(privacyPolicy?.description);

        setRsAgrArDescription(serviceProviderAgreement?.ar_description);
        setRsAgrDescription(serviceProviderAgreement?.description);

        setLoading(false);
        form.setFieldsValue({
          terms_and_conditions: termsAndConditions?.description,
          ar_terms_and_conditions: termsAndConditions?.ar_description,
          privacy_policy: privacyPolicy?.description,
          ar_privacy_policy: privacyPolicy?.ar_description,

          service_provider_agreement: serviceProviderAgreement?.description,
          ar_service_provider_agreement:
            serviceProviderAgreement?.ar_description,
        });
      },
      onError: () => setLoading(false),
    });
  };

  const onFinish = (values) => {
    setSubmitting(true);
    ShowToast("Content saved successfully", Severty.SUCCESS);
    let privacyPolicy = content?.privacyPolicy;
    let termsAndConditions = content?.termsAndConditions;
    let serviceProviderAgreement = content?.serviceProviderAgreement;

    const payload = [
      {
        name: termsAndConditions.name,
        ar_name: termsAndConditions.ar_name,
        id: termsAndConditions._id,
        description: values?.terms_and_conditions,
        ar_description: values?.ar_terms_and_conditions,
      },
      {
        name: privacyPolicy.name,
        ar_name: privacyPolicy.ar_name,
        id: privacyPolicy._id,
        description: values?.privacy_policy,
        ar_description: values?.ar_privacy_policy,
      },
      {
        name: serviceProviderAgreement.name,
        ar_name: serviceProviderAgreement.ar_name,
        id: serviceProviderAgreement._id,
        description: values?.service_provider_agreement,
        ar_description: values?.ar_service_provider_agreement,
      },
    ];

    console.log(payload);

    request({
      url: apiPath.content,
      method: "PUT",
      data: { content: payload },
      onSuccess: (data) => {
        setSubmitting(false);
        ShowToast(data.message, Severty.success);
      },
      onError: (err) => {
        ShowToast(err, Severty.error);
        setSubmitting(false);
      },
    });
  };

  const handleEditorChange = (data, type) => {
    switch (type) {
      case "term":
        return setTermDescription(data);
      case "term_ar":
        return setTermArDescription(data);
      case "policy":
        return setPolicyDescription(data);
      case "policy_ar":
        return setPolicyArDescription(data);
      case "service_provider":
        return setRsAgrDescription(data);
      case "ar_service_provider":
        return setRsAgrArDescription(data);
      default:
        return console.log("Unknown type");
    }
  };

  useEffect(() => {
    setLoading(true);
    getContent();
  }, []);

  return loading ? (
    [1, 2, , 3, 4, 5, 6].map((item) => <Skeleton active key={item} />)
  ) : (
    <Form form={form} onFinish={onFinish} className="cms-page">
      <Row gutter={24}>
        <Col md={12}>
          <h4>{lang("Page: Terms And Conditions (English)")}</h4>
          <Form.Item
            name="terms_and_conditions"
            rules={[
              {
                required: true,
                message: lang("Please Enter the Terms And Conditions!"),
              },
            ]}
          >
            <DescriptionEditor
              value={termDescription}
              placeholder={lang("Enter Terms And Conditions")}
              onChange={(data) => handleEditorChange(data, "term")}
            />
          </Form.Item>
        </Col>

        <Col md={12}>
          <h4>{lang("Page: Terms And Conditions (Arabic)")}</h4>
          <Form.Item
            name="ar_terms_and_conditions"
            rules={[
              {
                required: true,
                message: lang("Please Enter Terms And Conditions!"),
              },
            ]}
          >
            <DescriptionEditor
              value={termArDescription}
              placeholder={lang("Enter Terms And Conditions")}
              onChange={(data) => handleEditorChange(data, "term_ar")}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col md={12}>
          <h4>{lang("Page: Privacy Policy (English")})</h4>
          <Form.Item
            name="privacy_policy"
            rules={[
              {
                required: true,
                message: lang("Please Enter Privacy Policy!"),
              },
            ]}
          >
            <DescriptionEditor
              value={policyDescription}
              placeholder={lang("Enter Privacy Policy")}
              onChange={(data) => handleEditorChange(data, "policy")}
            />
          </Form.Item>
        </Col>

        <Col md={12}>
          <h4>{lang("Page: Privacy Policy (Arabic)")}</h4>
          <Form.Item
            name="ar_privacy_policy"
            rules={[
              {
                required: true,
                message: lang("Please Enter Privacy Policy!"),
              },
            ]}
          >
            <DescriptionEditor
              value={policyArDescription}
              placeholder={lang("Enter Privacy Policy")}
              onChange={(data) => handleEditorChange(data, "policy_ar")}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* <Row gutter={24}>
        <Col md={12}>
          <h4>{lang("Page: Driver Agreement (English)")}</h4>
          <Form.Item
            name="driver_agreement"
            rules={[
              {
                required: true,
                message: lang("Please Enter Driver Agreement!"),
              },
            ]}
          >
            <DescriptionEditor
              value={drAgrDescription}
              placeholder={lang("Enter Driver Agreement")}
              onChange={(data) => handleEditorChange(data, "driver")}
            />
          </Form.Item>
        </Col>

        <Col md={12}>
          <h4>{lang("Page: Driver Agreement (Arabic)")}</h4>
          <Form.Item
            name="ar_driver_agreement"
            rules={[
              {
                required: true,
                message: lang("Please Enter Driver Agreement!"),
              },
            ]}
          >
            <DescriptionEditor
              value={drAgrArDescription}
              placeholder={lang("Enter Driver Agreement")}
              onChange={(data) => handleEditorChange(data, "driver_ar")}
            />
          </Form.Item>
        </Col>
      </Row> */}

      <Row gutter={24}>
        <Col md={12}>
          <h4>{lang("Page: Service Provider Agreement (English)")}</h4>
          <Form.Item
            name="service_provider_agreement"
            rules={[
              {
                required: true,
                message: lang("Please Enter Service Provider Agreement!"),
              },
            ]}
          >
            <DescriptionEditor
              value={rsAgrDescription}
              placeholder={lang("Enter Service Provider Agreement")}
              onChange={(data) => handleEditorChange(data, "service_provider")}
            />
          </Form.Item>
        </Col>

        <Col md={12}>
          <h4>{lang("Page: Service Provider Agreement (Arabic)")}</h4>
          <Form.Item
            name="ar_service_provider_agreement"
            rules={[
              {
                required: true,
                message: lang("Please Enter Service Provider Agreement!"),
              },
            ]}
          >
            <DescriptionEditor
              value={rsAgrArDescription}
              placeholder={lang("Enter Service Provider Agreement")}
              onChange={(data) =>
                handleEditorChange(data, "ar_service_provider")
              }
            />
          </Form.Item>
        </Col>
      </Row>

      <Row>
        <Button
          loading={submitting}
          className="primary_btn btnStyle"
          htmlType="submit"
        >
          {lang("Save Changes")}
        </Button>
      </Row>
    </Form>
  );
};
