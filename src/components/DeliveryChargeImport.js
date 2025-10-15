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
  Spin
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

const DeliveryChargeImport = ({
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
  const fileType = [
    ".csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  const handleImport = (info) => {
    const { file } = info;
    if (file) {
      if (!fileType.includes(file.type)) {
        message.error("File format is not correct");
        return false;
      }
      setParsing(true)
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

      console.log(parsedData, "parsedData", parsedData[2][2]);

      // const filteredData = parsedData.filter((row) => {
      //     const email = row.email;
      //     const country_code = row.country_code;
      //     const mobile_number = row.mobile_number;
      //     const name = row.English;

      //     // const shouldExclude = () => {
      //     //     let exclude = false;
      //     //     if (name && ['English'].includes(sectionName)) {
      //     //         const isDuplicateName = existingData.some(existingRow => existingRow.name.toLowerCase() === name.toLowerCase());
      //     //         exclude = exclude || isDuplicateName;
      //     //     }
      //     //     return exclude;
      //     // };

      //     // return !shouldExclude();
      //     return true;
      // });

      setImportFile(parsedData);
      setParsing(false)


      // const excludedRows = parsedData.filter((row) => !filteredData.includes(row));
      // if (excludedRows && excludedRows.length > 0) {
      //     const name = "Duplicate" + "-" + sectionName;
      //     // DownloadExcel(excludedRows, name)
      // }
    };

    reader.readAsArrayBuffer(file);
  };

  const onImport = (value) => {
    const { city_id } = value;
    setLoading(true);
    const payload = { city_id };
    payload.sheet = importFile;
    request({
      url: `${apiPath.deliveryCharge}/import`,
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
        ShowToast(error.response.data.errors[0].message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  const getCities = (id) => {
    request({
      url: `/country-city/${id}`,
      method: "GET",
      onSuccess: ({ data, status }) => {
        console.log(data, "setCities");
        if (data) {
          setCities(data);
        }
      },
    });
  };

  const customRequest = async (options) => {
    const { file, onSuccess, onError } = options;

    // Simulating an asynchronous file upload process
    try {
      setParsing(true)
      // You can perform your custom file upload logic here
      // For demonstration, we'll simply log the file details
      console.log('Uploading file:', file);  
      parseExcel(file);

      // Simulating upload success after a delay
     
    } catch (error) {
      console.error('Upload failed:', error);
      onError(error);
    }
  };

  useEffect(() => {
    if (!country.country_id) return;
    getCities(country.country_id);
  }, [country.country_id]);

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
        disabled:parsing
      }}
      className="tab_modal"
    >
      <Form id="create" form={form} onFinish={onImport} layout="vertical">
        <Row>
          <Col span={24} sm={12}>
            <Form.Item
              label={lang("City")}
              name="city_id"
              rules={[
                { required: true, message: lang("Please select the city!") },
              ]}
            >
              <Select
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                placeholder={lang("Select City")}
                showSearch
              >
                {cities.map((item) => (
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
              <Button
                className="ant-btn ant-btn-default edit-cls btnStyle primary_btn"
                title={lang("Download Sample File")}
                onClick={() => SampleFileDownload(sectionName)}
              >
                <InboxOutlined />
                &nbsp;&nbsp;Download Sample File
              </Button>
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
                // onChange={handleImport}
                customRequest={customRequest}
              >
                <p className="ant-upload-drag-icon">
                  {" "}
                {!parsing  ? <InboxOutlined /> :<Spin />}{" "}
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
    </Modal>
  );
};

export default DeliveryChargeImport;
