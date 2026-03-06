import { Button, Card, Descriptions, Select, Skeleton } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import apiPath from "../../constants/apiPath";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";

const statusOptions = [
  { label: "Viewed", value: "viewed" },
  { label: "Archived", value: "archived" },
  { label: "Spam", value: "spam" },
];

function View() {
  const params = useParams();
  const navigate = useNavigate();
  const { request } = useRequest();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState(null);
  const [status, setStatus] = useState("viewed");

  const fetchDetails = () => {
    if (!params?.id) return;
    request({
      url: `${apiPath.listEnquiry}/${params.id}`,
      method: "GET",
      onSuccess: ({ data }) => {
        setDetails(data);
        setStatus(data?.status === "new" ? "viewed" : data?.status || "viewed");
        setLoading(false);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error?.response?.data?.message || "Unable to fetch enquiry details", Severty.ERROR);
      },
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchDetails();
  }, [params?.id]);

  const updateStatus = () => {
    if (!params?.id) return;
    setSubmitting(true);
    request({
      url: `${apiPath.enquiryStatus}/${params.id}/status`,
      method: "PUT",
      data: { status },
      onSuccess: (response) => {
        setSubmitting(false);
        if (response?.status) {
          ShowToast(response?.message || "Status updated successfully", Severty.SUCCESS);
          fetchDetails();
        } else {
          ShowToast(response?.message || "Unable to update status", Severty.ERROR);
        }
      },
      onError: (error) => {
        setSubmitting(false);
        ShowToast(error?.response?.data?.message || "Unable to update status", Severty.ERROR);
      },
    });
  };

  return (
    <Card
      title="Enquiry Details"
      extra={
        <Button className="btnStyle" onClick={() => navigate("/enquiry")}>
          Back
        </Button>
      }
    >
      {loading ? (
        <Skeleton active />
      ) : (
        <>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Name">{details?.name || "-"}</Descriptions.Item>
            <Descriptions.Item label="Email">{details?.email || "-"}</Descriptions.Item>
            <Descriptions.Item label="Phone">{details?.phone || "-"}</Descriptions.Item>
            <Descriptions.Item label="Message">{details?.message || "-"}</Descriptions.Item>
            <Descriptions.Item label="Current Status">{details?.status || "new"}</Descriptions.Item>
            <Descriptions.Item label="Date">{details?.createdAt ? moment(details.createdAt).format("DD-MMM-YYYY hh:mm A") : "-"}</Descriptions.Item>
          </Descriptions>

          <div className="mt-3 d-flex align-items-center gap-2">
            <Select style={{ minWidth: 220 }} value={status} onChange={setStatus} options={statusOptions} />
            <Button className="btnStyle primary_btn" loading={submitting} onClick={updateStatus}>
              Update Status
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

export default View;
