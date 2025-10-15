import { Card, Col, Row, Tabs } from "antd";
import React, { useContext, useEffect, useState } from "react";

import { AppStateContext } from "../../context/AppContext";
import useRequest from "../../hooks/useRequest";
import { ContentManagerForm } from "./ContentManagerForm";
import BannerManager from "./_BannerManager";
import lang from "../../helper/langHelper";

const { TabPane } = Tabs;

const cmsTabs = {
  BANNER: lang("App Banner Management"),
  CONTENT: lang("Page Content Management"),
  ADD: lang("Banner Management"),
};

function Index() {
  const { setPageHeading } = useContext(AppStateContext);

  const { request } = useRequest();

  const [selectedTab, setSelectedTab] = useState(cmsTabs.CONTENT);

  const handleTabChange = (status) => {
    setSelectedTab(status);
  };

  useEffect(() => {
    setPageHeading(lang("CMS Management"));
  }, []);

  return (
    <>
      <div className="tabled quoteManagement">
        <Row gutter={[24, 0]}>
          <Col xs={24} xl={24}>
            <Card bordered={false} className="criclebox tablespace mb-24">
              <Tabs
                className="main_tabs"
                onTabClick={handleTabChange}
                activeKey={selectedTab}
                tabBarStyle={{ color: "green" }}
              >
                {/* <TabPane tab={cmsTabs.BANNER} key={cmsTabs.BANNER}>
                  <div style={{ padding: "40px" }}></div>
                </TabPane> */}

                <TabPane tab={cmsTabs.CONTENT} key={cmsTabs.CONTENT}>
                  <div className="cms-bodycontent">
                    <ContentManagerForm />
                  </div>
                </TabPane>

                <TabPane tab={cmsTabs.ADD} key={cmsTabs.ADD}>
                  <BannerManager />
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
