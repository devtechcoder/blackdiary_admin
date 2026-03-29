import { Card, Empty, Space, Tag, Typography } from "antd";

const { Text, Title } = Typography;

const TrendingList = ({
  title,
  subtitle,
  items = [],
  loading = false,
  emptyText = "No data available",
  renderItem,
  accent = "#d8a54d",
}) => {
  return (
    <Card
      bordered={false}
      className="dashboard-panel dashboard-list-panel"
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
                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                  <Text className="dashboard-list-title">{item?.name || item?.title || item?.label || "Item"}</Text>
                  <Text className="dashboard-list-subtitle">{item?.summary || item?.description || item?.slug || ""}</Text>
                </Space>
              )}
              {item?.usageCount !== undefined && item?.usageCount !== null && (
                <Tag color={accent} className="dashboard-count-tag">
                  {item.usageCount} uses
                </Tag>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TrendingList;
