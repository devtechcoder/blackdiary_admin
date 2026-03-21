import { Button, Input, Table, Tooltip } from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import Plus from "../../assets/images/plus.svg";
import EditIcon from "../../assets/images/edit.svg";
import deleteWhiteIcon from "../../assets/images/icon/deleteWhiteIcon.png";
import SectionWrapper from "../../components/SectionWrapper";
import apiPath from "../../constants/apiPath";
import { AppStateContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";
import DeleteModal from "../../components/DeleteModal";
import ShowTotal from "../../components/ShowTotal";
import AddForm from "./AddForm";

function Index() {
  const sectionName = "SEO";
  const heading = `${lang(sectionName)} ${lang("Management")}`;
  const { setPageHeading } = useContext(AppStateContext);
  const { request } = useRequest();

  const [searchText, setSearchText] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [deleteModal, showDeleteModal] = useState(false);
  const [selected, setSelected] = useState();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const debouncedSearchText = useDebounce(searchText, 300);

  const api = {
    addEdit: apiPath.listSeo,
    list: apiPath.listSeo,
  };

  const columns = [
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (_, { slug }) => (slug ? <span>{slug}</span> : "-"),
    },
    {
      title: "Primary Title",
      key: "primary_title",
      render: (_, record) => (record?.primary?.title ? <span>{record.primary.title}</span> : "-"),
    },
    {
      title: "Canonical",
      key: "canonical",
      render: (_, record) => (record?.common?.canonical ? <span>{record.common.canonical}</span> : "-"),
    },
    {
      title: "Updated On",
      key: "updatedAt",
      dataIndex: "updatedAt",
      render: (_, { updatedAt }) => (updatedAt ? moment(updatedAt).format("DD-MMM-YYYY") : "-"),
    },
    {
      title: "Action",
      fixed: "right",
      key: "action",
      render: (_, record) => {
        return (
          <div className="d-flex justify-contenbt-start">
            <Tooltip title={lang("Edit")} color={"purple"}>
              <Button
                className="edit-cls btnStyle primary_btn"
                onClick={() => {
                  setSelected(record);
                  setVisible(true);
                }}
              >
                <img src={EditIcon} />
              </Button>
            </Tooltip>

            <Tooltip title={lang("Delete")} color={"purple"}>
              <Button
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
    setPageHeading(heading);
  }, [setPageHeading]);

  useEffect(() => {
    setLoading(true);
    fetchData(pagination);
  }, [refresh, debouncedSearchText]);

  const fetchData = (paginationArg) => {
    request({
      url: `${api.list}?page=${paginationArg?.current || 1}&pageSize=${paginationArg?.pageSize || 10}&search=${debouncedSearchText}`,
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
          current: paginationArg?.current || 1,
          pageSize: paginationArg?.pageSize || 10,
          total: data?.totalDocs || 0,
        }));
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error?.response?.data?.message || "Something went wrong", Severty.ERROR);
      },
    });
  };

  const onDelete = (id) => {
    request({
      url: `${api.addEdit}/${id}`,
      method: "DELETE",
      onSuccess: (data) => {
        if (data?.status) {
          ShowToast(data?.message, Severty.SUCCESS);
          setRefresh((prev) => !prev);
        }
      },
      onError: (error) => {
        ShowToast(error?.response?.data?.message || "Something went wrong", Severty.ERROR);
      },
    });
  };

  const handleChange = (paginationArg) => {
    fetchData(paginationArg);
  };

  return (
    <>
      <SectionWrapper
        cardHeading={lang(`All ${sectionName}`)}
        extra={
          <div className="w-100 text-head_right_cont">
            <div className="pageHeadingSearch">
              <Input.Search className="searchInput" placeholder={lang("Search by keyword")} onChange={(e) => setSearchText(e.target.value)} allowClear />
            </div>
            <Button
              className="primary_btn btnStyle"
              onClick={() => {
                setSelected();
                setVisible(true);
              }}
            >
              <span className="add-Ic">
                <img src={Plus} />
              </span>
              {lang(`Add New ${sectionName}`)}
            </Button>
          </div>
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
