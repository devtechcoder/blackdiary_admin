import { Button, Input, Select, Switch, Table, Tooltip } from "antd";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import deleteWhiteIcon from "../../assets/images/icon/deleteWhiteIcon.png";
import EditIcon from "../../assets/images/edit.svg";
import Plus from "../../assets/images/plus.svg";
import DeleteModal from "../../components/DeleteModal";
import SectionWrapper from "../../components/SectionWrapper";
import ShowTotal from "../../components/ShowTotal";
import { AppStateContext } from "../../context/AppContext";
import apiPath from "../../constants/apiPath";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";
import AddForm from "./AddForm";

function Index() {
  const heading = "Keyword / Emotions Management";
  const { setPageHeading } = useContext(AppStateContext);
  const { request } = useRequest();
  const requestRef = useRef(request);

  const api = {
    addEdit: apiPath.keywordEmotion,
    list: apiPath.keywordEmotion,
    categories: apiPath.common.categories,
    subCategories: apiPath.common.subCategories,
  };
  const listApi = api.list;
  const addEditApi = api.addEdit;
  const categoriesApi = api.categories;
  const subCategoriesApi = api.subCategories;

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState();
  const [subCategoryFilter, setSubCategoryFilter] = useState();
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState();
  const [deleteModal, showDeleteModal] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const debouncedSearchText = useDebounce(searchText, 300);

  useEffect(() => {
    requestRef.current = request;
  }, [request]);

  const filteredSubCategoryOptions = useMemo(() => {
    if (!categoryFilter) {
      return subCategoryOptions;
    }

    return subCategoryOptions.filter((item) => Array.isArray(item.category) && item.category.includes(categoryFilter));
  }, [categoryFilter, subCategoryOptions]);

  const fetchCategories = useCallback(() => {
    requestRef.current({
      url: categoriesApi,
      method: "GET",
      onSuccess: ({ data }) => {
        setCategoryOptions(Array.isArray(data) ? data : []);
      },
      onError: (error) => {
        ShowToast(error?.response?.data?.message || error?.message || "Failed to load categories", Severty.ERROR);
      },
    });
  }, [categoriesApi]);

  const fetchSubCategories = useCallback(() => {
    requestRef.current({
      url: subCategoriesApi,
      method: "GET",
      onSuccess: ({ data }) => {
        setSubCategoryOptions(Array.isArray(data) ? data : []);
      },
      onError: (error) => {
        ShowToast(error?.response?.data?.message || error?.message || "Failed to load sub categories", Severty.ERROR);
      },
    });
  }, [subCategoriesApi]);

  const fetchData = useCallback(
    (pageConfig = { current: 1, pageSize: 10 }) => {
      setLoading(true);

      requestRef.current({
        url: `${listApi}?page=${pageConfig?.current || 1}&pageSize=${pageConfig?.pageSize || 10}&search=${debouncedSearchText}&categoryId=${categoryFilter || ""}&subCategoryId=${subCategoryFilter || ""}`,
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
          ShowToast(error?.response?.data?.message || error?.message || "Failed to load keyword emotions", Severty.ERROR);
        },
      });
    },
    [categoryFilter, debouncedSearchText, listApi, subCategoryFilter],
  );

  useEffect(() => {
    setPageHeading(heading);
    fetchCategories();
    fetchSubCategories();
  }, [fetchCategories, fetchSubCategories, heading, setPageHeading]);

  useEffect(() => {
    fetchData({ current: 1, pageSize: pagination.pageSize });
  }, [debouncedSearchText, categoryFilter, subCategoryFilter, fetchData, pagination.pageSize, refresh]);

  const handleChangeStatus = (record) => {
    requestRef.current({
      url: `${addEditApi}/${record?._id}`,
      method: "PUT",
      data: {
        name: record?.name || "",
        categories: record?.categories || [],
        sub_category_ids: (record?.sub_category_ids || []).map((item) => item?._id || item).filter(Boolean),
        is_active: !record?.is_active,
        note: record?.note || "",
        ...(record?.slug ? { slug: record.slug } : {}),
      },
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
    requestRef.current({
      url: `${addEditApi}/${id}`,
      method: "DELETE",
      onSuccess: (response) => {
        ShowToast(response.message, Severty.SUCCESS);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        ShowToast(error?.response?.data?.message || error?.message || "Failed to delete keyword emotion", Severty.ERROR);
      },
    });
  };

  const columns = [
    {
      title: lang("Name"),
      dataIndex: "name",
      key: "name",
      render: (_, { name }) => <span className="cap">{name || "-"}</span>,
    },
    {
      title: lang("Slug"),
      dataIndex: "slug",
      key: "slug",
      width: 260,
      onCell: () => ({
        className: "keyword-emotion-slug-cell",
      }),
      onHeaderCell: () => ({
        className: "keyword-emotion-slug-head",
      }),
      render: (_, { slug }) => <span className="cap keyword-emotion-slug-text">{slug || "-"}</span>,
    },
    {
      title: lang("Categories"),
      dataIndex: "categories",
      key: "categories",
      render: (_, { categories }) => <span className="cap">{Array.isArray(categories) && categories.length ? categories.join(", ") : "-"}</span>,
    },
    {
      title: lang("Sub Categories"),
      dataIndex: "sub_category_ids",
      key: "sub_category_ids",
      render: (_, { sub_category_ids }) => {
        const labels = Array.isArray(sub_category_ids) ? sub_category_ids.map((item) => item?.name || item).filter(Boolean) : [];
        return <span className="cap">{labels.length ? labels.join(", ") : "-"}</span>;
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
      key: "action",
      render: (_, record) => (
        <div className="d-flex justify-contenbt-start">
          <Tooltip title={lang("Edit")} color={"purple"} key={`edit-${record?._id}`}>
            <Button
              title={lang("Edit")}
              className="edit-cls btnStyle primary_btn"
              onClick={() => {
                setSelected(record);
                setVisible(true);
              }}
            >
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

  const handleCategoryFilterChange = (value) => {
    setCategoryFilter(value);
    setSubCategoryFilter(undefined);
  };

  return (
    <>
      <SectionWrapper
        cardHeading={heading}
        extra={
          <div className="w-100 text-head_right_cont flex-wrap gap-2">
            <div className="pageHeadingSearch">
              <Input.Search className="searchInput" placeholder={lang("Search by name or slug")} onChange={(e) => setSearchText(e.target.value)} allowClear />
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
                setSelected(undefined);
                setVisible(true);
              }}
            >
              <span className="add-Ic">
                <img src={Plus} alt="" />
              </span>
              {lang("Add New Keyword / Emotion")}
            </Button>
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
            className="ant-border-space keyword-emotion-table"
          />
        </div>
      </SectionWrapper>

      {visible && (
        <AddForm
          api={api}
          show={visible}
          hide={() => {
            setSelected(undefined);
            setVisible(false);
          }}
          data={selected}
          refresh={() => setRefresh((prev) => !prev)}
          categoryOptions={categoryOptions}
          subCategoryOptions={subCategoryOptions}
        />
      )}

      {deleteModal && (
        <DeleteModal
          reasons={[]}
          title={lang("Delete Keyword / Emotion")}
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
