"use client";
import { Button, Modal, Select, Table, Tooltip, Col, Row, Tabs, Image, Card, Input, Badge } from "antd";
import React, { useContext, useEffect, useState } from "react";
import SectionWrapper from "../../components/SectionWrapper";
import apiPath from "../../constants/apiPath";
import { AppStateContext, useAppContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import EditIcon from "../../assets/images/edit.svg";
import deleteWhiteIcon from "../../assets/images/icon/deleteWhiteIcon.png";

function Index() {
  const heading = lang("Diary") + " " + lang("Management");
  const { setPageHeading } = useContext(AppStateContext);
  const sectionName = lang("Diary");
  const navigate = useNavigate();
  const api = {
    addEdit: apiPath.listDiary,
    list: apiPath.listDiary,
  };

  const [searchText, setSearchText] = useState("");
  const { request } = useRequest();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState();
  const [showDelete, setShowDelete] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const debouncedSearchText = useDebounce(searchText, 300);

  const columns = [
    {
      title: lang("S. No"),
      dataIndex: "index",
      key: "index",
      render: (value, item, index) => (pagination.current === 1 ? index + 1 : (pagination.current - 1) * 10 + (index + 1)),
    },
    {
      title: lang("Image"),
      dataIndex: "image",
      key: "image",
      render: (_, { image }) => <Image width={50} src={image ? apiPath.assetURL + image : "/images/png/not_found.png"} className="table-img" />,
    },
    {
      title: lang("Title"),
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a?.title?.localeCompare(b?.title),
      sortDirections: ["ascend", "descend"],
      width: 200,
      render: (_, { title }) => {
        return title ? title : "-";
      },
    },

    {
      title: lang("Created On"),
      key: "created_at",
      dataIndex: "created_at",
      sorter: (a, b) => a?.created_at?.localeCompare(b?.created_at),
      sortDirections: ["ascend", "descend"],
      render: (_, { created_at }) => {
        return dayjs(created_at).format("MMM D, YYYY");
      },
    },
    {
      title: lang("Status"),
      fixed: "right",
      key: "action",
      render: (_, record) => {
        return (
          <div div className="d-flex justify-contenbt-start">
            <>
              <Tooltip title={lang("Status")} color={"purple"} key={"Status"}>
                <Button
                  title="Block"
                  className="block-cls cap"
                  onClick={() => {
                    setSelected(record);
                    setShowStatus(true);
                  }}
                >
                  <Badge status={record.is_active ? "success" : "error"} text={record?.is_active ? "Active" : "In-Active"} />
                </Button>
              </Tooltip>
            </>
          </div>
        );
      },
    },

    {
      title: lang("Action"),
      fixed: "right",
      key: "action",
      render: (_, record) => {
        return (
          <div div className="d-flex justify-contenbt-start">
            <>
              <Tooltip title={lang("Edit")} color={"purple"} key={"edit"}>
                <Button className="edit-cls btnStyle primary_btn" onClick={() => navigate(`/diary-add-edit/${record?._id}`)}>
                  <img src={EditIcon} />
                </Button>
              </Tooltip>

              <Tooltip title={lang("Delete")} color={"purple"} key={"Delete"}>
                <Button
                  title="Delete"
                  className="btnStyle deleteDangerbtn"
                  onClick={() => {
                    setSelected(record);
                    setShowDelete(true);
                  }}
                >
                  <img src={deleteWhiteIcon} />
                </Button>
              </Tooltip>
            </>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    fetchData({ ...pagination, current: 1 });
  }, [refresh, debouncedSearchText]);

  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);

  const fetchData = (pagination, filters, sorter) => {
    const filterActive = filters ? filters.is_active : null;

    request({
      url: api.list + `?page=${pagination ? pagination.current : 1}&pageSize=${pagination ? pagination.pageSize : 10}&search=${debouncedSearchText}`,
      method: "GET",
      onSuccess: ({ data, status, total, message }) => {
        setLoading(false);
        if (status) {
          setList(data?.docs ?? []);
          setPagination((prev) => ({
            ...prev,
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
          }));
        }
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const handleChange = (pagination, filters, sorter) => {
    const { field, order } = sorter;
    let query = undefined;
    if (field && order) {
      query = `${field}=${order}`;
      console.log(query);
    }
    fetchData(pagination, filters, query);
  };

  const onSearch = (e) => {
    setSearchText(e.target.value);
  };

  return (
    <>
      <div className="tabled quoteManagement">
        <Row gutter={[24, 0]}>
          <Col xs={24} xl={24}>
            <Card bordered={false} className="criclebox tablespace mb-24">
              <SectionWrapper
                cardHeading={sectionName + " " + lang("List")}
                extra={
                  <>
                    <div className="w-100 d-flex align-items-baseline text-head_right_cont">
                      <div className="pageHeadingSearch">
                        <Input.Search className="searchInput" value={searchText} placeholder={lang("Search by title")} onChange={onSearch} allowClear />
                      </div>

                      <Button className="ms-sm-2 mt-xs-2 primary_btn btnStyle" onClick={() => navigate("/diary-add-edit")}>
                        {lang("Add")} {sectionName}
                      </Button>
                    </div>
                  </>
                }
              >
                <div className="table-responsive customPagination">
                  <Table
                    loading={loading}
                    columns={columns}
                    dataSource={list}
                    pagination={{
                      current: pagination?.current,
                      defaultPageSize: 10,
                      responsive: true,
                      total: pagination.total,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      pageSizeOptions: ["10", "20", "30", "50", "100"],
                    }}
                    onChange={handleChange}
                    className="ant-border-space"
                  />
                </div>
              </SectionWrapper>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Index;
