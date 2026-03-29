import { Card, Skeleton, Typography } from "antd";

const { Text, Title } = Typography;

const ChartSection = ({ title, subtitle, extra, loading = false, children, className = "", bodyStyle = {} }) => {
  return (
    <Card
      bordered={false}
      className={`dashboard-panel ${className}`.trim()}
      title={
        <div className="dashboard-panel-heading">
          <div>
            <Title level={4} className="dashboard-panel-title">
              {title}
            </Title>
            {!!subtitle && <Text className="dashboard-panel-subtitle">{subtitle}</Text>}
          </div>
        </div>
      }
      extra={extra}
    >
      {loading ? <Skeleton active paragraph={{ rows: 7 }} /> : <div style={bodyStyle}>{children}</div>}
    </Card>
  );
};

export default ChartSection;
