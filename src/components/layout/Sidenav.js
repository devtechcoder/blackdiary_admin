import { Image, Menu, Modal, Skeleton } from "antd";
import { Children, useContext, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import Cms from "../../assets/images/side_nav/cms.svg";
import Coust from "../../assets/images/side_nav/customer.svg";
import Dash from "../../assets/images/side_nav/dash.svg";
import Log from "../../assets/images/side_nav/log.svg";
import Logo from "../../assets/images/icon/logo.png";
import { AuthContext } from "../../context/AuthContext";
import lang from "../../helper/langHelper";
import DeleteModal from "../DeleteModal";
import { useAppContext } from "../../context/AppContext";
import moment, { isMoment } from "moment";
import { Severty, ShowToast } from "../../helper/toast";

export const countryWithAreas = [
  "646b2e0f46865f1f65565346", //Palestine
];

export const menuItems = [
  {
    key: "dashboard-management",
    path: "/dashboard",
    icon: Dash,
    label: lang("Dashboard"),
    isShow: true,
  },
  {
    key: "customer-manager",
    path: "/customer",
    label: `${lang("Customer")} ${lang("Management")}`,
    icon: Coust, //
  },
  {
    key: "category-manager",
    path: "/category",
    label: `${lang("Category")} ${lang("Management")}`,
    icon: Coust,
  },
  {
    key: "sub-category-manager",
    path: "/sub-category",
    label: `${lang("Sub Category")} ${lang("Management")}`,
    icon: Coust,
  },
  {
    key: "occasion-manager",
    path: "/occasion",
    label: `${lang("Occasion")} ${lang("Management")}`,
    icon: Coust,
  },
  {
    key: "diary-manager",
    path: "/diary",
    label: `${lang("Diary")} ${lang("Management")}`,
    icon: Coust,
  },

  {
    key: "cms-manager",
    path: "/cms",
    icon: Cms,
    label: `${lang("CMS")} ${lang("Management")}`,
  },
];

function Sidenav({ color }) {
  const { pathname } = useLocation();
  const { userProfile, logout, setUserProfile } = useContext(AuthContext);
  const { country } = useAppContext();

  const [collapsed, setCollapsed] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuLinks, setMenuLinks] = useState([]);
  const [menuMode, setMenuMode] = useState("vertical");
  const [currentDateTime, setCurrentDateTime] = useState(moment());

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const showDeleteConfirm = (record) => {
    setIsLogoutModalVisible(true);
    // logout();
  };

  const renderTitle = (item) => {
    return (
      <>
        <Image preview={false} src={item.icon} />
        <span className="label">{item.label}</span>
      </>
    );
  };

  useEffect(() => {
    setLoading(true);
    if (!userProfile) return;
    if (userProfile.type == "Admin") {
      const items = country && country?.country_id && countryWithAreas.includes(country?.country_id) ? [...menuItems] : menuItems;

      setMenuLinks(items);
      setLoading(false);
      return;
    }

    const items = country && country?.country_id && countryWithAreas.includes(country?.country_id) ? [...menuItems] : menuItems;

    const newArray = items.filter((item) => {
      if (item.isShow) {
        return true;
      } else {
        return userProfile?.permission?.includes(item.key);
      }
    });

    const links = newArray.filter((item) => {
      if (item?.children?.length) {
        return true;
      } else if (!item?.children) {
        return true;
      } else {
        return false;
      }
    });

    setMenuLinks(links);
    setLoading(false);
    setRefresh((x) => !x);
  }, [userProfile, country]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setMenuMode("inline");
      } else {
        setMenuMode("vertical");
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {loading ? (
        [1, 2, 3, 4, 5, 6].map((item) => <Skeleton active key={item} />)
      ) : (
        <>
          <div className="brand-logo">
            <NavLink to="" className="imgOuter">
              <img className="" src={Logo} alt="" />
            </NavLink>
          </div>
          <Menu inlineCollapsed={false} mode={menuMode} className="sideNavMain">
            {menuLinks.map((item) => {
              if (item.children) {
                return (
                  <>
                    <Menu.SubMenu
                      key={item.key}
                      title={
                        <>
                          <span className="icon">
                            <Image preview={false} src={item.icon} />
                          </span>
                          <span className="label">{item.label}</span>
                        </>
                      }
                    >
                      {item.children.map((child) => (
                        <Menu.Item key={child.key}>
                          <NavLink to={child.path}>{child.label}</NavLink>
                        </Menu.Item>
                      ))}
                    </Menu.SubMenu>
                  </>
                );
              }

              return (
                <Menu.Item key={item.key}>
                  <NavLink to={item.path}>{renderTitle(item)}</NavLink>
                </Menu.Item>
              );
            })}

            <Menu.Item onClick={showDeleteConfirm}>
              <NavLink to={"#"}>
                <>
                  <Image preview={false} src={Log} />
                  <span className="label">Logout</span>
                </>
              </NavLink>
            </Menu.Item>
          </Menu>
        </>
      )}
      {isLogoutModalVisible && (
        <DeleteModal
          title={"Logout"}
          subtitle={`Are you sure you want to Logout the Application?`}
          show={isLogoutModalVisible}
          hide={() => {
            setIsLogoutModalVisible(false);
          }}
          onOk={async () => {
            setIsLogoutModalVisible(false); // Close the modal
            try {
              await logout();
            } catch (error) {
              console.error("Logout error:", error);
              ShowToast("Logout failed", Severty.ERROR);
            }
          }}
        />
      )}
    </>
  );
}

export default Sidenav;
