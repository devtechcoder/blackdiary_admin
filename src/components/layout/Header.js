import {
  DownOutlined,
  KeyOutlined,
  LogoutOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Select,
  Upload,
  message,
} from "antd";
import { useContext, useEffect, useState } from "react";
import { uploadFile } from "react-s3";

import { useNavigate } from "react-router";
import Logo from "../../assets/images/Logo.png";
import Notification1 from "../../assets/images/face-1.jpg";
import Notification2 from "../../assets/images/face-2.jpg";
import Notification3 from "../../assets/images/face-3.jpg";
import notfound from "../../assets/images/not_found.png";
import Notification from "../../assets/images/notification.svg";
import DeleteModal from "../../components/DeleteModal";
import { s3Config } from "../../config/s3Config";
import apiPath from "../../constants/apiPath";
import { useAppContext } from "../../context/AppContext";
import { AuthContext } from "../../context/AuthContext";
import { getFileExtension } from "../../helper/functions";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useRequest from "../../hooks/useRequest";
import Prouser from "../../assets/images/user.png";

const { confirm } = Modal;

const toggler = [
  <svg
    width="20"
    height="20"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    key={0}
  >
    <path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path>
  </svg>,
];

const languages = [
  {
    label: "English",
    value: "en",
  },
  {
    label: "Arabic",
    value: "ar",
  },
];

