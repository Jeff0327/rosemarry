import axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";
import Button from "react-bootstrap/esm/Button";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Store } from "../Store";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox.js";
import { getError } from "../utils";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, orders: action.payload, loading: false };
    case "SOCIAL_FETCH_SUCCESS":
      return { ...state, orders: action.payload, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function OrderHistoryScreen() {
  const { state } = useContext(Store);
  const { userInfo, kakaoUser } = state;
  const navigate = useNavigate();

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const { data } = await axios.get(
          "/api/orders/mine",

          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
              withCredentials: true,
            },
          }
        );
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (error) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(error),
        });
      }
    };
    const fetchSocialData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const { data } = await axios.get(
          "/api/socialOrders/mine",

          {
            headers: {
              Authorization: `Bearer ${kakaoUser.kakaoToken}`,
              withCredentials: true,
            },
          }
        );
        dispatch({ type: "SOCIAL_FETCH_SUCCESS", payload: data });
      } catch (error) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(error),
        });
      }
    };
    if (userInfo) {
      fetchData();
    } else if (kakaoUser) {
      fetchSocialData();
    }
  }, [userInfo, kakaoUser]);
  return (
    <div>
      <Helmet>
        <title>주문내역</title>
      </Helmet>

      <h1>주문내역</h1>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>주문ID</th>
              <th>날짜</th>
              <th>결제금액</th>
              <th>결제상태</th>
              <th>배송상태</th>
              <th>기타</th>
            </tr>
          </thead>
          <tbody>
            {console.log(orders)}
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>{order.totalPrice.toLocaleString()}</td>
                <td>{order.isPaid ? order.paidAt.substring(0, 10) : "No"}</td>
                <td>
                  {order.isDelivered
                    ? order.deliveredAt.substring(0, 10)
                    : "No"}
                </td>
                <td>
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => {
                      navigate(`/order/${order._id}`);
                    }}
                  >
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
