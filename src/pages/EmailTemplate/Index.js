import { Button, Input, Table, Tooltip } from "antd";
import React, { useCallback, useContext, useEffect, useState } from "react";

import DeleteModal from "../../components/DeleteModal";
import EditIcon from "../../assets/images/edit.svg";
import deleteWhiteIcon from "../../assets/images/icon/deleteWhiteIcon.png";
import Plus from "../../assets/images/plus.svg";
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
  const sectionName = "Email Template";
  const heading = `${lang(sectionName)} ${lang("Management")}`;
  const { setPageHeading } = useContext(AppStateContext);
  const { request } = useRequest();

  const api = {
    addEdit: apiPath.addEditEmailTemplate,
    list: apiPath.listEmailTemplate,
    delete: apiPath.deleteEmailTemplate,
  };

  const [searchText, setSearchText] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [deleteModal, showDeleteModal] = useState(false);
  const [selected, setSelected] = useState();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const debouncedSearchText = useDebounce(searchText, 300);

  const fetchData = useCallback(
    (pageConfig = { current: 1, pageSize: 10 }, filters) => {
      const filterActive = filters ? filters.is_active : null;
      setLoading(true);

      request({
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
          ShowToast(error?.response?.data?.message || error?.message || "Failed to load email templates", Severty.ERROR);
        },
      });
    },
    [api.list, debouncedSearchText, request]
  );

  useEffect(() => {
    setPageHeading(heading);
  }, [heading, setPageHeading]);

  useEffect(() => {
    fetchData({ current: 1, pageSize: pagination.pageSize });
  }, [debouncedSearchText, fetchData, pagination.pageSize, refresh]);

  const onDelete = (id) => {
    request({
      url: `${api.delete}/${id}`,
      method: "DELETE",
      onSuccess: (response) => {
        ShowToast(response.message, Severty.SUCCESS);
        setRefresh((prev) => !prev);
      },
      onError: (error) => {
        ShowToast(error?.response?.data?.message || error?.message || "Failed to delete email template", Severty.ERROR);
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
      render: (_, { slug }) => <span className="cap">{slug || "-"}</span>,
    },
    {
      title: lang("Subject"),
      dataIndex: "subject",
      key: "subject",
      render: (_, { subject }) => <span className="cap">{subject || "-"}</span>,
    },
    {
      title: lang("Action"),
      key: "action",
      render: (_, record) => (
        <div className="d-flex justify-contenbt-start">
          <Tooltip title={lang("Edit")} color={"purple"} key={`edit-email-template-${record?._id}`}>
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

          <Tooltip title={lang("Delete")} color={"purple"} key={`delete-email-template-${record?._id}`}>
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

  return (
    <>
      <SectionWrapper
        cardHeading={heading}
        extra={
          <div className="w-100 text-head_right_cont">
            <div className="pageHeadingSearch">
              <Input.Search className="searchInput" placeholder={lang("Search by name or slug")} onChange={(e) => setSearchText(e.target.value)} allowClear />
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
              {lang("Add New Email Template")}
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
          title={lang("Delete Email Template")}
          subtitle={lang("Are you sure you want to delete this email template?")}
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
