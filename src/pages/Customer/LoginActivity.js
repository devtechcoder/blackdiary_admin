import { Button, Card, Col, Empty, Pagination, Row, Skeleton, Tag, Typography } from "antd";
import { ClockCircleOutlined, DesktopOutlined, EnvironmentOutlined, GlobalOutlined, MobileOutlined, TabletOutlined } from "@ant-design/icons";
import moment from "moment";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import apiPath from "../../constants/apiPath";
import { AppStateContext } from "../../context/AppContext";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import lang from "../../helper/langHelper";

const PAGE_SIZE = 10;

const pageStyles = {
  shell: {
    borderRadius: 24,
    border: "1px solid rgba(212, 175, 55, 0.14)",
    background: "linear-gradient(180deg, #161616 0%, #0d0d0d 100%)",
    boxShadow: "0 28px 90px rgba(0,0,0,0.45)",
    overflow: "hidden",
  },
  header: {
    padding: "24px 24px 18px",
    borderBottom: "1px solid rgba(212,175,55,0.12)",
  },
  titleKicker: {
    color: "#9d8b5a",
    fontSize: 10,
    letterSpacing: "0.32em",
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: 8,
  },
  heading: {
    color: "#fff1c9",
    margin: 0,
    fontSize: 28,
    lineHeight: 1.2,
    fontWeight: 700,
  },
  subheading: {
    color: "#a0a0a0",
    marginTop: 8,
    marginBottom: 0,
    fontSize: 14,
  },
  topActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-end",
  },
  backButton: {
    border: "1px solid rgba(212,175,55,0.18)",
    background: "rgba(255,255,255,0.04)",
    color: "#f4df9b",
    height: 42,
    borderRadius: 12,
    paddingInline: 18,
    boxShadow: "none",
  },
  summaryGrid: {
    padding: 24,
    paddingBottom: 12,
  },
  summaryCard: {
    height: "100%",
    borderRadius: 18,
    border: "1px solid rgba(255,215,0,0.12)",
    background: "rgba(255,255,255,0.03)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  },
  summaryLabel: {
    color: "#8c8c8c",
    fontSize: 11,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  summaryValue: {
    color: "#fff2cf",
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1,
  },
  content: {
    padding: 24,
    paddingTop: 12,
  },
  activityCard: {
    borderRadius: 18,
    border: "1px solid rgba(255,215,0,0.1)",
    background: "rgba(255,255,255,0.03)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
  },
  activityCardActive: {
    border: "1px solid rgba(115,255,167,0.18)",
    background: "rgba(115,255,167,0.05)",
  },
  fieldCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "12px 14px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.025)",
    minHeight: 70,
  },
  fieldLabel: {
    color: "#8d8d8d",
    fontSize: 11,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  fieldValue: {
    color: "#f3e9cd",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.4,
    wordBreak: "break-word",
  },
  footer: {
    padding: "0 24px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  footerRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  paginationWrap: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  loadMoreButton: {
    height: 42,
    borderRadius: 12,
    border: "1px solid rgba(212,175,55,0.2)",
    background: "rgba(212,175,55,0.08)",
    color: "#fff1c9",
    boxShadow: "none",
  },
};

const getDeviceIcon = (device = "") => {
  const value = String(device).toLowerCase();
  if (value.includes("tablet")) return <TabletOutlined />;
  if (value.includes("mobile")) return <MobileOutlined />;
  return <DesktopOutlined />;
};

const LoginActivity = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { request } = useRequest();
  const { setPageHeading } = useContext(AppStateContext);

  const user = location.state?.user || {};
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState({
    totalLoginCount: 0,
    totalLogoutCount: 0,
    activeSessions: 0,
  });
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    hasNextPage: false,
  });

  const userId = useMemo(() => params?.userId || user?._id, [params?.userId, user?._id]);

  useEffect(() => {
    setPageHeading(lang("Login Activity"));
  }, [setPageHeading]);

  const fetchActivity = (page = 1, pageSize = PAGE_SIZE, opts = {}) => {
    if (!userId) return;

    if (opts?.loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    request({
      url: `${apiPath.adminLoginActivity}/${userId}?page=${page}&pageSize=${pageSize}`,
      method: "GET",
      onSuccess: ({ data }) => {
        setActivities((prev) => (opts?.loadMore ? [...prev, ...(data?.docs || [])] : data?.docs || []));
        setSummary(
          data?.summary || {
            totalLoginCount: 0,
            totalLogoutCount: 0,
            activeSessions: 0,
          },
        );
        setCurrentSessionId(data?.currentSessionId || null);
        setPagination((prev) => ({
          ...prev,
          current: data?.page || page,
          pageSize: data?.limit || pageSize,
          total: data?.totalDocs || 0,
          hasNextPage: Boolean(data?.hasNextPage),
        }));
        setLoading(false);
        setLoadingMore(false);
      },
      onError: (error) => {
        setLoading(false);
        setLoadingMore(false);
        ShowToast(error?.response?.data?.message || "Unable to load login activity", Severty.ERROR);
      },
    });
  };

  useEffect(() => {
    fetchActivity(1, PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handlePaginationChange = (page, pageSize) => {
    fetchActivity(page, pageSize);
  };

  const handleLoadMore = () => {
    if (!pagination.hasNextPage || loading || loadingMore) return;
    fetchActivity(pagination.current + 1, pagination.pageSize, { loadMore: true });
  };

  const displayName = user?.name || user?.user_name || "Customer";
  return (
    <div className="tabled categoryService">
      <Card bordered={false} style={pageStyles.shell} bodyStyle={{ padding: 0, background: "transparent" }}>
        <div style={pageStyles.header}>
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col xs={24} lg={16}>
              <Typography.Text style={pageStyles.titleKicker}>{lang("Customer Activity")}</Typography.Text>
              <Typography.Title level={2} style={pageStyles.heading}>
                {displayName} {lang("Login Activity")}
              </Typography.Title>
              <Typography.Paragraph style={pageStyles.subheading}>{lang("Recent sessions from the last 60 days")}</Typography.Paragraph>
            </Col>
            <Col xs={24} lg={8}>
              <div style={pageStyles.topActions}>
                <Button onClick={() => navigate(-1)} style={pageStyles.backButton}>
                  {lang("Back")}
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        <div style={pageStyles.summaryGrid}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card bordered={false} style={pageStyles.summaryCard} bodyStyle={{ padding: 18 }}>
                <div style={pageStyles.summaryLabel}>{lang("Total logins")}</div>
                <div style={pageStyles.summaryValue}>{summary?.totalLoginCount || 0}</div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={pageStyles.summaryCard} bodyStyle={{ padding: 18 }}>
                <div style={pageStyles.summaryLabel}>{lang("Total logouts")}</div>
                <div style={pageStyles.summaryValue}>{summary?.totalLogoutCount || 0}</div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={pageStyles.summaryCard} bodyStyle={{ padding: 18 }}>
                <div style={pageStyles.summaryLabel}>{lang("Active sessions")}</div>
                <div style={pageStyles.summaryValue}>{summary?.activeSessions || 0}</div>
              </Card>
            </Col>
          </Row>
        </div>

        <div style={pageStyles.content}>
          {loading && activities.length === 0 ? (
            <div style={{ padding: "8px 0 24px" }}>
              <Row gutter={[16, 16]}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Col xs={24} key={index}>
                    <Card bordered={false} style={pageStyles.activityCard} bodyStyle={{ padding: 18 }}>
                      <Skeleton active paragraph={{ rows: 4 }} />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ) : null}

          {!loading && activities.length === 0 ? (
            <Card bordered={false} style={pageStyles.activityCard} bodyStyle={{ padding: 28, textAlign: "center" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span style={{ color: "#9a9a9a" }}>{lang("This user has not logged in during the current retention window.")}</span>}
              />
            </Card>
          ) : null}

          {activities.map((activity, index) => {
            const isActive = !activity?.logoutAt;
            const isCurrentSession = Boolean(currentSessionId && String(activity?._id) === String(currentSessionId));

            return (
              <article
                key={activity?._id || index}
                style={{
                  ...pageStyles.activityCard,
                  ...(isActive ? pageStyles.activityCardActive : {}),
                  marginBottom: 16,
                  padding: 18,
                }}
              >
                <Row gutter={[16, 16]} align="stretch">
                  <Col xs={24}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 14 }}>
                      <Tag color={isActive ? "green" : "default"} style={{ marginRight: 0 }}>
                        {isActive ? lang("Active Now") : lang("Logged Out")}
                      </Tag>
                      {isCurrentSession ? (
                        <Tag color="gold" style={{ marginRight: 0 }}>
                          {lang("Current Device")}
                        </Tag>
                      ) : null}
                      <Typography.Text style={{ color: "#a8a8a8" }}>
                        {lang("Last active")} {activity?.logoutAt ? moment(activity.logoutAt).fromNow() : moment(activity?.loginAt).fromNow()}
                      </Typography.Text>
                    </div>
                  </Col>

                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <div style={pageStyles.fieldCard}>
                      <EnvironmentOutlined style={{ color: "#d4af37", fontSize: 18, marginTop: 2 }} />
                      <div>
                        <div style={pageStyles.fieldLabel}>{lang("Location")}</div>
                        <div style={pageStyles.fieldValue}>{activity?.location || lang("Unknown")}</div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <div style={pageStyles.fieldCard}>
                      <div style={{ color: "#d4af37", fontSize: 18, marginTop: 2 }}>{getDeviceIcon(activity?.device)}</div>
                      <div>
                        <div style={pageStyles.fieldLabel}>{lang("Device")}</div>
                        <div style={pageStyles.fieldValue}>{activity?.device || lang("Desktop")}</div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <div style={pageStyles.fieldCard}>
                      <GlobalOutlined style={{ color: "#d4af37", fontSize: 18, marginTop: 2 }} />
                      <div>
                        <div style={pageStyles.fieldLabel}>{lang("Browser")}</div>
                        <div style={pageStyles.fieldValue}>{activity?.browser || lang("Unknown")}</div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <div style={pageStyles.fieldCard}>
                      <span style={{ color: "#d4af37", fontWeight: 700, marginTop: 2 }}>OS</span>
                      <div>
                        <div style={pageStyles.fieldLabel}>{lang("Operating System")}</div>
                        <div style={pageStyles.fieldValue}>{activity?.os || lang("Unknown")}</div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", color: "#c5c5c5" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <ClockCircleOutlined style={{ color: "#d4af37" }} />
                        {activity?.loginAt ? moment(activity.loginAt).format("DD MMM YYYY, hh:mm A") : lang("Unknown time")}
                      </span>
                      <span>{lang("IP")} {activity?.ipAddress || lang("Unknown")}</span>
                    </div>
                  </Col>
                </Row>
              </article>
            );
          })}

          {!loading && pagination.total > 0 ? (
              <div style={pageStyles.footer}>
                <div style={pageStyles.footerRow}>
                  <Typography.Text style={{ color: "#9b9b9b" }}>
                    {lang("Showing")} {(pagination.current - 1) * pagination.pageSize + 1}-{Math.min(pagination.current * pagination.pageSize, pagination.total)} {lang("of")} {pagination.total}
                  </Typography.Text>
                  <Typography.Text style={{ color: "#9b9b9b" }}>
                    {lang("Loaded")} {activities.length} {lang("records")}
                  </Typography.Text>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {pagination.hasNextPage ? (
                      <Button onClick={handleLoadMore} loading={loadingMore} style={pageStyles.loadMoreButton}>
                        {lang("Load More")}
                    </Button>
                  ) : null}
                </div>
              </div>

              <div style={pageStyles.paginationWrap}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={handlePaginationChange}
                  showSizeChanger={false}
                  showQuickJumper
                  simple
                />
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
};

export default LoginActivity;
