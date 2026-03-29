import { Card, Empty, Space, Typography } from "antd";

const { Text, Title } = Typography;

const ActivityFeed = ({
  title,
  subtitle,
  items = [],
  loading = false,
  emptyText = "No recent activity",
  renderItem,
}) => {
  return (
    <Card
      bordered={false}
      className="dashboard-panel dashboard-feed-panel"
      title={
        <div>
          <Title level={4} className="dashboard-panel-title">
            {title}
          </Title>
          {!!subtitle && <Text className="dashboard-panel-subtitle">{subtitle}</Text>}
        </div>
      }
      loading={loading}
    >
      {!loading && (!items || !items.length) ? (
        <Empty description={emptyText} />
      ) : (
        <div className="dashboard-list">
          {items.map((item, index) => (
            <div className="dashboard-list-item" key={item?._id || item?.id || index}>
              {renderItem ? (
                renderItem(item, index)
              ) : (
                <Space direction="vertical" size={4}>
                  <Text className="dashboard-list-title">{item?.title || item?.name || "Item"}</Text>
                  <Text className="dashboard-list-subtitle">{item?.summary || item?.description || ""}</Text>
                </Space>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ActivityFeed;
