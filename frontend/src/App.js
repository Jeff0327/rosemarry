import axios from "axios";
import { useContext, useEffect, useReducer, useState } from "react";
import Badge from "react-bootstrap/Badge";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Navbar from "react-bootstrap/Navbar";
import { LinkContainer } from "react-router-bootstrap";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Store } from "./Store";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import SearchBox from "./components/SearchBox";
import CartScreen from "./screens/CartScreen";
import DashboardScreen from "./screens/DashboardScreen";
import ForgetPasswordScreen from "./screens/ForgetPasswordScreen";
import HomeScreen from "./screens/HomeScreen";
import OrderHistoryScreen from "./screens/OrderHistoryScreen";
import OrderListScreen from "./screens/OrderListScreen";
import OrderScreen from "./screens/OrderScreen";
import PaymentMethodScreen from "./screens/PaymentMethodScreen";
import PlaceOrderScreen from "./screens/PlaceOrderScreen";
import ProductEditScreen from "./screens/ProductEditScreen";
import ProductListScreen from "./screens/ProductListScreen";
import ProductScreen from "./screens/ProductScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import SearchScreen from "./screens/SearchScreen";
import ServiceScreen from "./screens/ServiceScreen";
import ShippingAddressScreen from "./screens/ShippingAddressScreen";
import SigninScreen from "./screens/SigninScreen";
import SignupScreen from "./screens/SignupScreen";
import UserEditScreen from "./screens/UserEditScreen";
import UserListScreen from "./screens/UserListScreen";
import { getError } from "./utils";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        payload: action.payload,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
function App() {
  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });
  const { state, dispatch: ctxDispatch } = useContext(Store);

  const { cart, userInfo, kakaoUser } = state;

  const signoutHandler = () => {
    ctxDispatch({ type: "USER_SIGNOUT" });
    localStorage.removeItem("userInfo");
    localStorage.removeItem("shippingAddress");
    localStorage.removeItem("detailAddress");
    localStorage.removeItem("paymentMethod");
    localStorage.removeItem("kakaoUser");
    window.location.href = "/signin";
  };

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/products/categories`);
        const reorderedCategories = findEventValue([...data]);
        setCategories(reorderedCategories);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);
  const onPopKBAuthMark = () => {
    const popup = window.open(
      "",
      "KB_AUTHMARK",
      "height=604, width=648, status=yes, toolbar=no, menubar=no, location=no"
    );
    if (popup) {
      const checkClosedInterval = setInterval(() => {
        // Perform actions when the popup is closed
        if (popup.closed) {
          clearInterval(checkClosedInterval);

          // Code to execute when the popup is closed
          console.log("Popup is closed!");
          // Add your specific actions here
        }
      }, 1000); // Check every second (adjust as needed)
    }

    document.KB_AUTHMARK_FORM.action = "https://okbfex.kbstar.com/quics";
    document.KB_AUTHMARK_FORM.target = "KB_AUTHMARK";
    document.KB_AUTHMARK_FORM.submit();
  };

  const findEventValue = (arr) => {
    const index = arr.indexOf("이벤트");
    if (index !== -1) {
      const eventElement = arr.splice(index, 1)[0];
      arr.unshift(eventElement);
    }
    return arr;
  };

  return (
    <BrowserRouter>
      {!loading && (
        <div>
          <ToastContainer position="bottom-center" limit={1} />
          <header>
            <Navbar bg="white" expand="lg">
              <Container>
                <LinkContainer to="/">
                  <Navbar.Brand className="title-name">RoseMarry</Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                {/*오른쪽 사이드버튼 */}
                <Navbar.Collapse id="basic-navbar-nav">
                  <SearchBox />

                  <Nav className="me-auto  w-100  justify-content-end align-items-center d-flex">
                    <Link to="/cart" className="nav-link">
                      <img
                        src={`${process.env.PUBLIC_URL}/images/cartImg.png`}
                        className="Aligning images"
                        style={{
                          width: 30,
                          height: 30,
                          alignSelf: "center",
                        }}
                        alt="cart"
                      />

                      {cart.cartItems.length > 0 && (
                        <Badge pill bg="danger">
                          {cart.cartItems.reduce(
                            (a, c) => a + c.color.selectColor.quantity,
                            0
                          )}
                        </Badge>
                      )}
                    </Link>
                    <Link to="/service" className="nav-link text-bold">
                      도움말
                    </Link>
                    {userInfo ? (
                      <NavDropdown
                        className="userInfoText"
                        title={userInfo.name}
                        id="basic-nav-dropdown"
                      >
                        <LinkContainer to="/profile">
                          <NavDropdown.Item>프로필</NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/orderhistory">
                          <NavDropdown.Item>주문내역</NavDropdown.Item>
                        </LinkContainer>
                        <NavDropdown.Divider />
                        <Link
                          className="dropdown-item"
                          to="#signout"
                          onClick={signoutHandler}
                        >
                          로그아웃
                        </Link>
                      </NavDropdown>
                    ) : kakaoUser ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={`${process.env.PUBLIC_URL}/images/kakaotalk-logo.png`}
                          alt="카카오_이미지"
                          className="social-profileIcon-img"
                        />
                        <NavDropdown
                          title={kakaoUser.email}
                          id="basic-nav-dropdown"
                        >
                          <LinkContainer to="/orderhistory">
                            <NavDropdown.Item>주문내역</NavDropdown.Item>
                          </LinkContainer>
                          <NavDropdown.Divider />
                          <Link
                            className="dropdown-item"
                            to="#signout"
                            onClick={signoutHandler}
                          >
                            로그아웃
                          </Link>
                        </NavDropdown>
                      </div>
                    ) : (
                      <Link className="nav-link loginText" to="/signin">
                        로그인
                      </Link>
                    )}
                    {userInfo && userInfo.isAdmin && (
                      <NavDropdown title="Admin" id="admin-nav-dropdown">
                        <LinkContainer to="/admin/dashboard">
                          <NavDropdown.Item>통계</NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/admin/products">
                          <NavDropdown.Item>상품목록</NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/admin/orders">
                          <NavDropdown.Item>주문목록</NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/admin/users">
                          <NavDropdown.Item>유저목록</NavDropdown.Item>
                        </LinkContainer>
                      </NavDropdown>
                    )}
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
          </header>
          <div className="mainImage">
            {categories.map((category) => (
              <Nav.Item key={category} className="categoryItem">
                <LinkContainer
                  to={{
                    pathname: "/search",
                    search: `category=${category}`,
                  }}
                >
                  <Nav.Link>
                    <p className="categoryText">{category}</p>
                  </Nav.Link>
                </LinkContainer>
              </Nav.Item>
            ))}
          </div>
          <main style={{ display: "flex", minHeight: "80vh" }}>
            <Container className="mt-3">
              <Routes>
                <Route path="/product/:slug" element={<ProductScreen />} />
                <Route path="/cart" element={<CartScreen />} />
                <Route path="/service" element={<ServiceScreen />} />
                <Route path="/search" element={<SearchScreen />} />
                <Route path="/signin" element={<SigninScreen />} />
                <Route path="/signup" element={<SignupScreen />} />

                <Route
                  path="/forget-password"
                  element={<ForgetPasswordScreen />}
                />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPasswordScreen />}
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfileScreen />
                    </ProtectedRoute>
                  }
                />
                <Route path="/placeorder" element={<PlaceOrderScreen />} />
                <Route
                  path="/order/:id"
                  element={
                    <ProtectedRoute>
                      <OrderScreen />
                    </ProtectedRoute>
                  }
                ></Route>
                <Route
                  path="/orderhistory"
                  element={
                    <ProtectedRoute>
                      <OrderHistoryScreen />
                    </ProtectedRoute>
                  }
                ></Route>
                <Route
                  path="/shipping"
                  element={<ShippingAddressScreen />}
                ></Route>
                <Route
                  path="/payment"
                  element={<PaymentMethodScreen />}
                ></Route>
                {/*Admin Routed*/}
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <DashboardScreen />
                    </AdminRoute>
                  }
                ></Route>
                <Route
                  path="/admin/products"
                  element={
                    <AdminRoute>
                      <ProductListScreen />
                    </AdminRoute>
                  }
                ></Route>
                <Route
                  path="/admin/product/:id"
                  element={
                    <AdminRoute>
                      <ProductEditScreen />
                    </AdminRoute>
                  }
                ></Route>
                <Route
                  path="/admin/orders"
                  element={
                    <AdminRoute>
                      <OrderListScreen />
                    </AdminRoute>
                  }
                ></Route>
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <UserListScreen />
                    </AdminRoute>
                  }
                ></Route>

                <Route
                  path="/admin/user/:id"
                  element={
                    <AdminRoute>
                      <UserEditScreen />
                    </AdminRoute>
                  }
                ></Route>
                <Route path="/" element={<HomeScreen />} />
              </Routes>
            </Container>
          </main>
          <footer>
            <div className="footer-contents">
              상호: 로즈메리 | 대표자: 김지섭 | 주소: 군산시 오식도동 806-3
              한성필하우스 107/1304 | 연락처: 070-8989-7591 | E-mail:
              rosemarry0719@gmail.com | 사업자 등록번호: 531-20-02039 |
              통신판매업신고 : 2023-전북군산-0484
              <br />
              <a
                href="http://www.ftc.go.kr/bizCommPop.do?wrkr_no=5312002039"
                target="_blank"
                className="footerTextLink"
                title="사업자정보확인"
                rel="noreferrer"
              >
                (사업자정보확인)|
              </a>
              <Link to="/service#privacy" className="footerTextLink">
                개인정보처리방침|
              </Link>
              <a href="/service#terms" className="footerTextLink">
                이용약관
              </a>
            </div>
            <div className="markContainer">
              <form name="KB_AUTHMARK_FORM" method="get">
                <input type="hidden" name="page" value="C021590" />
                <input type="hidden" name="cc" value="b034066:b035526" />
                <input
                  type="hidden"
                  name="mHValue"
                  value="6ba1766548b9295ff6787f2f38752382"
                />
              </form>
              <button
                onClick={onPopKBAuthMark}
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <img
                  style={{ width: "50px", height: "50px" }}
                  src="https://img1.kbstar.com/img/escrow/escrowcmark.gif"
                  border="0"
                  alt="KB Auth Mark"
                />
              </button>
            </div>
          </footer>
        </div>
      )}
    </BrowserRouter>
  );
}
export default App;
