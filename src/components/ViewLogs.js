import { Button, Col, Image, Modal, Row, Divider, Steps } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import notfound from "../assets/images/not_found.png";
import apiPath from "../constants/apiPath";
import { Severty, ShowToast } from "../helper/toast";
import useRequest from "../hooks/useRequest";
import { capitalize } from "../helper/functions";
import lang from "../helper/langHelper";

export const ApproveStatus = {
  REJECT: "rejected",
  ACCEPT: "accepted",
  SUSPENDED: "suspended",
  PENDING: "pending",
};

const ViewLogs = ({ show, hide, data }) => {
  const { request } = useRequest();

  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const getLogs = () => {
    setLoading(true);
    request({
      url: apiPath.log + "/" + data?._id,
      method: "GET",
      onSuccess: ({ data }) => {
        setLoading(false);
        setLogs(data);
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    if (!data) return;
    getLogs();
  }, [data]);

  return (
    <Modal
      open={show}
      width={750}
      okText="User"
      onCancel={hide}
      footer={[
        // <Button
        //   key="reject"
        //   onClick={() => {
        //     handleApproveReject(ApproveStatus.REJECT);
        //   }}
        // >
        //   Reject
        // </Button>,
        <Button key="approve" type="primary" onClick={hide}>
          {lang("Okay")}
        </Button>,
      ]}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal driver-modal"
    >
      {/* <div className="modal_title_wrap">
         <h4 className="modal_title_cls">New Driver request</h4>
          <p>New delivery agent has been registered with the app.</p>
      </div> */}
      <div className="driver_img">
        <Image
          src={data?.image ? data?.image : notfound}
          className="table-img"
          style={{ width: "70px", height: "70px" }}
        />
      </div>
      <div className="new_driver_dtl">
        <Row gutter={24}>
          <Col span={24} sm={6} md={8}>
            <p>
              {data?.type} {lang("Name")}:
            </p>
            <p className="font-bold">{data.name}</p>
          </Col>
          <Col span={24} sm={8} md={8}>
            <p>{lang("Phone Number")}:</p>
            <p className="font-bold">
              {data?.country_code + " " + data?.mobile_number}
            </p>
          </Col>
          <Col span={24} sm={10} md={8}>
            <p>{lang("Email Address")}:</p>
            <p className="font-bold">{data?.email}</p>
          </Col>
        </Row>
      </div>
      <div className="driver-personal-dtl">
        <Divider />
        <Steps
          progressDot
          current={0}
          className="driver-dtl-text"
          direction="vertical"
          items={logs.map((item) => ({
            title: `${capitalize(item.action)} on ${moment(
              item.created_at,
            ).format("ll")}`,
            description: item.message,
          }))}
        />
      </div>
    </Modal>
  );
};

export default ViewLogs;