function Header({ name: sectionHeading, onPress }) {
  const [visible, setVisible] = useState(false);

  const [profile, setProfile] = useState({});
  const [selected, setSelected] = useState();
  const [profileVisible, setProfileVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [appSetting, setAppSetting] = useState({});
  const [appSettingSelected, setAppSettingSelected] = useState();
  const [appSettingVisible, setAppSettingVisible] = useState(false);
  const [countries, setCountries] = useState([]);
  const { request } = useRequest();
  const [refresh, setRefresh] = useState(false);
  const { logout, userProfile, isAdmin, setIsAdmin } = useContext(AuthContext);
  const { setCountry, country, language, setLanguage } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState([]);

  const [form] = Form.useForm();

  const navigate = useNavigate();

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  useEffect(() => {
    if (!userProfile) return setIsAdmin(true);

    getCountry();
  }, [userProfile]);

  useEffect(() => window.scrollTo(0, 0));

  const getCountry = () => {
    request({
      url: `/country`,
      method: "GET",
      onSuccess: ({ data, status }) => {
        if (data) {
          setCountries(data);
          const selected = data.find(
            (item) => item._id == userProfile.country_id
          );
          userProfile.type == "SubAdmin"
            ? setCountry((prev) => ({
                ...prev,
                country_id: userProfile.country_id,
                data: selected,
              }))
            : data.length &&
              setCountry((prev) => ({
                ...prev,
                country_id: data[0]._id,
                data: data[0],
              }));
        }
      },
    });
  };

  const onChange = (key, value) => {
    const selected = countries.find((item) => item._id == value);

    setCountry((prev) => ({ ...prev, [key]: value, data: selected }));
  };

  const notificationitems = [
    {
      label: (
        <div className="notification_top">
          <div className="notification-head">
            <h5>Notifications</h5>
          </div>
          <div className="notification-inner">
            {notification.map((item) => (
              <div key={item._id} className="single-notification">
                <div className="notification-img">
                  <img
                    src={item?.from_id.image ? item?.from_id.image : Prouser}
                  />
                </div>
                <div className="notification-cont">
                  {/* <p>
                  <span>Vendor Heeba Khan</span> attach a deposit receipt to the
                  App bank account of <span>AED 100.00</span>
                </p> */}
                  <p>
                    <span>{item.title ? item.title : ""}</span>
                    <p>{item.description ? item.description : ""}</p>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="viewAll_notification">
            <Button
              onClick={() => navigate("/notification")}
              className="btnStyle btn_primary"
            >
              View All
            </Button>
          </div>
        </div>
      ),
    },
  ];

  const items = [
    {
      label: lang("Edit Profile"),
      key: "1",
      icon: <UserOutlined />,
      danger: true,
    },
    // userProfile?.type == "SubAdmin" &&
    {
      label: lang("Change Password"),
      key: "2",
      icon: <KeyOutlined />,
      danger: true,
    },
    {
      label: lang("Logout"),
      key: "3",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  useEffect(() => {
    if (!isOpen) return document.body.classList.remove("edit-dropdown");
    document.body.classList.add("edit-dropdown");

    return () => {
      document.body.classList.remove("edit-dropdown");
    };
  }, [isOpen]);

  const showDeleteConfirm = (record) => {
    setIsLogoutModalVisible(true);
    // logout();
  };

  const handleMenuClick = (e) => {
    setIsOpen(false);
    if (e.key == 2) {
      setVisible(true);
    }
    if (e.key == 1) {
      setProfileVisible(true);
    }
    if (e.key == 4) {
      setAppSettingVisible(true);
    }
    if (e.key == 3) {
      showDeleteConfirm();
    }
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const handleCreate = (values) => {
    onCreate(values);
  };

  const onCreate = (values) => {
    const { old_password, new_password } = values;
    const payload = {};
    if (!old_password || !new_password)
      return ShowToast("Please enter password ", Severty.ERROR);
    setLoading(true);
    payload.new_password = new_password;
    payload.old_password = old_password;
    request({
      url: apiPath.changePassword,
      method: "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
          setVisible(false);
          logout();
        } else {
          ShowToast(data.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    request({
      url: apiPath.profile,
      method: "GET",
      onSuccess: (data) => {
        setProfile(data.data);
        setSelected(data.data);
      },
    });
    request({
      url: apiPath.getAppSetting,
      method: "GET",
      onSuccess: (data) => {
        setAppSetting(data.data);
        setAppSettingSelected(data.data);
      },
    });
    fetchData();
  }, [refresh]);

  const fetchData = () => {
    request({
      url: `${apiPath.notification}/top-five`,
      method: "GET",
      onSuccess: (data) => {
        setNotification(data.data);
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  return (
    <>
      <Row gutter={[24, 0]} className="justify-content-between mx-0">
        <Col
          span={24}
          xs={24}
          md={24}
          lg={12}
          sm={24}
          className="SectionMain px-0 left-header"
        >
          <div className="d-none d-lg-block desk-bar">
            {" "}
            <Button
              type="link"
              className="sidebar-toggler ps-0"
              onClick={() => onPress()}
            >
              {toggler}
            </Button>
          </div>

          <div className="d-none d-lg-block">{sectionHeading}</div>
          <div className="tabLogo d-sm-block d-lg-none">
            <img className="w-100" src={Logo} />
          </div>
        </Col>
        <Col span={24} xs={24} sm={24} lg={12} className="header-control px-0">
          <Button
            type="link"
            className="sidebar-toggler ps-0"
            onClick={() => onPress()}
          >
            {toggler}
          </Button>

          <div className="country-wrap">
            <Select
              value={language}
              options={languages}
              onChange={(value) => {
                localStorage.setItem("languageSet", value);
                window.location.reload();
              }}
            />
          </div>

          {/* <div className="d-flex  align-items-baseline">
            <span className="currency_symbol">
              {country?.data?.currency_symbol}
            </span>
            <span className="currency">({country?.data?.currency})</span>
          </div> */}
          {/* <div className="country-wrap d-none d-lg-block">
            <Select
              disabled={userProfile?.type == "SubAdmin"}
              value={country?.country_id}
              onChange={(value) => onChange("country_id", value)}
            >
              {countries.map((item) => (
                <option key={item._id} value={item._id}>
                  <span className="country_span d-flex">
                    <span>{item.emoji}</span>
                    <span className="countryName">{item.name}</span>
                  </span>
                </option>
              ))}
            </Select>
          </div> */}

          <div className="notificationDropdownMain">
            <div className="notification-header d-lg-block">
              <Dropdown
                menu={{ items: notificationitems }}
                trigger={["click"]}
                className="notification-box"
              >
                <Button>
                  <img src={Notification} />
                  <span className="active_notification"></span>
                </Button>
              </Dropdown>
            </div>
          </div>

          <div className="profileDropdownMain">
            <Dropdown
              open={isOpen}
              onOpenChange={(open) => setIsOpen(open)}
              className="edit-box"
              menu={menuProps}
              trigger={["click"]}
            >
              <Button className="ant-btn ant-btn-default ant-dropdown-trigger ant-dropdown-open">
                <div className=" d-flex align-items-center gap-2">
                  <div className="userImg">
                    <Image src={profile ? Logo : Logo} preview={false} />
                  </div>
                  <div className="d-none d-xl-block">
                    <div className="userName">
                      {profile ? profile?.name : "Administrator"}
                      <DownOutlined />
                    </div>
                  </div>
                </div>
              </Button>
            </Dropdown>
          </div>
        </Col>
      </Row>

      {isLogoutModalVisible && (
        <DeleteModal
          title={"Logout"}
          subtitle={`Are you sure you want to Logout the Application?`}
          show={isLogoutModalVisible}
          hide={() => {
            setIsLogoutModalVisible(false);
          }}
          onOk={() => logout()}
        />
      )}

      {profileVisible && (
        <EditProfile
          show={profileVisible}
          hide={() => {
            setProfileVisible(false);
          }}
          data={selected}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}
      {appSettingVisible && (
        <AppSetting
          show={appSettingVisible}
          hide={() => {
            setAppSettingVisible(false);
          }}
          data={appSettingSelected}
          refresh={() => setRefresh((prev) => !prev)}
        />
      )}

      {visible && (
        <ChangePassword
          show={visible}
          handleCreate={handleCreate}
          hide={() => {
            setVisible(false);
          }}
        />
      )}
    </>
  );
}

const EditProfile = ({ show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState([]);
  const [image, setImage] = useState([]);
  const FileType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/avif",
    "image/webp",
    "image/gif",
  ];

  const beforeUpload = (file) => {
    if (FileType.includes(file.type)) {
    } else {
      message.error("File format is not correct");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      message.error(`Image must be smaller than 5 MB!`);
      return false;
    }
    return true;
  };

  const handleChange = async (event) => {
    const { file } = event;
    setFile([file]);
    const extension = getFileExtension(file.name);
    const name = `PLANIT_${new Date().getTime()}.${extension}`;

    const newFile = new File([file], name, { type: file.type });
    uploadFile(newFile, s3Config("profile"))
      .then((data) => {
        const fileData = {
          uid: file.uid,
          name: name,
          status: "done",
          url: data.location,
          thumbUrl: data.location,
        };
        setFile([fileData]);
        setImage(data.location);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (!data) return;
    form.setFieldsValue({ ...data });
    //setFile([data.image]);
    if (data.image != undefined) {
      setImage(data.image);
    } else {
      setImage([notfound]);
    }
  }, [data]);

  const onEditProfile = (values) => {
    const { email, name } = values;

    if (file.length <= 0 && !image)
      return ShowToast("Please select the profile Image ", Severty.ERROR);
    const payload = {};
    setLoading(true);
    payload.email = email;
    payload.name = name;
    payload.image = file.length > 0 ? file[0].url : null;
    request({
      url: apiPath.updateProfile,
      method: "POST",
      data: payload,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
          hide();
          refresh();
        } else {
          ShowToast(data.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  return (
    <Modal
      open={show}
      // title={`${data ? "Edit Profile" : ""}`}
      okText={lang("Ok")}
      cancelText={lang("Cancel")}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
    >
      <h4 className="modal_title_cls">{lang("Edit Profile")}</h4>
      <Form id="create" form={form} onFinish={onEditProfile} layout="vertical">
        <Row>
          <Col span={24}>
            <Form.Item
              label={lang("Name")}
              name="name"
              rules={[
                { required: true, message: lang("Please enter the name!") },
                {
                  pattern: new RegExp(/^[a-zA-Z ]*$/),
                  message: lang("Only Alphabetic Characters Allowed"),
                },
              ]}
            >
              <Input placeholder={lang("Enter Name")} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
                { required: true, message: "Please enter the email!" },
              ]}
            >
              <Input placeholder="Enter Email Address" disabled />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              className=""
              label="Upload Profile"
              name="image"
              rules={[
                {
                  required: file.length > 0 ? false : true,
                  message: "Please enter the profile image!",
                },
              ]}
            >
              <Upload
                listType="picture"
                maxCount={1}
                beforeUpload={beforeUpload}
                customRequest={handleChange}
                onRemove={(e) => {
                  setFile([]);
                  setImage();
                }}
                fileList={file}
              >
                {file && file.length > 0 ? null : (
                  <Button icon={<UploadOutlined />}>Upload</Button>
                )}
              </Upload>

              {image && (
                <div className="mt-3">
                  <Image width={300} src={image}></Image>
                </div>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export const AppSetting = ({ show, hide, data, refresh }) => {
  const [form] = Form.useForm();
  const { request } = useRequest();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data) return;
    form.setFieldsValue({ ...data });
  }, [data]);

  const onAppSetting = (values) => {
    setLoading(true);
    request({
      url: apiPath.updateAppSetting,
      method: "POST",
      data: values,
      onSuccess: (data) => {
        setLoading(false);
        if (data.status) {
          ShowToast(data.message, Severty.SUCCESS);
          hide();
          refresh();
        } else {
          ShowToast(data.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR);
        setLoading(false);
      },
    });
  };

  return (
    <Modal
      width={1200}
      open={show}
      // title={`${data ? "Update App Setting" : ""}`}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
      okText={lang("Ok")}
      cancelText={lang("Cancel")}
      onCancel={hide}
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        loading: loading,
      }}
    >
      <h4 className="modal_title_cls">Update App Setting</h4>
      <Form id="create" form={form} onFinish={onAppSetting} layout="vertical">
        <Row gutter={{ xs: [0, 16], md: [16, 0] }}>
          <Col span={24} md={12}>
            <Card title="Android Details">
              <Col span={24}>
                <Form.Item
                  label="App Store URL"
                  name="app_store_url"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the app store URL!",
                    },
                  ]}
                >
                  <Input placeholder="Enter App Store URL" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label="Version"
                  name="android_version"
                  rules={[
                    { required: true, message: "Please enter the version!" },
                  ]}
                >
                  <Input placeholder="Enter Android Version" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label="Share Content"
                  name="android_share_content"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the share content!",
                    },
                  ]}
                >
                  <Input.TextArea
                    showCount
                    maxLength={500}
                    style={{ height: 120, marginBottom: 15 }}
                    placeholder="Share Android Content"
                  />
                </Form.Item>
              </Col>
            </Card>
          </Col>

          <Col span={24} md={12}>
            <Card title="IOS Details">
              <Col span={24} className="">
                <Form.Item
                  label="Play Store URL"
                  name="play_store_url"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the play store URL!",
                    },
                  ]}
                >
                  <Input placeholder="Enter Play Store URL" />
                </Form.Item>
              </Col>

              <Col span={24} className="">
                <Form.Item
                  label="Version"
                  name="ios_version"
                  rules={[
                    { required: true, message: "Please enter the version!" },
                  ]}
                >
                  <Input placeholder="Enter IOS Version" />
                </Form.Item>
              </Col>

              <Col span={24} className="">
                <Form.Item
                  label="Share Content"
                  name="ios_share_content"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the share content!",
                    },
                  ]}
                >
                  <Input.TextArea
                    showCount
                    maxLength={500}
                    style={{ height: 120, marginBottom: 15 }}
                    placeholder="Share IOS Content"
                  />
                </Form.Item>
              </Col>
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

const ChangePassword = ({ show, hide, handleCreate }) => {
  const [form] = Form.useForm();
  return (
    <Modal
      open={show}
      // title="Change password"
      okText={lang("Ok")}
      cancelText={lang("Cancel")}
      onCancel={hide}
      //onOk={handleCreate}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="tab_modal"
      okButtonProps={{
        form: "create",
        htmlType: "submit",
        //loading: loading,
      }}
    >
      <h4 className="modal_title_cls">Change Password</h4>
      <Form id="create" form={form} onFinish={handleCreate} layout="vertical">
        <Form.Item
          label="Old Password"
          name="old_password"
          hasFeedback
          rules={[
            { required: true, message: "Please enter the old password!" },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="New Password"
          name="new_password"
          dependencies={["old_password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please enter the new password!" },
            {
              pattern: new RegExp(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/
              ),
              message:
                "New password at least contain 8 characters, at least contain one capital letter, at least contain one small letter, at  least contain one digit, atleast contain one special character",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("old_password") === value) {
                  return Promise.reject(
                    new Error("Old password & new password must be different!")
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Confirm New Password"
          name="confirm_new_password"
          dependencies={["new_password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please enter the confirm password!" },
            {
              pattern: new RegExp(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/
              ),
              message:
                "Confirm password atleast contain 8 characters, atleast contain one captital letter, atleast contain one small letter, atleast contain one digit, atleast contain one special character",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("new_password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Confirm password & password does not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Header;
