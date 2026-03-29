import { Card, Space, Typography } from "antd";

const { Text, Title } = Typography;

const StatsCard = ({ title, value, icon, subtitle, loading = false, accent = "#d8a54d", onClick }) => {
  return (
    <Card
      bordered={false}
      className="dashboard-stat-card"
      loading={loading}
      hoverable={!!onClick}
      onClick={onClick}
    >
      <div className="dashboard-stat-inner">
        <Space align="start" size={14}>
          <div className="dashboard-stat-icon" style={{ background: `linear-gradient(135deg, ${accent}22, ${accent}40)` }}>
            {icon}
          </div>
          <div className="dashboard-stat-copy">
            <Text className="dashboard-stat-label">{title}</Text>
            <Title level={2} className="dashboard-stat-value">
              {value}
            </Title>
            {!!subtitle && <Text className="dashboard-stat-subtitle">{subtitle}</Text>}
          </div>
        </Space>
      </div>
    </Card>
  );
};

export default StatsCard;
