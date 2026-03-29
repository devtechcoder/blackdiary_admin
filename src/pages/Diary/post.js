"use client";
import { Button, Card, Col, Image, Input, Row, Select, Switch, Table, Tooltip } from "antd";
import dayjs from "dayjs";
import React, { useContext, useEffect, useMemo, useState } from "react";
import DeleteModal from "../../components/DeleteModal";
import SectionWrapper from "../../components/SectionWrapper";
import apiPath from "../../constants/apiPath";
import { AppStateContext } from "../../context/AppContext";
import EditIcon from "../../assets/images/edit.svg";
import deleteWhiteIcon from "../../assets/images/icon/deleteWhiteIcon.png";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";
import { useNavigate } from "react-router";
import notfound from "../../assets/images/not_found.png";

function Index() {
  const heading = lang("Feed") + " " + lang("Management");
  const { setPageHeading } = useContext(AppStateContext);
  const sectionName = lang("Post");
  const navigate = useNavigate();
  const { request } = useRequest();

  const api = {
    addEdit: apiPath.listDiary,
    list: apiPath.listDiary,
    status: apiPath.statusDiary,
    categories: apiPath.common.categories,
    subCategories: apiPath.common.subCategories,
  };

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState();
  const [subCategoryFilter, setSubCategoryFilter] = useState();
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selected, setSelected] = useState();
  const [deleteModal, showDeleteModal] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
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

  const fetchData = (pageConfig = { current: 1, pageSize: 10 }) => {
    setLoading(true);

    request({
      url: `${api.list}?type=post&page=${pageConfig?.current || 1}&pageSize=${pageConfig?.pageSize || 10}&search=${debouncedSearchText}&category=${categoryFilter || ""}&sub_category_id=${subCategoryFilter || ""}`,
      method: "GET",
      onSuccess: ({ data }) => {
        setLoading(false);
        setList(
          (data?.docs || []).map((item) => ({
            ...item,
            key: item._id,
          })),
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
        ShowToast(error?.response?.data?.message || error?.message || "Failed to load feed records", Severty.ERROR);
      },
    });
  };

  const handleChangeStatus = (record) => {
    request({
      url: `${api.status}/${record?._id}?type=post`,
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
      url: `${api.list}/${id}?type=post`,
      method: "DELETE",
      onSuccess: (response) => {
        ShowToast(response.message, Severty.SUCCESS);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        ShowToast(error?.response?.data?.message || error?.message || "Failed to delete feed item", Severty.ERROR);
      },
    });
  };

  const columns = [
    {
      title: lang("S. No"),
      key: "index",
      render: (_, __, index) => (pagination.current === 1 ? index + 1 : (pagination.current - 1) * pagination.pageSize + (index + 1)),
      width: 90,
    },
    {
      title: lang("Post"),
      dataIndex: "image",
      key: "image",
      render: (_, { image }) => <Image width={50} src={image ? image : notfound} className="table-img" />,
    },
    {
      title: lang("Category"),
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (_, { category }) => <span className="cap">{category || "-"}</span>,
    },
    {
      title: lang("Sub Categories"),
      key: "sub_category_id",
      width: 220,
      render: (_, { sub_category_id }) => {
        const labels = Array.isArray(sub_category_id) ? sub_category_id.map((item) => item?.name || item).filter(Boolean) : [];
        return <span className="cap">{labels.length ? labels.join(", ") : "-"}</span>;
      },
    },
    {
      title: lang("Keywords"),
      key: "keywords",
      width: 240,
      render: (_, { keywords }) => {
        const labels = Array.isArray(keywords) ? keywords.map((item) => item?.name || item?.slug || item).filter(Boolean) : [];
        return <span className="cap">{labels.length ? labels.join(", ") : "-"}</span>;
      },
    },
    {
      title: lang("Status"),
      key: "is_active",
      dataIndex: "is_active",
      width: 120,
      render: (_, record) => <Switch checked={record?.is_active} onChange={() => handleChangeStatus(record)} />,
    },
    {
      title: lang("Action"),
      key: "action",
      fixed: "right",
      width: 160,
      render: (_, record) => (
        <div className="d-flex justify-contenbt-start">
          <Tooltip title={lang("Edit")} color={"purple"} key={`edit-${record?._id}`}>
            <Button className="edit-cls btnStyle primary_btn" onClick={() => navigate(`/diary-add-edit/${record?._id}?type=post`)}>
              <img src={EditIcon} alt="" />
            </Button>
          </Tooltip>

          <Tooltip title={lang("Delete")} color={"purple"} key={`delete-${record?._id}`}>
            <Button
              title={lang("Delete")}
              className="btnStyle deleteDangerbtn"
              onClick={() => {
                setSelected(record);
                showDeleteModal(true);
              }}
            >
              <img src={deleteWhiteIcon} alt="" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  useEffect(() => {
    setPageHeading(heading);
    fetchCategories();
    fetchSubCategories();
  }, [heading, setPageHeading]);

  useEffect(() => {
    fetchData({ current: 1, pageSize: pagination.pageSize });
  }, [refresh, debouncedSearchText, categoryFilter, subCategoryFilter]);

  const handleCategoryFilterChange = (value) => {
    setCategoryFilter(value);
    setSubCategoryFilter(undefined);
  };

  return (
    <div className="tabled quoteManagement">
      <Row gutter={[24, 0]}>
        <Col xs={24} xl={24}>
          <Card bordered={false} className="criclebox tablespace mb-24">
            <SectionWrapper
              cardHeading={sectionName + " " + lang("List")}
              extra={
                <div className="w-100 d-flex align-items-center flex-wrap gap-2 text-head_right_cont">
                  <div className="pageHeadingSearch">
                    <Input.Search className="searchInput" value={searchText} placeholder={lang("Search records")} onChange={(e) => setSearchText(e.target.value)} allowClear />
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

                  <Button
                    className="primary_btn btnStyle"
                    onClick={() => {
                      navigate("/diary-add-edit?type=post");
                    }}
                  >
                    {lang("Add")} {sectionName}
                  </Button>
                </div>
              }
            >
              <h4 className="text-right mb-1cont-space cont-space">
                {lang("Total")} {pagination.total || 0} {lang("Record(s)")}
              </h4>
              <div className="table-responsive customPagination">
                <Table
                  loading={loading}
                  columns={columns}
                  dataSource={list}
                  scroll={{ x: 1100 }}
                  pagination={{
                    current: pagination?.current,
                    defaultPageSize: 10,
                    responsive: true,
                    total: pagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSize: pagination.pageSize,
                    pageSizeOptions: ["10", "20", "30", "50", "100"],
                  }}
                  onChange={(nextPagination) => fetchData(nextPagination)}
                  className="ant-border-space"
                />
              </div>
            </SectionWrapper>
          </Card>
        </Col>
      </Row>

      {deleteModal && (
        <DeleteModal
          reasons={[]}
          title={lang("Delete Feed")}
          subtitle={lang("This action will permanently remove the record. Are you sure?")}
          show={deleteModal}
          hide={() => {
            showDeleteModal(false);
            setSelected(undefined);
          }}
          onOk={() => onDelete(selected?._id)}
        />
      )}
    </div>
  );
}

export default Index;
