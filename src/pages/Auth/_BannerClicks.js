import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Tag,
  Image,
  Tooltip,
  Select,
  DatePicker,
  Input,
} from "antd";
import apiPath from "../../constants/apiPath";
import React, { useState, useEffect } from "react";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import ShowTotal from "../../components/ShowTotal";
import ConfirmationBox from "../../components/ConfirmationBox";
import SingleImageUpload from "../../components/SingleImageUpload";
import notfound from "../../assets/images/not_found.png";
import EditIcon from "../../assets/images/edit.svg";
import { bannerType } from "../../constants/conts";
import moment from "moment";
import lang from "../../helper/langHelper";

const { RangePicker } = DatePicker;

function BannerClicks({data ,loading}) {
  const sectionName = "Banner";
  const routeName = "banner";

  const [list, setList] = useState(data);
  const [pagination, setPagination] = useState(5);


  useEffect(()=>{
    if(!data) return;
    setList(data)
    setPagination(data?.length)
    console.log("data ::", data)
  },[data])

  const columns = [
    {
      title: lang("Banner"),
      dataIndex: "image",
      key: "image",
      render: (_, { image }) => (
        <Image
          width={50}
          src={image ? image : notfound}
          className="table-img"
        />
      ),
    },
 

    {
      title: lang("Banner Position"),
      dataIndex: "banner_position",
      key: "banner_position",
      render: (_, { position }) => {
        return position ? <span className="cap">{position}</span> : "-";
      },
    },
    {
      title: lang("Banner Click's"),
      dataIndex: "count",
      key: "count",
      render: (_, { count }) => {
        return count ? <span className="cap">{count }</span> : "0";
        
      }
    },
    {
      title: lang("Start Date"),
      dataIndex: "start_date",
      key: "start_date",
      render: (_, { start_date }) => {
        return moment(start_date).format("DD-MM-YYYY");
      },
    },
    {
      title: lang("End Date"),
      dataIndex: "end_date",
      key: "end_date",
      render: (_, { end_date }) => {
        return moment(end_date).format("DD-MM-YYYY");
      },
    },

   
  ];


  return (
    <>
      <div className="tabled bannerMain">
        <Row gutter={[24, 0]}>
          <Col xs={24} xl={24}>
            <Card bordered={false} className="criclebox tablespace mb-24">
              <div className="table-responsive customPagination">
                <Table
                  loading={loading}
                  columns={columns}
                  dataSource={list}
                  pagination={{
                    defaultPageSize: 5,
                    responsive: true,
                    total: pagination,
                    // showSizeChanger: true,
                    // pageSizeOptions: ["10", "20", "30", "50"],
                  }}
                  // onChange={handleChange}
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



export default BannerClicks;
