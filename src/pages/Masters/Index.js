import { Button, Image, Input, Switch, Table, Tooltip, Select } from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
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
import DeleteModal from "../../components/DeleteModal";
import EditIcon from "../../assets/images/edit.svg";
import { DownloadExcel } from "../../components/ExcelFile";
import ShowTotal from "../../components/ShowTotal";
import { useParams } from "react-router";
import { masterSubMenu } from "../../components/layout/Sidenav";
import deleteWhiteIcon from "../../assets/images/icon/deleteWhiteIcon.png";

function Index() {
  const params = useParams();
  const { slug } = params;
  const sectionName = masterSubMenu[slug] || "Masters";
  const { setPageHeading, country } = useContext(AppStateContext);
  const heading = lang(sectionName) + " " + lang("Management");

  const api = {
    addEdit: apiPath.addEditMasters,
    list: apiPath.listMasters,
  };

  const [searchText, setSearchText] = useState("");
  const { request } = useRequest();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [deleteModal, showDeleteModal] = useState(false);
  const [selected, setSelected] = useState();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const debouncedSearchText = useDebounce(searchText, 300);
  const [exportLoading, setExportLoading] = useState(false);

  const [filter, setFilter] = useState({});

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

  const columns = [
    {
      title: lang("Title"),
      dataIndex: "title",
      key: "title",
      render: (_, { title }) => {
        return title ? <span className="cap">{title}</span> : "-";
      },
    },
    {
      title: lang("Sub-Title"),
      dataIndex: "sub_title",
      key: "sub_title",
      render: (_, { sub_title }) => {
        return sub_title ? <span className="cap">{sub_title}</span> : "-";
      },
    },
    {
      title: lang("Priority"),
      dataIndex: "priority",
      key: "priority",
      render: (_, { priority }) => {
        return priority ? <span className="cap">{priority}</span> : "-";
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
            <Tooltip title={lang("Edit")} color={"purple"} key={"update" + sectionName}>
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
  ];

  useEffect(() => {
    setLoading(true);
    fetchData(pagination);
  }, [refresh, debouncedSearchText, filter, slug]);

  useEffect(() => {
    setPageHeading(heading);
  }, [setPageHeading, slug]);

  const fetchData = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;
    const queryString = Object.entries(filter)
      .filter(([_, v]) => v != undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");
    request({
      url:
        api.list +
        `?slug=${slug ? slug : ""}&status=${filterActive ? filterActive.join(",") : ""}&page=${pagination ? pagination.current : 1}&pageSize=${pagination ? pagination.pageSize : 10}&search=${debouncedSearchText}${
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
          `?slug=${slug ? slug : ""}&status=${filterActive ? filterActive.join(",") : ""}&page=${pagination ? pagination.current : 1}&pageSize=${pagination ? pagination.pageSize : 10000}&search=${debouncedSearchText}${
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
      Slug: row?.slug || "-",
      Description: row?.description || "-",
      "Registered On": moment(row.created_at).format("DD-MM-YYYY"),
    }));
    DownloadExcel(data, sectionName);
  };

  return (
    <>
      <SectionWrapper
        cardHeading={lang(`All ${sectionName}`)}
        extra={
          <>
            <div className="w-100 text-head_right_cont">
              <div className="pageHeadingSearch">
                <Input.Search className="searchInput" placeholder={lang("Search by keyword")} onChange={onSearch} allowClear />
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
                {lang(`Add New ${sectionName}`)}
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
          sectionName={sectionName}
          api={api}
          show={visible}
          hide={() => {
            setSelected();
            setVisible(false);
          }}
          data={selected}
          slug={slug}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}

      {deleteModal && (
        <DeleteModal
          reasons={[]}
          title={lang(`Delete ${sectionName}`)}
          subtitle={lang(`Are you sure you want to Delete this ${sectionName}?`)}
          show={deleteModal}
          hide={() => {
            showDeleteModal(false);
            setSelected();
          }}
          onOk={() => onDelete(selected?._id)}
        />
      )}
    </>
  );
}

export default Index;
