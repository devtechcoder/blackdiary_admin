import { Button, DatePicker, Input, Modal, Select, Table, Tag, Tooltip, Descriptions } from "antd";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import moment from "moment";

import SectionWrapper from "../../components/SectionWrapper";
import ShowTotal from "../../components/ShowTotal";
import { AppStateContext } from "../../context/AppContext";
import apiPath from "../../constants/apiPath";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";

const { RangePicker } = DatePicker;

const statusOptions = [
  { label: "Success", value: "SUCCESS" },
  { label: "Failed", value: "FAILED" },
];

const normalizeDateRange = (range) => {
  if (!Array.isArray(range) || range.length !== 2 || !range[0] || !range[1]) return {};
  return {
    start_date: range[0].format("YYYY-MM-DD"),
    end_date: range[1].format("YYYY-MM-DD"),
  };
};

function Index() {
  const heading = `${lang("Email Logs")} ${lang("Management")}`;
  const { setPageHeading } = useContext(AppStateContext);
  const { request } = useRequest();
  const requestRef = useRef(request);

  const api = {
    list: apiPath.listEmailLogs,
    view: apiPath.viewEmailLog,
  };

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [slugFilter, setSlugFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const debouncedSearchText = useDebounce(searchText, 300);

  useEffect(() => {
    requestRef.current = request;
  }, [request]);

  const fetchData = useCallback(
    (pageConfig = { current: 1, pageSize: 10 }) => {
      const params = new URLSearchParams();
      params.set("page", String(pageConfig?.current || 1));
      params.set("pageSize", String(pageConfig?.pageSize || 10));

      if (debouncedSearchText) params.set("search", debouncedSearchText);
      if (statusFilter) params.set("status", statusFilter);
      if (slugFilter.trim()) params.set("slug", slugFilter.trim());
      if (emailFilter.trim()) params.set("email", emailFilter.trim());

      const { start_date, end_date } = normalizeDateRange(dateRange);
      if (start_date && end_date) {
        params.set("start_date", start_date);
        params.set("end_date", end_date);
      }

      setLoading(true);
      requestRef.current({
        url: `${api.list}?${params.toString()}`,
        method: "GET",
        onSuccess: ({ data }) => {
          setLoading(false);
          setList(
            (data?.docs || []).map((item) => ({
              ...item,
              key: item._id,
            }))
          );
          setPagination((prev) => ({
            ...prev,
            current: pageConfig?.current || 1,
            pageSize: pageConfig?.pageSize || 10,
            total: data?.totalDocs || 0,
          }));
        },
        onError: (error) => {
          setLoading(false);
          ShowToast(error?.response?.data?.message || error?.message || "Failed to load email logs", Severty.ERROR);
        },
      });
    },
    [api.list, dateRange, debouncedSearchText, emailFilter, slugFilter, statusFilter]
  );

  const fetchDetails = (id) => {
    if (!id) return;

    setDetailLoading(true);
    requestRef.current({
      url: `${api.view}/${id}`,
      method: "GET",
      onSuccess: ({ data }) => {
        setDetailLoading(false);
        setSelected(data);
        setDetailVisible(true);
      },
      onError: (error) => {
        setDetailLoading(false);
        ShowToast(error?.response?.data?.message || error?.message || "Failed to load email log details", Severty.ERROR);
      },
    });
  };

  useEffect(() => {
    setPageHeading(heading);
  }, [heading, setPageHeading]);

  useEffect(() => {
    fetchData({ current: 1, pageSize: pagination.pageSize });
  }, [fetchData, pagination.pageSize]);

  const columns = [
    {
      title: lang("To"),
      dataIndex: "to",
      key: "to",
      render: (_, { to }) => <span className="cap">{to || "-"}</span>,
    },
    {
      title: lang("Subject"),
      dataIndex: "subject",
      key: "subject",
      render: (_, { subject }) => <span className="cap">{subject || "-"}</span>,
    },
    {
      title: lang("Slug"),
      dataIndex: "slug",
      key: "slug",
      render: (_, { slug }) => <span className="cap">{slug || "-"}</span>,
    },
    {
      title: lang("Status"),
      dataIndex: "status",
      key: "status",
      render: (_, { status }) =>
        status === "SUCCESS" ? (
          <Tag color="green">{lang("Success")}</Tag>
        ) : (
          <Tag color="red">{lang("Failed")}</Tag>
        ),
    },
    {
      title: lang("Sent At"),
      dataIndex: "sentAt",
      key: "sentAt",
      render: (_, { sentAt }) => (sentAt ? moment(sentAt).format("DD-MMM-YYYY hh:mm A") : "-"),
    },
    {
      title: lang("Action"),
      key: "action",
      render: (_, record) => (
        <div className="d-flex justify-contenbt-start">
          <Tooltip title={lang("View")} color={"purple"} key={`view-email-log-${record?._id}`}>
            <Button title={lang("View")} className="primary_btn btnStyle" onClick={() => fetchDetails(record?._id)}>
              {lang("View")}
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <SectionWrapper
        cardHeading={heading}
        extra={
          <div className="w-100 text-head_right_cont flex-wrap gap-2">
            <div className="pageHeadingSearch">
              <Input.Search className="searchInput" placeholder={lang("Search by subject, response or slug")} onChange={(e) => setSearchText(e.target.value)} allowClear />
            </div>

            <Select
              allowClear
              value={statusFilter}
              placeholder={lang("Filter Status")}
              onChange={setStatusFilter}
              className="searchInput"
              style={{ minWidth: 160 }}
              options={statusOptions}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
            />

            <Input
              className="searchInput"
              placeholder={lang("Filter by slug")}
              value={slugFilter}
              onChange={(e) => setSlugFilter(e.target.value)}
              allowClear
              style={{ minWidth: 180 }}
            />

            <Input
              className="searchInput"
              placeholder={lang("Filter by email")}
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              allowClear
              style={{ minWidth: 200 }}
            />

            <RangePicker value={dateRange} onChange={(values) => setDateRange(values || [])} />
          </div>
        }
      >
        <h4 className="text-right mb-1cont-space cont-space">{ShowTotal(pagination.total || 0)}</h4>
        <div className="table-responsive customPagination checkBoxSrNo">
          <Table
            loading={loading}
            columns={columns}
            dataSource={list}
            pagination={{
              current: pagination.current,
              defaultPageSize: 10,
              responsive: true,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSize: pagination.pageSize,
              pageSizeOptions: ["10", "20", "30", "50"],
            }}
            onChange={(nextPagination) => fetchData(nextPagination)}
            className="ant-border-space"
          />
        </div>
      </SectionWrapper>

      <Modal
        open={detailVisible}
        width={900}
        footer={null}
        onCancel={() => {
          setDetailVisible(false);
          setSelected(null);
        }}
        centered
        className="tab_modal"
      >
        <h4 className="modal_title_cls">{lang("Email Log Details")}</h4>

        <Descriptions column={1} bordered>
          <Descriptions.Item label={lang("To")}>{selected?.to || "-"}</Descriptions.Item>
          <Descriptions.Item label={lang("Subject")}>{selected?.subject || "-"}</Descriptions.Item>
          <Descriptions.Item label={lang("Slug")}>{selected?.slug || "-"}</Descriptions.Item>
          <Descriptions.Item label={lang("Status")}>
            {selected?.status === "SUCCESS" ? <Tag color="green">{lang("Success")}</Tag> : <Tag color="red">{lang("Failed")}</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label={lang("Sent At")}>{selected?.sentAt ? moment(selected.sentAt).format("DD-MMM-YYYY hh:mm A") : "-"}</Descriptions.Item>
          <Descriptions.Item label={lang("Response")}>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{selected?.response || "-"}</pre>
          </Descriptions.Item>
          <Descriptions.Item label={lang("Email Body")}>
            {selected?.body ? (
              <div
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 12,
                  padding: 16,
                  maxHeight: 260,
                  overflow: "auto",
                  background: "#fff",
                }}
                dangerouslySetInnerHTML={{ __html: selected.body }}
              />
            ) : (
              "-"
            )}
          </Descriptions.Item>
        </Descriptions>

        <div className="d-flex justify-content-end mt-3 gap-2">
          <Button
            className="primary_btn btnStyle"
            loading={detailLoading}
            onClick={() => {
              setDetailVisible(false);
              setSelected(null);
            }}
          >
            {lang("Close")}
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default Index;
