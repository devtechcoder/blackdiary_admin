import { Card, Col, Row, Tabs } from "antd";
import React, { useContext, useEffect, useState } from "react";

import { AppStateContext } from "../../context/AppContext";
import useRequest from "../../hooks/useRequest";
import PostList from "./post";
import ShayariList from "./shayari";
import lang from "../../helper/langHelper";

const { TabPane } = Tabs;

const cmsTabs = {
  SHAYARI: lang("Shayaries"),
  POST: lang("Posts"),
};

function Index() {
  const { setPageHeading } = useContext(AppStateContext);
  const [selectedTab, setSelectedTab] = useState(cmsTabs.SHAYARI);

  const handleTabChange = (status) => {
    setSelectedTab(status);
  };

  useEffect(() => {
    setPageHeading(lang("Feed Management"));
  }, []);

  return (
    <>
      <div className="tabled quoteManagement">
        <Row gutter={[24, 0]}>
          <Col xs={24} xl={24}>
            <Card bordered={false} className="criclebox tablespace mb-24">
              <Tabs className="main_tabs" onTabClick={handleTabChange} activeKey={selectedTab} tabBarStyle={{ color: "green" }}>
                <TabPane tab={cmsTabs.SHAYARI} key={cmsTabs.SHAYARI}>
                  <div className="cms-bodycontent">
                    <ShayariList />
                  </div>
                </TabPane>

                <TabPane tab={cmsTabs.POST} key={cmsTabs.POST}>
                  <PostList />
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Index;
