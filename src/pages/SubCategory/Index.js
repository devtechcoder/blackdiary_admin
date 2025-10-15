import { Button, Image, Input, Switch, Table, Tooltip } from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import notfound from "../../assets/images/not_found.png";
import Plus from "../../assets/images/plus.svg";
import ConfirmationBox from "../../components/ConfirmationBox";
import SectionWrapper from "../../components/SectionWrapper";
import apiPath from "../../constants/apiPath";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";
import AddForm from "./AddForm";
import { AppStateContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
import deleteWhiteIcon from "../../assets/images/icon/deleteWhiteIcon.png";
import DeleteModal from "../../components/DeleteModal";
import EditIcon from "../../assets/images/edit.svg";
import { DownloadExcel } from "../../components/ExcelFile";
import ShowTotal from "../../components/ShowTotal";
function Index() {
  const heading = lang("Sub Category") + " " + lang("Management");
  const { setPageHeading, country } = useContext(AppStateContext);

  const sectionName = "Sub Category";
  const routeName = "sub category";
  const params = useParams();

  const api = {
    status: apiPath.statusSubCategory,
    addEdit: apiPath.listSubCategory,
    list: apiPath.listSubCategory,
    importFile: apiPath.importCategory + "/" + params.type,
    categories: apiPath.common.categories,
  };

  const [searchText, setSearchText] = useState("");
  const { request } = useRequest();
  const [showMessage, setShowMessage] = useState(false);
  const [showStatusMessage, setShowStatusMessage] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [deleteModal, showDeleteModal] = useState(false);
  const [deleteAllModal, showDeleteAllModal] = useState(false);
  const [selected, setSelected] = useState();
  const [selectedIds, setSelectedIds] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const debouncedSearchText = useDebounce(searchText, 300);
  const [exportLoading, setExportLoading] = useState(false);

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedIds(selectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === "Disabled User", // Column configuration not to be checked
      name: record.name,
    }),
  };

  const handleChangeStatus = (id) => {
    request({
      url: api.status + "/" + id,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const onDelete = (id) => {
    request({
      url: api.addEdit + "/" + id,
      method: "DELETE",
      onSuccess: (data) => {
        setLoading(false);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const DeleteAll = () => {
    if (!selectedIds.length) return;
    request({
      url: api.addEdit + "/delete-all",
      method: "POST",
      data: {
        ids: selectedIds,
      },
      onSuccess: (data) => {
        setLoading(false);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);
        ShowToast(error?.response?.data?.message, Severty.ERROR);
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
      title: lang("Sub Category Image"),
      dataIndex: "image",
      key: "image",
      render: (_, { image }) => <Image width={50} src={image ? image : notfound} className="table-img" />,
    },
    {
      title: lang("Category Name"),
      dataIndex: "category",
      key: "category",
      render: (_, { category }) => {
        return category ? <span className="cap">{category?.join(", ")}</span> : "-";
      },
    },
    {
      title: lang("Sub Category Name"),
      dataIndex: "name",
      key: "name",
      render: (_, { name }) => {
        return name ? <span className="cap">{name}</span> : "-";
      },
    },
    {
      title: lang("Category Name Hindi"),
      dataIndex: "hi_name",
      key: "hi_name",
      render: (_, { hi_name }) => {
        return hi_name ? <span className="cap">{hi_name}</span> : "-";
      },
    },
    {
      title: lang("Sort Number"),
      dataIndex: "sort_number",
      key: "sort_number",
      render: (_, { sort_number }) => {
        return sort_number ? <span className="cap">{sort_number}</span> : "-";
      },
    },
    {
      title: lang("Created On"),
      key: "created_at",
      dataIndex: "created_at",
      render: (_, { created_at }) => {
        return moment(created_at).format("DD-MMM-YYYY");
      },
    },
    {
      title: lang("Action"),
      fixed: "right",
      key: "action",
      render: (_, record) => {
        return (
          <div div className="d-flex justify-contenbt-start">
            <Tooltip title={lang("Edit")} color={"purple"} key={"update" + routeName}>
              <Button
                title="Edit"
                className="edit-cls btnStyle primary_btn"
                onClick={() => {
                  setSelected(record);
                  setVisible(true);
                }}
              >
                <img src={EditIcon} />
              </Button>
            </Tooltip>

            <Tooltip title={lang("Delete")} color={"purple"} key={"Delete"}>
              <Button
                title={lang("Delete")}
                className="btnStyle deleteDangerbtn"
                onClick={() => {
                  if (record.have_item) {
                    return setShowMessage(true);
                  }
                  setSelected(record);
                  showDeleteModal(true);
                }}
              >
                <img src={deleteWhiteIcon} />
              </Button>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: lang("Status"),
      key: "is_active",
      dataIndex: "is_active",
      filters: [
        {
          text: "Active",
          value: "true",
        },
        {
          text: "InActive",
          value: "false",
        },
      ],
      render: (_, { _id, is_active, have_active_item }) => {
        return (
          <Switch
            onChange={() => {
              if (have_active_item) {
                return setShowStatusMessage(true);
              }
              handleChangeStatus(_id);
            }}
            checked={is_active}
          />
        );
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    fetchData(pagination);
  }, [refresh, debouncedSearchText, country.country_id]);

  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);

  const fetchData = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;

    request({
      url:
        api.list + `?status=${filterActive ? filterActive.join(",") : ""}&page=${pagination ? pagination.current : 1}&pageSize=${pagination ? pagination.pageSize : 10}&search=${debouncedSearchText}`,
      method: "GET",
      onSuccess: ({ data }) => {
        setLoading(false);
        setList(() => {
          return data.docs.map((item) => {
            return {
              ...item,
              key: item._id,
            };
          });
        });
        setPagination((prev) => ({
          current: pagination.current,
          total: data.totalDocs,
        }));
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);

        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const handleChange = (pagination, filters) => {
    fetchData(pagination, filters);
  };

  const onSearch = (e) => {
    setSearchText(e.target.value);
    // setPagination({ current: 1 });
  };

  const getExportData = async (pagination, filters, sorter) => {
    try {
      const filterActive = filters ? filters.is_active : null;

      setExportLoading(true);
      request({
        url:
          api.list +
          `?status=${filterActive ? filterActive.join(",") : ""}&page=${pagination ? pagination.current : 1}&limit=${pagination ? pagination.pageSize : 100000}&search=${debouncedSearchText}`,
        method: "GET",
        onSuccess: ({ data, status, total, message }) => {
          setExportLoading(false);
          if (status) {
            excelData(data.docs ?? []);
          }
        },
        onError: (error) => {
          console.log(error);
          setExportLoading(false);
          ShowToast(error, Severty.ERROR);
        },
      });
    } catch (err) {
      console.log(err);
      setExportLoading(false);
    }
  };

  const excelData = (exportData) => {
    if (!exportData.length) return;

    const data = exportData.map((row) => ({
      "Category Name": row.category_id.name ? row.category_id.name : "-",
      Name: row?.name || "-",
      "Registered On": moment(row.created_at).format("DD-MM-YYYY"),
    }));
    DownloadExcel(data, sectionName);
  };

  return (
    <>
      <SectionWrapper
        cardHeading={lang(`All Sub Categories`)}
        // cardSubheading={`(${lang('e.g Italian, Mexican, Thai, Chinese, Punjabi')})`}
        extra={
          <>
            {/* <div className="button_group justify-content-end w-100"> */}
            <div className="w-100 text-head_right_cont">
              <div className="pageHeadingSearch">
                <Input.Search className="searchInput" placeholder={lang("Search by Sub Category name")} onChange={onSearch} allowClear />
              </div>

              <div className="btn_grp">
                <Button loading={exportLoading} onClick={() => getExportData()} className="primary_btn btnStyle">
                  {lang("Export")}
                </Button>
              </div>
              <Button
                className="primary_btn btnStyle"
                onClick={(e) => {
                  setVisible(true);
                  setSearchText("");
                }}
              >
                <span className="add-Ic">
                  <img src={Plus} />
                </span>
                {lang("Add New Sub Category")}
              </Button>
            </div>
          </>
        }
      >
        <h4 className="text-right mb-1cont-space cont-space">{pagination.total ? ShowTotal(pagination.total) : ShowTotal(0)}</h4>
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
            onChange={handleChange}
            className="ant-border-space"
          />
        </div>
      </SectionWrapper>

      {visible && (
        <AddForm
          section={sectionName}
          api={api}
          show={visible}
          hide={() => {
            setSelected();
            setVisible(false);
          }}
          data={selected}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}

      {deleteModal && (
        <DeleteModal
          reasons={[]}
          title={lang("Delete Sub Category")}
          subtitle={lang(`Are you sure you want to Delete this Sub category?`)}
          show={deleteModal}
          hide={() => {
            showDeleteModal(false);
            setSelected();
          }}
          onOk={() => onDelete(selected?._id)}
        />
      )}

      {deleteAllModal && (
        <DeleteModal
          title={lang("Delete All Sub Category")}
          subtitle={lang(`Are you sure you want to Delete all Sub category's?`)}
          show={deleteAllModal}
          hide={() => {
            showDeleteAllModal(false);
            setSelectedIds([]);
          }}
          onOk={() => DeleteAll()}
        />
      )}

      {showMessage && (
        <DeleteModal
          title={lang("Delete Sub Category")}
          subtitle={lang("This category contains service, please remove  this service from services  before deleting Sub category")}
          show={showMessage}
          hide={() => {
            setShowMessage(false);
          }}
          onOk={() => setShowMessage(false)}
          reasons={[]}
        />
      )}

      {showStatusMessage && (
        <DeleteModal
          title={lang("Inactive Sub Category")}
          subtitle={lang("This category contains  active service, please inactive services  before deactivating Sub category")}
          show={showStatusMessage}
          hide={() => {
            setShowStatusMessage(false);
          }}
          onOk={() => setShowStatusMessage(false)}
          reasons={[]}
        />
      )}
    </>
  );
}

export default Index;
