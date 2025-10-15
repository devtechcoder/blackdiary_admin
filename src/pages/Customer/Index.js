import { Button, Image, Input, Switch, Table, Tooltip, Select } from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import notfound from "../../assets/images/not_found.png";
import Plus from "../../assets/images/plus.svg";
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
  const heading = lang("Customer") + " " + lang("Management");
  const { setPageHeading, country } = useContext(AppStateContext);

  const sectionName = "Customer";
  const routeName = "customer";
  const params = useParams();

  const api = {
    status: apiPath.listCustomer + "/status",
    addEdit: apiPath.listCustomer,
    list: apiPath.listCustomer,
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

  const [filter, setFilter] = useState({
    country_id: undefined,
    city_id: undefined,
    start_date: undefined,
    end_date: undefined,
    status: undefined,
  });

  const handleChangeStatus = (id) => {
    request({
      url: api.status + "/" + id,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setRefresh((prev) => !prev);
        ShowToast(data.message, Severty.SUCCESS);
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
        ShowToast(data.message, Severty.SUCCESS);
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
      title: lang("Profile"),
      dataIndex: "image",
      key: "image",
      render: (_, { image }) => <Image width={50} src={image ? image : notfound} className="table-img" />,
    },
    {
      title: lang("User Name"),
      dataIndex: "user_name",
      key: "user_name",
      render: (_, { user_name }) => {
        return user_name ? <span classuser_name="cap">{user_name}</span> : "-";
      },
    },
    {
      title: lang("Name"),
      dataIndex: "name",
      key: "name",
      render: (_, { name }) => {
        return name ? <span className="cap">{name}</span> : "-";
      },
    },
    {
      title: lang("Email"),
      dataIndex: "email",
      key: "email",
      render: (_, { email }) => {
        return email ? <span className="cap">{email}</span> : "-";
      },
    },
    {
      title: lang("Mobile Number"),
      dataIndex: "mobile_number",
      key: "mobile_number",
      render: (_, { mobile_number, country_code }) => {
        return mobile_number ? <span className="cap">{`+${country_code ? country_code : 91}-${mobile_number}`}</span> : "-";
      },
    },
    {
      title: lang("Dob"),
      dataIndex: "dob",
      key: "dob",
      render: (_, { dob }) => {
        return dob ? <span className="cap">{dob}</span> : "-";
      },
    },
    {
      title: lang("Gender"),
      dataIndex: "gender",
      key: "gender",
      render: (_, { gender }) => {
        return gender ? <span className="cap">{gender}</span> : "-";
      },
    },
    {
      title: lang("Added By"),
      dataIndex: "added_by",
      key: "added_by",
      render: (_, { added_by }) => {
        return added_by ? <span className="cap">{added_by}</span> : "-";
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
  }, [refresh, debouncedSearchText, country.country_id, filter]);

  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading]);

  const fetchData = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;
    const queryString = Object.entries(filter)
      .filter(([_, v]) => v != undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");
    request({
      url:
        api.list +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${pagination ? pagination.current : 1}&pageSize=${pagination ? pagination.pageSize : 10}&search=${debouncedSearchText}${
          queryString ? `&${queryString}` : ""
        }`,
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
  };

  const getExportData = async (pagination, filters, sorter) => {
    try {
      const filterActive = filters ? filters.is_active : null;
      const queryString = Object.entries(filter)
        .filter(([_, v]) => v != undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("&");
      setExportLoading(true);
      request({
        url:
          api.list +
          `?status=${filterActive ? filterActive.join(",") : ""}&page=${pagination ? pagination.current : 1}&limit=${pagination ? pagination.pageSize : 10000}&search=${debouncedSearchText}${
            queryString ? `&${queryString}` : ""
          }`,
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
      Name: row?.name || "-",
      "Number of images gallary": row.number_of_images_gallary ? row.number_of_images_gallary : "-",
      "Number of images per service": row.number_of_images_per_service ? row.number_of_images_per_service : "-",
      "Number of videos gallery": row.number_of_videos_gallery ? row.number_of_videos_gallery : "-",
      "Number of service": row.number_of_images_gallary ? row.number_of_service : "-",
      "Number of highlights": row.number_of_highlights ? row.number_of_highlights : "-",
      "Registered On": moment(row.created_at).format("DD-MM-YYYY"),
    }));
    DownloadExcel(data, sectionName);
  };

  return (
    <>
      <SectionWrapper
        cardHeading={lang(`All Customers`)}
        extra={
          <>
            <div className="w-100 text-head_right_cont">
              <div className="pageHeadingSearch">
                <Input.Search className="searchInput" placeholder={lang("Search customer")} onChange={onSearch} allowClear />
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
                {lang("Add New User")}
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
          title={lang("Delete Category")}
          subtitle={lang(`Are you sure you want to Delete this category?`)}
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
          title={lang("Delete All Category")}
          subtitle={lang(`Are you sure you want to Delete all category's?`)}
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
          title={lang("Delete Category")}
          subtitle={lang("This category contains Sub-Category, please remove  this sub category from sub category before deleting category")}
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
          title={lang("Inactive Category")}
          subtitle={lang("This category contains  active Sub-Category, please inactive sub category before deactivating  category")}
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
