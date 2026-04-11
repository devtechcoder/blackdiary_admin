import { Modal, Spin } from "antd";
import { ClockCircleOutlined, DesktopOutlined, EnvironmentOutlined, GlobalOutlined, MobileOutlined, TabletOutlined } from "@ant-design/icons";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import apiPath from "../constants/apiPath";
import useRequest from "../hooks/useRequest";

const PAGE_SIZE = 12;

const getDeviceIcon = (device = "") => {
  const value = String(device).toLowerCase();
  if (value.includes("tablet")) return <TabletOutlined />;
  if (value.includes("mobile")) return <MobileOutlined />;
  return <DesktopOutlined />;
};

const LoginActivityModal = ({ show, hide, user }) => {
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState({
    totalLoginCount: 0,
    totalLogoutCount: 0,
    activeSessions: 0,
  });
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const endpoint = useMemo(() => (user?._id ? `${apiPath.adminLoginActivity}/${user._id}?page=1&pageSize=${PAGE_SIZE}` : ""), [user?._id]);
  const { response, loading } = useRequest(endpoint, { skip: !show || !user?._id });

  useEffect(() => {
    if (!show) {
      setActivities([]);
      setSummary({
        totalLoginCount: 0,
        totalLogoutCount: 0,
        activeSessions: 0,
      });
      setCurrentSessionId(null);
    }
  }, [show]);

  useEffect(() => {
    if (!response?.status) return;

    setActivities(response?.data?.docs || []);
    setSummary(response?.data?.summary || {
      totalLoginCount: 0,
      totalLogoutCount: 0,
      activeSessions: 0,
    });
    setCurrentSessionId(response?.data?.currentSessionId || null);
  }, [response]);

  return (
    <Modal open={show} onCancel={hide} footer={null} centered width={900} className="custom-modal" bodyStyle={{ padding: 0, background: "transparent" }}>
      <div className="overflow-hidden rounded-[24px] border border-[rgba(212,175,55,0.14)] bg-[linear-gradient(180deg,#131313_0%,#0b0b0b_100%)] text-white shadow-[0_28px_90px_rgba(0,0,0,0.7)]">
        <div className="border-b border-[rgba(212,175,55,0.12)] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#9d8b5a]">Customer Activity</p>
          <h2 className="mt-1 text-2xl font-semibold text-[#fff1c9]">{user?.name || user?.user_name || "User"} Login Activity</h2>
          <p className="mt-1 text-sm text-[#9a9a9a]">Recent sessions from the last 60 days</p>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-3">
          <div className="rounded-[18px] border border-[rgba(255,215,0,0.12)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#8c8c8c]">Total logins</p>
            <p className="mt-2 text-2xl font-semibold text-[#fff2cf]">{summary?.totalLoginCount || 0}</p>
          </div>
          <div className="rounded-[18px] border border-[rgba(255,215,0,0.12)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#8c8c8c]">Total logouts</p>
            <p className="mt-2 text-2xl font-semibold text-[#fff2cf]">{summary?.totalLogoutCount || 0}</p>
          </div>
          <div className="rounded-[18px] border border-[rgba(255,215,0,0.12)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#8c8c8c]">Active sessions</p>
            <p className="mt-2 text-2xl font-semibold text-[#fff2cf]">{summary?.activeSessions || 0}</p>
          </div>
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto px-4 pb-4">
          {loading && activities.length === 0 ? (
            <div className="flex justify-center py-10">
              <Spin />
            </div>
          ) : null}

          {!loading && activities.length === 0 ? (
            <div className="rounded-[20px] border border-[rgba(255,215,0,0.12)] bg-[rgba(255,255,255,0.03)] px-5 py-10 text-center">
              <p className="text-lg font-semibold text-[#fff1c9]">No activity found</p>
              <p className="mt-2 text-sm text-[#9a9a9a]">This user has not logged in during the current retention window.</p>
            </div>
          ) : null}

          {activities.map((activity, index) => {
            const isActive = !activity?.logoutAt;
            const isCurrentSession = Boolean(currentSessionId && String(activity?._id) === String(currentSessionId));

            return (
              <article
                key={activity?._id || index}
                className={`rounded-[18px] border p-4 transition-all duration-300 ${
                  isActive
                    ? "border-[rgba(115,255,167,0.16)] bg-[rgba(115,255,167,0.05)]"
                    : "border-[rgba(255,215,0,0.1)] bg-[rgba(255,255,255,0.03)]"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${isActive ? "border-[rgba(115,255,167,0.2)] bg-[rgba(115,255,167,0.08)] text-[#9cffbb]" : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[#b8b8b8]"}`}>
                        {isActive ? <span className="h-2 w-2 rounded-full bg-[#72ff9f]" /> : <ClockCircleOutlined />}
                        {isActive ? "Active Now" : "Logged Out"}
                      </span>
                      {isCurrentSession ? (
                        <span className="inline-flex items-center rounded-full border border-[rgba(212,175,55,0.22)] bg-[rgba(212,175,55,0.08)] px-3 py-1 text-xs font-semibold text-[#f4df9b]">
                          Current Device
                        </span>
                      ) : null}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-start gap-3 rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
                        <EnvironmentOutlined className="mt-0.5 text-[#d4af37]" />
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8d8d8d]">Location</p>
                          <p className="mt-1 text-sm text-[#f3e9cd]">{activity?.location || "Unknown"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
                        <span className="mt-0.5 text-[#d4af37]">{getDeviceIcon(activity?.device)}</span>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8d8d8d]">Device</p>
                          <p className="mt-1 text-sm text-[#f3e9cd]">{activity?.device || "Desktop"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
                        <GlobalOutlined className="mt-0.5 text-[#d4af37]" />
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8d8d8d]">Browser</p>
                          <p className="mt-1 text-sm text-[#f3e9cd]">{activity?.browser || "Unknown"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
                        <span className="mt-0.5 text-[#d4af37]">OS</span>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8d8d8d]">Operating System</p>
                          <p className="mt-1 text-sm text-[#f3e9cd]">{activity?.os || "Unknown"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-[#b7b7b7]">
                      <span className="inline-flex items-center gap-2">
                        <ClockCircleOutlined className="text-[#d4af37]" />
                        {activity?.loginAt ? moment(activity.loginAt).format("DD MMM YYYY, hh:mm A") : "Unknown time"}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        Last active {activity?.logoutAt ? moment(activity.logoutAt).fromNow() : moment(activity.loginAt).fromNow()}
                      </span>
                      <span className="inline-flex items-center gap-2 text-[#8a8a8a]">IP {activity?.ipAddress || "Unknown"}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default LoginActivityModal;
