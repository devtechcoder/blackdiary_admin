import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppStateContext } from "../../context/AppContext";
import { useAuthContext } from "../../context/AuthContext";
import useRequest from "../../hooks/useRequest";
import apiPath from "../../constants/apiPath";
import { Severty, ShowToast } from "../../helper/toast";
import lang from "../../helper/langHelper";
import moment from "moment";

import {
  Button,
  Card,
  Col,
  Empty,
  Row,
  Select,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  AppstoreAddOutlined,
  BarChartOutlined,
  CalendarOutlined,
  FolderOpenOutlined,
  LineChartOutlined,
  ReloadOutlined,
  TagsOutlined,
  TeamOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

import StatsCard from "../../components/dashboard/StatsCard";
import ChartSection from "../../components/dashboard/ChartSection";
import TrendingList from "../../components/dashboard/TrendingList";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import { formatPhone } from "../../helper/functions";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const rangeOptions = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
];

const quickActions = [
  {
    label: "Add Shayari",
    icon: <FileTextOutlined />,
    path: "/diary-add-edit?type=shayari",
  },
  {
    label: "Add Sher",
    icon: <BarChartOutlined />,
    path: "/diary-add-edit?type=post",
  },
  {
    label: "Add Keyword",
    icon: <TagsOutlined />,
    path: "/keyword-emotion",
  },
  {
    label: "Add Category",
    icon: <FolderOpenOutlined />,
    path: "/category",
  },
];

const formatAgo = (value) => {
  if (!value) return "-";
  return moment(value).fromNow();
};

