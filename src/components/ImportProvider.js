import {
  Row,
  Col,
  Upload,
  Modal,
  Form,
  Button,
  message,
  Divider,
  Select,
  Spin,
} from "antd";
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { InboxOutlined } from "@ant-design/icons";
import { DownloadExcel, SampleFileDownload } from "./ExcelFile";
import useRequest from "../hooks/useRequest";
import { ShowToast, Severty } from "../helper/toast";
import apiPath from "../constants/apiPath";
import { useAppContext } from "../context/AppContext";
import lang from "../helper/langHelper";
const { Dragger } = Upload;

const ImportProvider = ({
  path,
  sectionName,
  show,
  hide,
  existingData,
  refresh,
}) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [importFile, setImportFile] = useState([]);
  const [cities, setCities] = useState([]);
  const { country } = useAppContext();
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState([]);
  const [profile, setProfile] = useState([]);
  const fileType = [
    ".csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  const api = {
    import: apiPath.providerList,
    category: apiPath.allCategory,
    profile: apiPath.providerList,
  };

  const getCategory = () => {
    request({
      url: api.category,
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

  const getProfile = (id) => {
    console.log("evalue", id);

    request({
      url: `${api.profile}/profile/${id}`,
      method: "GET",
      onSuccess: ({ data, status }) => {
        if (status) {
          setProfile(data);
        }
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  const handleImport = (info) => {
    const { file } = info;
    if (file) {
      if (!fileType.includes(file.type)) {
        message.error("File format is not correct");
        return false;
      }
      setParsing(true);
      const fileData = {
        lastModified: file.lastModified,
        lastModifiedDate: file.lastModifiedDate,
        name: file.name,
        uid: file.uid,
        status: "done",
        originFileObj: file.originFileObj,
        size: file.size,
        type: file.type,
        percent: file.percent,
      };

      setFile(fileData);
      parseExcel(file.originFileObj);
    }
  };

  const parseExcel = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const parsedData = XLSX.utils.sheet_to_json(worksheet);

      console.log(parsedData, "parsedData", parsedData?.[2]?.[2]);

      setImportFile(parsedData);
      setParsing(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const onImport = (value) => {
    const { profile_id, category_id } = value;
    setLoading(true);
    const payload = { category_id, profile_id };
    payload.sheet = importFile;
    request({
      url: `${api.import}/import`,
      method: "POST",
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
        console.log(error);
        ShowToast(error?.response?.data?.errors?.[0]?.message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  const customRequest = async (options) => {
    const { file, onSuccess, onError } = options;

    // Simulating an asynchronous file upload process
    try {
      setParsing(true);
      // You can perform your custom file upload logic here
      // For demonstration, we'll simply log the file details
      console.log("Uploading file:", file);
      parseExcel(file);

      // Simulating upload success after a delay
    } catch (error) {
      console.error("Upload failed:", error);
      onError(error);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  return (
    <Modal
      open={show}
      title={lang("Import Excel")}
      okText={lang("Import")}
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
        disabled: parsing,
      }}
      className="tab_modal"
    >
      <React.Fragment>
        <Form id="create" form={form} onFinish={onImport} layout="vertical">
          <Row>
            <Col span={24} md={24}>
              <Form.Item
                label={lang("Category Name")}
                name="category_id"
                rules={[
                  {
                    required: true,
                    message: lang("Please select the category!"),
                  },
                ]}
              >
                <Select
                  filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  placeholder={lang("Select Category")}
                  showSearch
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                  onChange={(e, key) => {
                    getProfile(e);
                    form.setFieldsValue({ profile_id: null });
                  }}
                >
                  {category.map((item) => (
                    <Select.Option
                      key={item._id}
                      label={item.name}
                      value={item._id}
                    >
                      {item.name}{" "}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} md={24}>
              <Form.Item
                label={lang("Profile")}
                name="profile_id"
                rules={[
                  {
                    required: true,
                    message: lang("Please select the profile!"),
                  },
                ]}
              >
                <Select
                  filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  placeholder={lang("Select Profile")}
                  showSearch
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  {profile?.map((item) => (
                    <Select.Option
                      key={item._id}
                      label={item.name}
                      value={item._id}
                    >
                      {item.name}{" "}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <div className="text-center">
                {form.getFieldValue("category_id") ? (
                  <Button
                    className="ant-btn ant-btn-default edit-cls btnStyle primary_btn"
                    title={lang("Download Sample File")}
                    onClick={() => {
                      const selectedProfile = profile?.find(
                        (p) => p._id === form.getFieldValue("profile_id"),
                      );
                      console.log("selectedProfile", selectedProfile);
                      SampleFileDownload(selectedProfile?.xlurl);
                    }}
                  >
                    <InboxOutlined /> &nbsp;&nbsp;Download Sample File
                  </Button>
                ) : (
                  <p>
                    {lang(
                      "Please select category and profile to download the sample file.",
                    )}
                  </p>
                )}
              </div>
              <Divider
                orientation="center"
                orientationMarginTop={0}
                className="devider-color"
              >
                {lang("OR")}
              </Divider>
              <Form.Item
                name="import_file"
                rules={[
                  {
                    validator: (_, value) => {
                      if (importFile !== undefined && importFile?.length > 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(lang("Excel file is required")),
                      );
                    },
                  },
                ]}
              >
                <Dragger
                  fileList={file ? [file] : []}
                  onRemove={() => setFile(null)}
                  maxCount={1}
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleImport}
                  customRequest={customRequest}
                >
                  <p className="ant-upload-drag-icon">
                    {" "}
                    {!parsing ? <InboxOutlined /> : <Spin />}{" "}
                  </p>
                  <p className="ant-upload-text">
                    {lang("Click or Drag File to This Area to Upload")}
                  </p>
                  <p className="ant-upload-hint">
                    {lang("Please Select an Excel File.")}
                  </p>
                </Dragger>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    </Modal>
  );
};

export default ImportProvider;
