import { Button, Input, Switch, Table, Tooltip } from "antd";
import moment from "moment";
import React, { useContext, useEffect, useRef, useState } from "react";

import deleteWhiteIcon from "../../assets/images/icon/deleteWhiteIcon.png";
import EditIcon from "../../assets/images/edit.svg";
import Plus from "../../assets/images/plus.svg";
import DeleteModal from "../../components/DeleteModal";
import SectionWrapper from "../../components/SectionWrapper";
import { AppStateContext } from "../../context/AppContext";
import apiPath from "../../constants/apiPath";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";
import ShowTotal from "../../components/ShowTotal";
import AddForm from "./AddForm";

const stripHtml = (value = "") => value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

function Index() {
  const heading = `${lang("FAQ")} ${lang("Management")}`;
  const { setPageHeading } = useContext(AppStateContext);
  const { request } = useRequest();
  const requestRef = useRef(request);

  const api = {
    status: apiPath.statusFaq,
    addEdit: apiPath.listFaq,
    list: apiPath.listFaq,
  };

  const [searchText, setSearchText] = useState("");
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

  const fetchData = (pageConfig = pagination, filters) => {
    const filterActive = filters ? filters.is_active : null;

    setLoading(true);
    requestRef.current({
      url: `${api.list}?status=${filterActive ? filterActive.join(",") : ""}&page=${pageConfig?.current || 1}&pageSize=${pageConfig?.pageSize || 10}&search=${debouncedSearchText}`,
      method: "GET",
      onSuccess: ({ data }) => {
        setLoading(false);
        setList(
          (data?.docs || []).map((item) => ({
            ...item,
            key: item._id,
          }))
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
        ShowToast(error?.response?.data?.message || error?.message, Severty.ERROR);
      },
    });
  };

  useEffect(() => {
    setPageHeading(heading);
  }, [heading, setPageHeading]);

  useEffect(() => {
    fetchData({ current: 1, pageSize: pagination.pageSize });
  }, [refresh, debouncedSearchText]);

  const handleChangeStatus = (id) => {
    requestRef.current({
      url: `${api.status}/${id}`,
      method: "PATCH",
      onSuccess: (response) => {
        ShowToast(response.message, Severty.SUCCESS);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        ShowToast(error?.response?.data?.message || error?.message, Severty.ERROR);
      },
    });
  };

  const onDelete = (id) => {
    requestRef.current({
      url: `${api.addEdit}/${id}`,
      method: "DELETE",
      onSuccess: (response) => {
        ShowToast(response.message, Severty.SUCCESS);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        ShowToast(error?.response?.data?.message || error?.message, Severty.ERROR);
      },
    });
  };

  const columns = [
    {
      title: lang("Question"),
      dataIndex: "question",
      key: "question",
      render: (_, { question }) => <span className="cap">{question || "-"}</span>,
    },
    {
      title: lang("Answer"),
      dataIndex: "answer",
      key: "answer",
      render: (_, { answer }) => {
        const preview = stripHtml(answer);
        return (
          <span
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              whiteSpace: "normal",
              maxWidth: 420,
            }}
          >
            {preview || "-"}
          </span>
        );
      },
    },
    {
      title: lang("Priority"),
      dataIndex: "priority",
      key: "priority",
      render: (_, { priority }) => <span className="cap">{priority || 1}</span>,
    },
    {
      title: lang("Created On"),
      key: "created_at",
      dataIndex: "created_at",
      render: (_, { created_at }) => (created_at ? moment(created_at).format("DD-MMM-YYYY") : "-"),
    },
    {
      title: lang("Action"),
      key: "action",
      render: (_, record) => (
        <div className="d-flex justify-contenbt-start">
          <Tooltip title={lang("Edit")} color={"purple"} key={`edit-faq-${record?._id}`}>
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

          <Tooltip title={lang("Delete")} color={"purple"} key={`delete-faq-${record?._id}`}>
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
      render: (_, { _id, is_active }) => <Switch checked={is_active} onChange={() => handleChangeStatus(_id)} />,
    },
  ];

  return (
    <>
      <SectionWrapper
        cardHeading={lang("All FAQs")}
        extra={
          <div className="w-100 text-head_right_cont">
            <div className="pageHeadingSearch">
              <Input.Search className="searchInput" placeholder={lang("Search by question")} onChange={(e) => setSearchText(e.target.value)} allowClear />
            </div>

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
              {lang("Add New FAQ")}
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
            onChange={(nextPagination, filters) => fetchData(nextPagination, filters)}
            className="ant-border-space"
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
        />
      )}

      {deleteModal && (
        <DeleteModal
          reasons={[]}
          title={lang("Delete FAQ")}
          subtitle={lang("Are you sure you want to delete this FAQ?")}
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
