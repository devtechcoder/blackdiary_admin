"use client";
import { Button, Card, Col, Image, Input, Row, Select, Switch, Table, Tooltip } from "antd";
import React, { useContext, useEffect, useMemo, useState } from "react";
import DeleteModal from "../../components/DeleteModal";
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
  const heading = lang("Feed") + " " + lang("Management");
  const { setPageHeading } = useContext(AppStateContext);
  const sectionName = lang("Shayari");
  const navigate = useNavigate();
  const api = {
    addEdit: apiPath.listDiary,
    list: apiPath.listDiary,
    status: apiPath.statusDiary,
    categories: apiPath.common.categories,
    subCategories: apiPath.common.subCategories,
  };

  const [searchText, setSearchText] = useState("");
  const { request } = useRequest();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selected, setSelected] = useState();
  const [deleteModal, showDeleteModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState();
  const [subCategoryFilter, setSubCategoryFilter] = useState();
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const debouncedSearchText = useDebounce(searchText, 300);

  const filteredSubCategoryOptions = useMemo(() => {
    if (!categoryFilter) {
      return subCategoryOptions;
    }

    return subCategoryOptions.filter((item) => Array.isArray(item.category) && item.category.includes(categoryFilter));
  }, [categoryFilter, subCategoryOptions]);

  const fetchCategories = () => {
    request({
      url: api.categories,
      method: "GET",
      onSuccess: ({ data }) => {
        setCategoryOptions(Array.isArray(data) ? data : []);
      },
      onError: (error) => {
        ShowToast(error?.response?.data?.message || error?.message || "Failed to load categories", Severty.ERROR);
      },
    });
  };

  const fetchSubCategories = () => {
    request({
      url: api.subCategories,
      method: "GET",
      onSuccess: ({ data }) => {
        setSubCategoryOptions(Array.isArray(data) ? data : []);
      },
      onError: (error) => {
        ShowToast(error?.response?.data?.message || error?.message || "Failed to load sub categories", Severty.ERROR);
      },
    });
  };

  const columns = [
    {
      title: lang("S. No"),
      dataIndex: "index",
      key: "index",
      render: (value, item, index) => (pagination.current === 1 ? index + 1 : (pagination.current - 1) * 10 + (index + 1)),
    },

    {
      title: lang("Content"),
      dataIndex: "content",
      key: "content",
      sortDirections: ["ascend", "descend"],
      width: 320,
      render: (_, { content }) => {
        const plainText = String(content || "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        if (!plainText) {
          return "-";
        }

        const preview = plainText.length > 90 ? `${plainText.slice(0, 90)}...` : plainText;
        return <span title={plainText}>{preview}</span>;
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
      key: "is_active",
      dataIndex: "is_active",
      render: (_, record) => <Switch checked={record?.is_active} onChange={() => handleChangeStatus(record)} />,
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
                <Button className="edit-cls btnStyle primary_btn" onClick={() => navigate(`/diary-add-edit/${record?._id}?type=shayari`)}>
                  <img src={EditIcon} />
                </Button>
              </Tooltip>

              <Tooltip title={lang("Delete")} color={"purple"} key={"Delete"}>
                <Button
                  title="Delete"
                  className="btnStyle deleteDangerbtn"
                  onClick={() => {
                    setSelected(record);
                    showDeleteModal(true);
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
    fetchData({ current: 1, pageSize: pagination.pageSize });
  }, [refresh, debouncedSearchText, categoryFilter, subCategoryFilter]);

  useEffect(() => {
    setPageHeading(heading);
    fetchCategories();
    fetchSubCategories();
  }, [setPageHeading]);

  const fetchData = (pagination, filters, sorter) => {
    request({
      url:
        api.list +
        `?type=shayari&page=${pagination ? pagination.current : 1}&pageSize=${pagination ? pagination.pageSize : 10}&search=${debouncedSearchText}&category=${categoryFilter || ""}&sub_category_id=${subCategoryFilter || ""}`,
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

  const handleChangeStatus = (record) => {
    request({
      url: `${apiPath.statusDiary}/${record?._id}?type=shayari`,
      method: "GET",
      onSuccess: (response) => {
        ShowToast(response.message, Severty.SUCCESS);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        ShowToast(error?.response?.data?.message || error?.message || "Failed to update status", Severty.ERROR);
      },
    });
  };

  const onDelete = (id) => {
    request({
      url: `${apiPath.listDiary}/${id}?type=shayari`,
      method: "DELETE",
      onSuccess: (response) => {
        ShowToast(response.message, Severty.SUCCESS);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        ShowToast(error?.response?.data?.message || error?.message || "Failed to delete record", Severty.ERROR);
      },
    });
  };

  const onSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleCategoryFilterChange = (value) => {
    setCategoryFilter(value);
    setSubCategoryFilter(undefined);
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
                    <div className="w-100 d-flex align-items-baseline flex-wrap gap-2 text-head_right_cont">
                      <div className="pageHeadingSearch">
                        <Input.Search className="searchInput" value={searchText} placeholder={lang("Search by content")} onChange={onSearch} allowClear />
                      </div>

                      <Select
                        allowClear
                        showSearch
                        value={categoryFilter}
                        placeholder={lang("Filter Category")}
                        onChange={handleCategoryFilterChange}
                        className="searchInput"
                        style={{ minWidth: 180 }}
                        optionFilterProp="label"
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                      >
                        {categoryOptions.map((item) => (
                          <Select.Option key={item.value} value={item.value} label={item.name || item.value}>
                            {item.name || item.value}
                          </Select.Option>
                        ))}
                      </Select>

                      <Select
                        allowClear
                        showSearch
                        value={subCategoryFilter}
                        placeholder={lang("Filter Sub Category")}
                        onChange={(value) => setSubCategoryFilter(value)}
                        className="searchInput"
                        style={{ minWidth: 200 }}
                        optionFilterProp="label"
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                      >
                        {filteredSubCategoryOptions.map((item) => (
                          <Select.Option key={item._id} value={item._id} label={item.name}>
                            {item.name}
                          </Select.Option>
                        ))}
                      </Select>

                      <Button className="ms-sm-2 mt-xs-2 primary_btn btnStyle" onClick={() => navigate("/diary-add-edit?type=shayari")}>
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
      {deleteModal && (
        <DeleteModal
          reasons={[]}
          title={lang("Delete Shayari")}
          subtitle={lang("This action will permanently remove the record. Are you sure?")}
          show={deleteModal}
          hide={() => {
            showDeleteModal(false);
            setSelected(undefined);
          }}
          onOk={() => onDelete(selected?._id)}
        />
      )}
    </>
  );
}

export default Index;
