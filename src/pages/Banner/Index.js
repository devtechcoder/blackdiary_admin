import { Button, Image, Table, Tag, Tooltip, Select, Input, Switch } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EditIcon from "../../assets/images/edit.svg";
import deleteWhiteIcon from "../../assets/images/icon/deleteWhiteIcon.png";
import notfound from "../../assets/images/not_found.png";
import Plus from "../../assets/images/plus.svg";
import DeleteModal from "../../components/DeleteModal";
import SectionWrapper from "../../components/SectionWrapper";
import apiPath from "../../constants/apiPath";
import { DeleteBanner } from "../../constants/var";
import { useAppContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import AddForm from "./AddBanner";
import ConfirmationBox from "../../components/ConfirmationBox";
import { UndoOutlined } from "@ant-design/icons";
import { Months } from "../../constants/var";
import useDebounce from "../../hooks/useDebounce";

const BannerManager = ({ sectionName }) => {
  const { country } = useAppContext();
  const [pagination, setPagination] = useState({
    current: 1,
    total: 10,
  });

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const { showConfirm } = ConfirmationBox();
  const [selectedAddBanner, setSelectedAddBanner] = useState();
  const [visible, setVisible] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selected, setSelected] = useState();
  const [showStatus, setShowStatus] = useState(false);
  const { request } = useRequest();
  const debouncedSearchText = useDebounce(searchText, 300);
  const [months, setMonths] = useState([]);
  const [years, setYears] = useState([]);

  const urlParams = new URLSearchParams(window.location.search);
  const year = urlParams.get("year");
  const [cities, setCities] = useState([]);
  const [showStatusMessage, setShowStatusMessage] = useState(false);

  const [filter, setFilter] = useState({ position: undefined });

  const api = {
    status: apiPath.statusBanner,
  };

  const handleChange = (pagination, filters) => {
    fetchData(pagination, filters);
  };

  const onDelete = (record) => {
    request({
      url: apiPath.banner + "/" + record?._id,
      method: "DELETE",
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
        } else {
          ShowToast(data.message, Severty.ERROR);
        }

        fetchData(pagination);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const queryString = Object.entries(filter)
    .filter(([_, v]) => v)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  const fetchData = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;
    request({
      url:
        apiPath.banner +
        `?status=${filterActive ? filterActive.join(",") : ""}&page=${pagination ? pagination.current : 1}&pageSize=${
          pagination && pagination?.total ? pagination?.total : 10
        }&search=${debouncedSearchText}${queryString ? `&${queryString}` : ""}`,
      method: "GET",
      onSuccess: (data) => {
        setList(data.data);
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  const columns = [
    {
      title: lang("Banner"),
      dataIndex: "image",
      key: "image",
      render: (_, { image }) => <Image width={50} src={image ? image : notfound} className="table-img" />,
    },

    {
      title: lang("Start Date"),
      dataIndex: "start_date",
      key: "start_date",
      render: (_, { start_date }) => {
        return moment(start_date).format("DD-MMM-YYYY");
      },
    },
    {
      title: lang("End Date"),
      dataIndex: "end_date",
      key: "end_date",
      render: (_, { end_date }) => {
        return moment(end_date).format("DD-MMM-YYYY");
      },
    },

    {
      title: lang("Banner Position"),
      dataIndex: "banner_position",
      key: "banner_position",
      render: (_, { position }) => {
        return position ? <span className="cap">{position}</span> : "-";
      },
    },

    // {
    //   title: lang("Status"),
    //   key: "is_active",
    //   // filters: [
    //   //   {
    //   //     text: "Active",
    //   //     value: true,
    //   //   },
    //   //   {
    //   //     text: "Inactive",
    //   //     value: false,
    //   //   },
    //   // ],
    //   render: (_, { is_active, _id }) => {
    //     let color = is_active ? "green" : "red";
    //     return (
    //       <a>
    //         <Tag
    //           // onClick={(e) =>
    //           //   showConfirm({
    //           //     record: _id,
    //           //     path: api.status + "/status",
    //           //     onLoading: () => setLoading(true),
    //           //     onSuccess: () => setRefresh((prev) => !prev),
    //           //   })
    //           // }
    //           color={color}
    //           key={is_active}
    //         >
    //           {is_active ? "Active" : "Inactive"}
    //         </Tag>
    //       </a>
    //     );
    //   },
    // },
    {
      title: lang("Action"),
      fixed: "right",
      key: "action",
      render: (_, record) => {
        return (
          <div div className="d-flex justify-contenbt-start">
            <Tooltip title={lang("Edit")} color={"purple"} key={"update"}>
              <Button
                title={lang("Edit")}
                className="edit-cls btnStyle primary_btn"
                onClick={() => {
                  setSelectedAddBanner(record);
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
                onClick={(e) => {
                  setSelectedAddBanner(record);
                  setShowDelete(true);
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
    fetchData(pagination);
  }, [refresh, country.country_id, filter, debouncedSearchText]);

  const handleChangeStatus = (id, message) => {
    request({
      url: api.status + "/" + id,
      method: "PUT",
      data: { message },
      onSuccess: (data) => {
        ShowToast(data.message, Severty.SUCCESS);
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

  const onChange = (key, value) => {
    if (key == "country_id") {
      setCities([]);
      setFilter((prev) => ({ ...prev, city_id: undefined, country_id: value }));
    } else {
      setFilter((prev) => ({ ...prev, [key]: value }));
    }
  };

  const onSearch = (e) => {
    setSearchText(e.target.value);
  };

  return (
    <>
      <SectionWrapper
        cardHeading={lang("Banner Manager")}
        extra={
          <>
            <div className="w-100 text-head_right_cont">
              {/* <div className="pageHeadingSearch">
                <Input.Search
                  className="searchInput"
                  placeholder={lang("Search by Banner for, Company name")}
                  onChange={onSearch}
                  allowClear
                />
              </div> */}
              <div className="role-wrap">
                <Select
                  width="110px"
                  placeholder={lang("Banner Position")}
                  showSearch
                  value={filter.position}
                  filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  options={[
                    {
                      value: "top",
                      label: "Top Banner",
                    },
                    {
                      value: "bottom",
                      label: "Bottom Banner",
                    },
                  ]}
                  onChange={(value) => onChange("position", value)}
                />
              </div>
              <Button onClick={() => setFilter({ search: undefined })} type="primary" icon={<UndoOutlined />}>
                {lang("Reset")}
              </Button>

              <Button
                className="primary_btn btnStyle"
                onClick={(e) => {
                  setVisible(true);
                }}
              >
                <span className="add-Ic">
                  <img src={Plus} />
                </span>
                {lang("Add Banner")}
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
          type={sectionName}
          sectionName={sectionName}
          show={visible}
          hide={() => {
            setSelectedAddBanner();
            setVisible(false);
          }}
          ant-btn-default
          data={selectedAddBanner}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}

      {showDelete && (
        <DeleteModal
          title={lang("Delete Banner")}
          subtitle={lang(`Are you sure you want to Delete this Banner?`)}
          show={showDelete}
          hide={() => {
            setShowDelete(false);
            setSelectedAddBanner();
          }}
          reasons={DeleteBanner}
          onOk={() => onDelete(selectedAddBanner)}
        />
      )}

      {/* {showStatus && (
        <DeleteModal
          title={`${selected?.is_active ? `Block` : `UnBlock`} User`}
          subtitle={`Are you sure you want to ${selected?.is_active ? `block` : `unblock`
            } this user?`}
          show={showStatus}
          hide={() => {
            setShowStatus(false);
            setSelected();
          }}
          onOk={() => handleChangeStatus(selected?._id)}
        />
      )} */}
    </>
  );
};

export default BannerManager;
