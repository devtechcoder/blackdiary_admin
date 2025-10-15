import { useState } from "react";
import { Form, Modal, Row, Col, Radio } from "antd";
import lang from "../helper/langHelper";

const DeleteModal = ({ show, hide, onOk, title, subtitle, reasons }) => {
  const [value, setValue] = useState(reasons?.length > 0 ? reasons[1] : "");

  return (
    <Modal
      width={700}
      open={show}
      onOk={() => {
        if (onOk) onOk(value);
        hide();
      }}
      okText={lang("Ok")}
      cancelText={lang("Cancel")}
      onCancel={hide}
      centered
      className="tab_modal deleteWarningModal"
    >
      <Form layout="vertical" className="p-2">
        <h4 className="modal_title_cls mb-2">{title}</h4>
        <h4 className="modal_sub_title_cls mb-2 ">{subtitle}</h4>
        {reasons?.length > 0 ? (
          <Row gutter={[16, 16]} className="justify-content-center">
            <Col md={16}>
              <Radio.Group
                onChange={({ target }) => setValue(target?.value)}
                value={value}
              >
                {reasons?.map((item, idx) => (
                  <Radio key={idx} className="d-block" value={item}>
                    {item}
                  </Radio>
                ))}
              </Radio.Group>
            </Col>
          </Row>
        ) : (
          ""
        )}
      </Form>
    </Modal>
  );
};

export default DeleteModal;
