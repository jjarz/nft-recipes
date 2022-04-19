import { useLocation } from "react-router";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";

function MenuItems() {
  const { pathname } = useLocation();

  return (
    <Menu
      theme="light"
      mode="horizontal"
      style={{
        display: "flex",
        fontSize: "17px",
        fontWeight: "500",
        width: "100%",
        justifyContent: "center",
      }}
      defaultSelectedKeys={[pathname]}
    >
      <Menu.Item key="/nftBalance">
        <NavLink to="/nftBalance">My NFTs</NavLink>
      </Menu.Item>
      <Menu.Item key="/mint">
        <NavLink to="/mint">Mint</NavLink>
      </Menu.Item>
      <Menu.Item key="/remix">
        <NavLink to="/remix">Remix</NavLink>
      </Menu.Item>
    </Menu>
  );
}

export default MenuItems;
