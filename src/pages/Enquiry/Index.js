import { Button, Input, Table, Tag, Tooltip } from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import SectionWrapper from "../../components/SectionWrapper";
import apiPath from "../../constants/apiPath";
import { AppStateContext } from "../../context/AppContext";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";
import ShowTotal from "../../components/ShowTotal";

const Search = Input.Search;

const statusColorMap = {
  new: "blue",
  viewed: "green",
  archived: "orange",
  spam: "red",
};

function Index() {
  const { setPageHeading } = useContext(AppStateContext);
  const { request } = useRequest();
  const navigate = useNavigate();

  const sectionName = "Enquiry";

  const [searchText, setSearchText] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [refresh, setRefresh] = useState(false);
  const debouncedSearchText = useDebounce(searchText, 300);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, { name }) => (name ? <span>{name}</span> : "-"),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (_, { email }) => (email ? <span>{email}</span> : "-"),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (_, { phone }) => (phone ? <span>{phone}</span> : "-"),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (_, { message }) => {
        if (!message) return "-";
        const preview = message.length > 80 ? `${message.slice(0, 80)}...` : message;
        return <span>{preview}</span>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, { status }) => <Tag color={statusColorMap[status] || "default"}>{status || "new"}</Tag>,
      filters: [
        { text: "New", value: "new" },
        { text: "Viewed", value: "viewed" },
        { text: "Archived", value: "archived" },
        { text: "Spam", value: "spam" },
      ],
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_, { createdAt }) => (createdAt ? moment(createdAt).format("DD-MMM-YYYY hh:mm A") : "-"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Tooltip title="View">
          <Button className="btnStyle primary_btn" onClick={() => navigate(`/enquiry/${record?._id}`)}>
            View
          </Button>
        </Tooltip>
      ),
    },
  ];

  const fetchData = (page = pagination, filters = {}) => {
    const statusFilter = filters?.status?.length ? filters.status.join(",") : "";
    request({
      url: `${apiPath.listEnquiry}?page=${page?.current || 1}&pageSize=${page?.pageSize || 10}&search=${debouncedSearchText}&status=${statusFilter}`,
      method: "GET",
      onSuccess: ({ data }) => {
        const docs = data?.docs || [];
        setList(
          docs.map((item) => ({
            ...item,
            key: item._id,
          })),
        );
        setPagination((prev) => ({
          ...prev,
          current: page?.current || 1,
          pageSize: page?.pageSize || 10,
          total: data?.totalDocs || 0,
        }));
        setLoading(false);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error?.response?.data?.message || "Unable to fetch enquiries", Severty.ERROR);
      },
    });
  };

  useEffect(() => {
    setPageHeading(`${sectionName} Management`);
  }, [setPageHeading]);

  useEffect(() => {
    setLoading(true);
    fetchData({ ...pagination, current: 1 });
  }, [debouncedSearchText, refresh]);

  const handleTableChange = (nextPagination, filters) => {
    setLoading(true);
    fetchData(nextPagination, filters);
  };

  return (
    <SectionWrapper
      cardHeading={`All ${sectionName}`}
      extra={
        <div className="w-100 text-head_right_cont">
          <Search className="searchInput" placeholder="Search by name, email or message" onChange={(event) => setSearchText(event.target.value)} allowClear />
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
            defaultPageSize: 10,
            responsive: true,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ["10", "20", "30", "50"],
          }}
          onChange={handleTableChange}
          className="ant-border-space"
        />
      </div>
    </SectionWrapper>
  );
}

export default Index;
