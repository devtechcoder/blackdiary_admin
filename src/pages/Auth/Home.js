import {
  Card,
  Col,
  Progress,
  Radio,
  Row,
  Select,
  Skeleton,
  Tabs,
  Typography,
  Descriptions,
  Table,
} from "antd";
import React, { useContext, useEffect, useState } from "react";
import apiPath from "../../constants/apiPath";
import { AppStateContext } from "../../context/AppContext";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import { useNavigate } from "react-router";
import { useAuthContext } from "../../context/AuthContext";
import { formatPhone } from "../../helper/functions";
import lang from "../../helper/langHelper";
import SectionWrapper from "../../components/SectionWrapper";

import ServicesPerCategory from "./_ServicesPerCategory";
import BannerClicks from "./_BannerClicks";
import moment from "moment";
import MonthlyChartSection from "./_MonthlyChartSection";
import QuarterlyChartSection from "./_QuartlyChartSection";
import WeeklyChartSection from "./_WeeklyChartSection";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const years = [2024];

function Home() {
  const { setPageHeading, country } = useContext(AppStateContext);

  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(years[0]);
  const [filter, setFilter] = useState("State");
  const { userProfile, isAdmin } = useAuthContext();
  const [dashboard, setDashboard] = useState();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 3,
    total: 0,
  });

  const count = [
    {
      today: "Number of Students",
      title: `${dashboard && dashboard ? dashboard.totalCustomer : 0}`,
      persent: "10%",
      icon: <i class="fas fa-user-friends"></i>,
      bnb: "bnb2",
      url: "/customer",
      key: "totalCustomer",
      _7Day: dashboard && (dashboard.user7 ?? 0),
      _14Day: dashboard && (dashboard.user14 ?? 0),
    },
    {
      today: "Number of Active Students",
      title: `${
        dashboard && dashboard.activeCustomer ? dashboard.activeCustomer : 0
      }`,
      icon: <i class="fas fa-people-carry"></i>,
      bnb: "bnb2",
      url: `/customer?status=${true}`,
      key: "activeCustomer",
      _7Day: dashboard && (dashboard.activeUser7 ?? 0),
      _14Day: dashboard && (dashboard.activeUser14 ?? 0),
    },
    {
      today: "Number of Teachers",
      title: `${dashboard && dashboard ? dashboard.totalCustomer : 0}`,
      persent: "10%",
      icon: <i class="fas fa-user-friends"></i>,
      bnb: "bnb2",
      url: "/customer",
      key: "totalCustomer",
      _7Day: dashboard && (dashboard.user7 ?? 0),
      _14Day: dashboard && (dashboard.user14 ?? 0),
    },
    {
      today: "Number of Active Teachers",
      title: `${
        dashboard && dashboard.activeCustomer ? dashboard.activeCustomer : 0
      }`,
      icon: <i class="fas fa-people-carry"></i>,
      bnb: "bnb2",
      url: `/customer?status=${true}`,
      key: "activeCustomer",
      _7Day: dashboard && (dashboard.activeUser7 ?? 0),
      _14Day: dashboard && (dashboard.activeUser14 ?? 0),
    },

    {
      today: "Number of Quotation",
      title: `${dashboard && dashboard.totalSales ? dashboard.totalSales : 0}`,
      icon: <i class="fas fa-copyright"></i>,
      bnb: "bnb2",
      url: "/quotation-request",
      key: "totalRestaurant",
      _7Day: dashboard && (dashboard.restaurant7 ?? 0),
      _14Day: dashboard && (dashboard.restaurant14 ?? 0),
    },
    {
      today: "Number of Pending Quotation",
      title: `${dashboard && dashboard.totalSales ? dashboard.totalSales : 0}`,
      icon: <i class="fas fa-copyright"></i>,
      bnb: "bnb2",
      url: "/quotation-request",
      key: "totalSales",
      _7Day: dashboard && (dashboard.restaurant7 ?? 0),
      _14Day: dashboard && (dashboard.restaurant14 ?? 0),
    },
  ];

  const handleChange = (value) => {
    console.log(`selected ${value}`);
    setYear(value);
  };

  useEffect(() => {
    setPageHeading(lang("Welcome Admin"));
    if (!userProfile) return;

    if (userProfile.type == "Teacher") {
      setPageHeading(`Welcome ${userProfile.name}`);
      if (!userProfile?.permission?.includes("dashboard-management")) return;
    }

    setLoading(true);
    request({
      url: apiPath.dashboard + `${year ? `?year=${year}` : ""}`,
      method: "GET",
      onSuccess: (data) => {
        setLoading(false);
        setDashboard(data.data);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  }, [year, country.country_id, userProfile]);

  return (
    <>
      {userProfile &&
      !userProfile?.permission?.includes("dashboard-management") &&
      userProfile.type == "Teacher" ? (
        <Row>
          <Col xs={24} sm={24} md={24}>
            <Descriptions
              column={{ xs: 16, sm: 16, md: 24 }}
              title="Teacher Info"
            >
              <Descriptions.Item label="Name">
                {userProfile?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Role title">
                {userProfile?.role_title}
              </Descriptions.Item>
              <Descriptions.Item label="Mobile Number">
                {formatPhone(
                  userProfile?.country_code,
                  userProfile?.mobile_number
                )}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      ) : (
        <div className="page-top-space home-card layout-content">
          <div className="mb-24">
            <div className="sub_title">
              <p>{lang("Here is the information about all your business")}</p>
              <div className="bussiness_year">
                <span>{lang("Year")}</span>
                <Select
                  value={year}
                  style={{ width: 120 }}
                  onChange={handleChange}
                  options={years.map((item) => ({ value: item, label: item }))}
                />
              </div>
              <div className="bussiness_year">
                <span>{lang("Filter")}</span>
                <Select
                  value={filter}
                  style={{ width: 120 }}
                  onChange={(e) => setFilter(e)}
                  options={[
                    { label: "State", value: "State" },
                    { label: "Graph", value: "Graph" },
                  ]}
                />
              </div>
            </div>

            {filter === "State" ? (
              <>
                <Row gutter={[24, 0]}>
                  <Col xs={24} sm={24} md={24}>
                    <Row
                      className="rowgap-vbox"
                      gutter={[24, 16]}
                      // style={{ marginLeft: "0" }}
                    >
                      {count.map((c, index) => (
                        <Col
                          key={index}
                          xs={24}
                          sm={24}
                          md={12}
                          lg={12}
                          xl={8}
                          className="mb24"
                        >
                          <CountCard c={c} key={index} loading={loading} />
                        </Col>
                      ))}
                    </Row>
                  </Col>
                </Row>
                <Row className="mt-3" gutter={[24, 0]}>
                  <Col xs={24} xl={24} className="sm-padding-0 ">
                    <SectionWrapper
                      cardHeading={lang("Top 5 Students")}
                      extra={
                        <>
                          <div className="w-100 text-head_right_cont"></div>
                        </>
                      }
                    >
                      <ServicesPerCategory
                        data={dashboard?.servicePerCategory}
                        loading={loading}
                      />
                    </SectionWrapper>
                  </Col>
                  <Col xs={24} xl={24} className="sm-padding-0 ">
                    <SectionWrapper
                      cardHeading={lang("Top 5 Teachers")}
                      extra={
                        <>
                          <div className="w-100 text-head_right_cont"></div>
                        </>
                      }
                    >
                      <BannerClicks
                        data={dashboard?.banner}
                        loading={loading}
                      />
                    </SectionWrapper>
                  </Col>
                </Row>
              </>
            ) : (
              <>
                <Row>
                  <Col xs={24} xl={24} lg={24}>
                    <Tabs className="main_tabs">
                      <TabPane tab={lang("weekly")} key="Weekly">
                        <div style={{ padding: "25px" }}>
                          <Row gutter={[24, 0]}>
                            <WeeklyChartSection borderColor="#1EB564" />
                          </Row>
                        </div>
                      </TabPane>
                      <TabPane tab={lang("monthly")} key="Monthly">
                        <div style={{ padding: "25px" }}>
                          <Row gutter={[24, 0]}>
                            <MonthlyChartSection borderColor="#1EB564" />
                          </Row>
                        </div>
                      </TabPane>

                      <TabPane tab={lang("quarterly")} key="Quarterly">
                        <div style={{ padding: "25px" }}>
                          <Row gutter={[24, 0]}>
                            <QuarterlyChartSection borderColor="#1EB564" />
                          </Row>
                        </div>
                      </TabPane>
                    </Tabs>
                  </Col>
                </Row>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const CountCard = ({ c, loading }) => {
  const [percentage, setPercentage] = useState();
  const [difference, setDifference] = useState();
  const { userProfile } = useAuthContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (!c) return null;

    console.log(c);
    const diff = c._7Day - c._14Day;

    const percentage = parseInt(
      ((diff / (c._7Day + c._14Day)) * 100).toFixed(2)
    );

    setPercentage(!!percentage ? percentage : 0);
  }, [c]);

  //if (!c) return null
  return (
    <Card
      hoverable
      bordered={false}
      className="criclebox"
      style={{ height: "100%" }}
      loading={loading}
      onClick={() => {
        userProfile?.type != "SubAdmin" && c.url && navigate(c.url);
      }}
    >
      <div className="number">
        <Row align="middle" gutter={[24, 0]}>
          <Col xs={18}>
            <span>{lang(c?.today)}</span>
            {/* <p className="ftp_text">{lang("Last 7 days")}</p> */}
            <Title level={3}>{lang(c?.title)}</Title>
          </Col>
          {/* <Col xs={6}>
            <div className="icon_box">
              <LineChartWithoutAxis
                isUp={percentage >= 0}
                points={[c?._14Day, c?._7Day]}
              />
            </div>
          </Col> */}
        </Row>
      </div>
    </Card>
  );
};

export default Home;
