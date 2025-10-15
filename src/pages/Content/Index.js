import { Row, Col, Card, Table, Button, Input, Tag, Tooltip } from "antd";
import React, { useState, useEffect } from "react";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import ShowTotal from "../../components/ShowTotal";
import useDebounce from "../../hooks/useDebounce";
import { useNavigate } from "react-router";
import apiPath from "../../constants/apiPath";
import ConfirmationBox from "../../components/ConfirmationBox";
import moment from 'moment';
import EditIcon from "../../assets/images/edit.svg";
const Search = Input.Search;

function Index() {

  const sectionName = "Content";
  const routeName = "content";

  const api = {
    status: apiPath.statusContent,
    list: apiPath.listContent
  }

  const [searchText, setSearchText] = useState('');
  const { request } = useRequest()
  const { showConfirm } = ConfirmationBox()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const debouncedSearchText = useDebounce(searchText, 300);
  const navigate = useNavigate();

  const view = (slug) => {
    navigate(`/${routeName}/view/${slug}`)
  }

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, { name }) => {
        return (name ? <span className="cap">{name}</span> : '-');
      },
    },
    {
      title: "Status",
      key: "is_active",
      filters: [
        {
          text: 'Active',
          value: true,
        },
        {
          text: 'Inactive',
          value: false,
        },
      ],
      render: (_, { is_active, _id }) => {
        let color = is_active ? 'green' : 'red';
        return (<a><Tag onClick={(e) => showConfirm({ record: _id, path: api.status, onLoading: () => setLoading(true), onSuccess: () => setRefresh(prev => !prev) })} color={color} key={is_active}>{is_active ? "Active" : "Inactive"}</Tag></a>);
      },
    },
    {
      title: "Created On",
      key: "created_at",
      dataIndex: "created_at",
      render: (_, { created_at }) => {
        return (
          moment(created_at).format('DD-MMM-YYYY')
        );
      },
    },
    {
      title: "Action",
      fixed: 'right',
      render: (_, record) => {
        return (
          <>
            <Tooltip title={"Update " + sectionName} color={"purple"} key={"update" + routeName}><Button href={`/${routeName}/update/` + (record ? record.slug : null)}><img src={EditIcon} /></Button></Tooltip>
            <Tooltip title={"View " + sectionName} color={"purple"} key={"view" + routeName}><Button onClick={() => { view(record.slug) }}><i className="fa fa-light fa-eye"></i></Button></Tooltip>
          </>
        );
      },
    },
  ];

  useEffect(() => {
    setLoading(true)
    fetchData(pagination)
  }, [refresh, debouncedSearchText])


  const fetchData = (pagination, filters) => {
    const filterActive = filters ? filters.is_active : null

    request({
      url: api.list + `?status=${filterActive ? filterActive.join(',') : ''}&page=${pagination ? pagination.current : 1}&limit=${pagination ? pagination.pageSize : 10}&search=${debouncedSearchText}`,
      method: 'GET',
      onSuccess: (data) => {
        setLoading(false)
        setList(data.data.list.docs)
        setPagination(prev => ({ current: pagination.current, total: data.data.list.totalDocs }))
      },
      onError: (error) => {
        console.log(error)
        setLoading(false)
        ShowToast(error, Severty.ERROR)
      }
    })
  }

  const handleChange = (pagination, filters) => {
    console.log(pagination, filters);
    fetchData(pagination, filters);
  }

  const onSearch = (e) => {
    setSearchText(e.target.value)
    setPagination({ current: 1 })
  };

  return (
    <>
      <div className="tabled">
        <Row gutter={[24, 0]}>
          <Col xs={24} xl={24}>
            <Card
              bordered={false}
              className="criclebox tablespace mb-24"
              title={sectionName + " Management"}
              extra={
                <>
                  <Search
                    allowClear
                    size="large"
                    onChange={onSearch}
                    value={searchText}
                    onPressEnter={onSearch}
                    placeholder="Search By name"
                  />
                </>
              }
            >

              <h4 className="text-right mb-1">{pagination.total ? ShowTotal(pagination.total) : ShowTotal(0)}</h4>
              <div className="table-responsive customPagination">
                <Table
                  loading={loading}
                  columns={columns}
                  dataSource={list}
                 pagination={{ defaultPageSize: 10, responsive: true, total: pagination.total, showSizeChanger: true,  pageSizeOptions: ['10', '20', '30', '50'] }}
                  onChange={handleChange}
                  className="ant-border-space"
                />
              </div>

            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Index;
