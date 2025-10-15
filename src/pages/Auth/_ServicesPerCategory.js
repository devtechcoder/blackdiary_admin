import { Row, DatePicker ,Col,Card,Table } from "antd";

import React, { useState, useEffect } from "react";

import moment from "moment";
import lang from "../../helper/langHelper";
const { RangePicker } = DatePicker;

function Index({ data, loading }) {
  const [list, setList] = useState(data);
  const [pagination, setPagination] = useState(5);

  useEffect(() => {
    if (!data) return;
    setList(data);
    setPagination(data?.length);
    console.log("data ::", data);
  }, [data]);

  const columns = [
    {
      title: lang("Category Name"),
      dataIndex: "name",
      key: "name",
      render: (_, { name }) => {
        return name ? (
          <span className="cap">{name}</span>
        ) : (
          "-"
        );
      },
    },
    {
      title: lang("Number of Images Per Service"),
      key: "number_of_images_per_service",
      dataIndex: "number_of_images_per_service",
      render: (_, { number_of_images_per_service }) => {
        return number_of_images_per_service ? (
          <span className="cap">{number_of_images_per_service}</span>
        ) : (
          "-"
        );
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
                    defaultPageSize: 10,
                    responsive: true,
                    total: pagination,
                    // showSizeChanger: true,
                    // pageSizeOptions: ["10", "20", "30", "50"],
                  }}
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