function Home() {
  const { setPageHeading } = useContext(AppStateContext);
  const { request } = useRequest();
  const { userProfile } = useAuthContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [range, setRange] = useState(30);

  const canViewDashboard = useMemo(() => {
    if (!userProfile) return false;
    if (userProfile.type !== "Teacher") return true;
    return !!userProfile?.permission?.includes("dashboard-management");
  }, [userProfile]);

  useEffect(() => {
    if (!userProfile) return;

    if (userProfile.type === "Teacher" && !userProfile?.permission?.includes("dashboard-management")) {
      setPageHeading(`Welcome ${userProfile?.name || "User"}`);
      return;
    }

    setPageHeading(lang("Dashboard Overview"));
  }, [setPageHeading, userProfile]);

  useEffect(() => {
    if (!userProfile || !canViewDashboard) return;

    setLoading(true);
    request({
      url: `${apiPath.dashboard}?range=${range}`,
      method: "GET",
      onSuccess: (response) => {
        setDashboard(response?.data || {});
        setLoading(false);
      },
      onError: (error) => {
        setLoading(false);
        ShowToast(error?.message || "Unable to load dashboard data", Severty.ERROR);
      },
    });
  }, [request, range, userProfile, canViewDashboard]);

  const stats = dashboard?.stats || {};
  const charts = dashboard?.charts || {};
  const postGrowth = charts?.postGrowth || [];
  const userGrowth = charts?.userGrowth || [];
  const categoryDistribution = charts?.categoryDistribution || [];
  const trendingKeywords = dashboard?.trendingKeywords || [];
  const trendingPosts = dashboard?.trendingPosts || [];
  const keywordInsights = dashboard?.keywordInsights || {};
  const recentPosts = dashboard?.recentActivity?.posts || [];
  const recentUsers = dashboard?.recentActivity?.users || [];
  const recentLoginActivities = dashboard?.recentActivity?.loginActivities || [];

  const lineLabels = postGrowth.map((item) => item.label);
  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: "Posts",
        data: postGrowth.map((item) => item.count || 0),
        borderColor: "#d8a54d",
        backgroundColor: "rgba(216, 165, 77, 0.18)",
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: "#d8a54d",
      },
      {
        label: "Users",
        data: userGrowth.map((item) => item.count || 0),
        borderColor: "#0f2f67",
        backgroundColor: "rgba(15, 47, 103, 0.12)",
        tension: 0.35,
        fill: false,
        pointRadius: 3,
        pointBackgroundColor: "#0f2f67",
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#111827",
          usePointStyle: true,
          boxWidth: 10,
          padding: 18,
        },
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#111827",
        bodyColor: "#111827",
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#4b5563",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: "#4b5563",
        },
        grid: {
          color: "rgba(17, 24, 39, 0.08)",
        },
      },
    },
  };

  const doughnutData = {
    labels: categoryDistribution.map((item) => item.label),
    datasets: [
      {
        data: categoryDistribution.map((item) => item.value || 0),
        backgroundColor: categoryDistribution.map((item) => item.color),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#111827",
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#111827",
        bodyColor: "#111827",
        padding: 12,
      },
    },
  };

  const renderEmptyState = () => (
    <div className="dashboard-empty">
      <Empty description="No data available yet" />
    </div>
  );

  if (!userProfile) {
    return (
      <div className="page-top-space layout-content dashboard-page">
        <div className="dashboard-loading-shell">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!canViewDashboard) {
    return (
      <Row>
        <Col xs={24} sm={24} md={24}>
          <Card bordered={false} className="dashboard-panel">
            <Title level={3}>Teacher Info</Title>
            <p className="mb-2">
              <Text strong>Name:</Text> {userProfile?.name}
            </p>
            <p className="mb-2">
              <Text strong>Role title:</Text> {userProfile?.role_title}
            </p>
            <p className="mb-0">
              <Text strong>Mobile Number:</Text> {formatPhone(userProfile?.country_code, userProfile?.mobile_number)}
            </p>
          </Card>
        </Col>
      </Row>
    );
  }

  const statCards = [
    {
      title: "Total Posts",
      value: stats?.totalPosts || 0,
      subtitle: "Shayari + Sher combined",
      icon: <FileTextOutlined />,
      accent: "#d8a54d",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      subtitle: "Registered customers",
      icon: <TeamOutlined />,
      accent: "#0f2f67",
    },
    {
      title: "Total Categories",
      value: stats?.totalCategories || 0,
      subtitle: "Active content categories",
      icon: <FolderOpenOutlined />,
      accent: "#264c93",
    },
    {
      title: "Total Keywords",
      value: stats?.totalKeywords || 0,
      subtitle: "Keyword emotion library",
      icon: <TagsOutlined />,
      accent: "#9e6f20",
    },
    {
      title: "Total Subcategories",
      value: stats?.totalSubcategories || 0,
      subtitle: "Connected to categories",
      icon: <AppstoreAddOutlined />,
      accent: "#203b6d",
    },
    {
      title: "Posts Added Today",
      value: stats?.postsToday || 0,
      subtitle: "Fresh content from today",
      icon: <CalendarOutlined />,
      accent: "#d08d2f",
    },
  ];

  return (
    <div className="page-top-space layout-content dashboard-page">
      <div className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <div className="dashboard-hero-eyebrow">Black Diary Analytics</div>
          <Title level={2} className="dashboard-hero-title">
            Dashboard Overview
          </Title>
          <Text className="dashboard-hero-text">
            Real-time stats, content growth, trending keywords and activity from the live backend.
          </Text>
        </div>

        <Space wrap className="dashboard-hero-actions">
          <div className="dashboard-range-control">
            <span>Range</span>
            <Select
              value={range}
              onChange={setRange}
              options={rangeOptions}
              suffixIcon={<LineChartOutlined />}
            />
          </div>
          <Button
            icon={<ReloadOutlined />}
            className="dashboard-refresh-btn"
            onClick={() => {
              setLoading(true);
              request({
                url: `${apiPath.dashboard}?range=${range}`,
                method: "GET",
                onSuccess: (response) => {
                  setDashboard(response?.data || {});
                  setLoading(false);
                },
                onError: (error) => {
                  setLoading(false);
                  ShowToast(error?.message || "Unable to load dashboard data", Severty.ERROR);
                },
              });
            }}
          >
            Refresh
          </Button>
        </Space>
      </div>

      <div className="dashboard-stack">
      <Row gutter={[20, 20]} className="dashboard-stats-grid">
        {statCards.map((item) => (
          <Col key={item.title} xs={24} sm={12} lg={8} xl={8} xxl={8}>
            <StatsCard
              title={item.title}
              value={item.value}
              subtitle={item.subtitle}
              icon={item.icon}
              loading={loading && !dashboard}
              accent={item.accent}
            />
          </Col>
        ))}
      </Row>

      <Card bordered={false} className="dashboard-panel dashboard-actions-card" title="Quick Actions">
        <Row gutter={[14, 14]}>
          {quickActions.map((action) => (
            <Col key={action.label} xs={24} sm={12} lg={6}>
              <Button
                block
                size="large"
                icon={action.icon}
                className="dashboard-action-btn"
                onClick={() => navigate(action.path)}
              >
                {action.label}
              </Button>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={16}>
          <ChartSection
            title="Posts Growth"
            subtitle={`Combined posts created in the last ${range} days`}
            loading={loading && !dashboard}
            extra={<Tag color="gold">Live backend data</Tag>}
            bodyStyle={{ height: 360 }}
          >
            {postGrowth.length ? <Line data={lineData} options={lineOptions} /> : renderEmptyState()}
          </ChartSection>
        </Col>
        <Col xs={24} xl={8}>
          <ChartSection
            title="Category Distribution"
            subtitle="Shayari, Sher and everything else"
            loading={loading && !dashboard}
            extra={<Tag color="blue">Overall</Tag>}
            bodyStyle={{ height: 360 }}
          >
            {categoryDistribution.some((item) => item.value) ? <Doughnut data={doughnutData} options={doughnutOptions} /> : renderEmptyState()}
          </ChartSection>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={12}>
          <TrendingList
            title="Trending Keywords"
            subtitle="Top 10 keywords by usage"
            items={trendingKeywords}
            loading={loading && !dashboard}
            accent="#d8a54d"
            renderItem={(item) => (
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Text className="dashboard-list-title">{item?.name || item?.slug || "Keyword"}</Text>
                <Text className="dashboard-list-subtitle">
                  {item?.slug ? `@${item.slug}` : "No slug available"}
                </Text>
              </Space>
            )}
          />
        </Col>
        <Col xs={24} xl={12}>
          <TrendingList
            title="Trending Posts"
            subtitle="Most engaged posts in the current dataset"
            items={trendingPosts}
            loading={loading && !dashboard}
            accent="#0f2f67"
            renderItem={(item) => (
              <div className="dashboard-post-row">
                <div className="dashboard-post-copy">
                  <Text className="dashboard-list-title">{item?.title || "Untitled"}</Text>
                  <Space size={[8, 4]} wrap>
                    <Tag color="gold">{item?.categoryLabel || "Others"}</Tag>
                    <Text className="dashboard-list-subtitle">{formatAgo(item?.created_at)}</Text>
                    <Text className="dashboard-list-subtitle">{item?.author?.name || item?.author?.user_name || "Unknown author"}</Text>
                  </Space>
                </div>
                <Tag color="#0f2f67" className="dashboard-count-tag">
                  {item?.likesCount || 0} likes
                </Tag>
              </div>
            )}
          />
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24}>
          <ActivityFeed
            title="Recent Login Activity"
            subtitle="Last 5 users who logged in"
            items={recentLoginActivities}
            loading={loading && !dashboard}
            emptyText="No recent login activity"
            renderItem={(item) => (
              <div className="dashboard-activity-row">
                <div>
                  <Text className="dashboard-list-title">{item?.displayName || item?.userId?.name || item?.userId?.user_name || "User"}</Text>
                  <div className="dashboard-activity-meta">
                    <Tag color={item?.logoutAt ? "default" : "green"}>{item?.statusLabel || (item?.logoutAt ? "Logged Out" : "Active Now")}</Tag>
                    <Tag color="gold">{item?.user_name ? `@${item.user_name}` : "No username"}</Tag>
                    <Text className="dashboard-list-subtitle">{formatAgo(item?.loginAt)}</Text>
                  </div>
                </div>
                <div className="dashboard-activity-meta">
                  <Text className="dashboard-list-subtitle">{item?.location || "-"}</Text>
                  <Text className="dashboard-list-subtitle">{item?.device || "Desktop"}</Text>
                </div>
              </div>
            )}
          />
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={8}>
          <Card bordered={false} className="dashboard-panel" title="Keyword Insights">
            <Tabs defaultActiveKey="most-used" className="dashboard-tabs">
              <TabPane tab="Most Used" key="most-used">
                {keywordInsights?.mostUsed?.length ? (
                  <div className="dashboard-list">
                    {keywordInsights.mostUsed.map((item) => (
                      <div className="dashboard-list-item" key={item?._id}>
                        <Space direction="vertical" size={2}>
                          <Text className="dashboard-list-title">{item?.name || item?.slug || "Keyword"}</Text>
                          <Text className="dashboard-list-subtitle">
                            {item?.slug ? `@${item.slug}` : "No slug"} • {item?.categories?.join(", ") || "All categories"}
                          </Text>
                        </Space>
                        <Tag color="gold" className="dashboard-count-tag">
                          {item?.usageCount || 0} uses
                        </Tag>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="No keyword usage yet" />
                )}
              </TabPane>
              <TabPane tab="Unused" key="unused">
                {keywordInsights?.unused?.length ? (
                  <div className="dashboard-list">
                    {keywordInsights.unused.map((item) => (
                      <div className="dashboard-list-item" key={item?._id}>
                        <Space direction="vertical" size={2}>
                          <Text className="dashboard-list-title">{item?.name || item?.slug || "Keyword"}</Text>
                          <Text className="dashboard-list-subtitle">
                            {item?.slug ? `@${item.slug}` : "No slug"} • never used
                          </Text>
                        </Space>
                        <Tag color="default" className="dashboard-count-tag">
                          0 uses
                        </Tag>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="No unused keywords found" />
                )}
              </TabPane>
              <TabPane tab="Recently Used" key="recently-used">
                {keywordInsights?.recentlyUsed?.length ? (
                  <div className="dashboard-list">
                    {keywordInsights.recentlyUsed.map((item) => (
                      <div className="dashboard-list-item" key={item?._id}>
                        <Space direction="vertical" size={2}>
                          <Text className="dashboard-list-title">{item?.name || item?.slug || "Keyword"}</Text>
                          <Text className="dashboard-list-subtitle">
                            {item?.slug ? `@${item.slug}` : "No slug"} • {item?.lastUsedAt ? moment(item.lastUsedAt).fromNow() : "Unknown"}
                          </Text>
                        </Space>
                        <Tag color="#0f2f67" className="dashboard-count-tag">
                          {item?.usageCount || 0} uses
                        </Tag>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="No recent keyword activity" />
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        <Col xs={24} xl={16}>
          <ActivityFeed
            title="Recent Users Registered"
            subtitle="Last 5 users who joined"
            items={recentUsers}
            loading={loading && !dashboard}
            emptyText="No recent users"
            renderItem={(item) => (
              <div className="dashboard-activity-row">
                <div>
                  <Text className="dashboard-list-title">{item?.displayName || item?.name || "User"}</Text>
                  <div className="dashboard-activity-meta">
                    <Tag color="gold">{item?.user_name ? `@${item.user_name}` : "No username"}</Tag>
                    <Text className="dashboard-list-subtitle">{formatAgo(item?.created_at)}</Text>
                  </div>
                </div>
                <div className="dashboard-activity-meta">
                  <Text className="dashboard-list-subtitle">{item?.email || item?.mobile_number || "-"}</Text>
                </div>
              </div>
            )}
          />
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24}>
          <ActivityFeed
            title="Recent Posts Added"
            subtitle="Last 5 posts created"
            items={recentPosts}
            loading={loading && !dashboard}
            emptyText="No recent posts"
            renderItem={(item) => (
              <div className="dashboard-activity-row">
                <div>
                  <Text className="dashboard-list-title">{item?.title || "Untitled"}</Text>
                  <div className="dashboard-activity-meta">
                    <Tag color="gold">{item?.categoryLabel || "Others"}</Tag>
                    <Text className="dashboard-list-subtitle">{formatAgo(item?.created_at)}</Text>
                  </div>
                </div>
                <div className="dashboard-activity-meta">
                  <Text className="dashboard-list-subtitle">
                    {item?.author?.name || item?.author?.user_name || "Unknown author"}
                  </Text>
                  <Tag color="#0f2f67">{item?.likesCount || 0} likes</Tag>
                </div>
              </div>
            )}
          />
        </Col>
      </Row>

      </div>
    </div>
  );
}

export default Home;
