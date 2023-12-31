// import { GoogleOAuthProvider } from "@react-oauth/google";
import Axios from "axios";
import { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";

import KakaoLogin from "../components/KakaoLoginButton";
// import NaverLogin from "../components/NaverLogin";
// import GoogleLogin from "../components/GoogleLogin";
import { getError } from "../utils";
export default function SigninScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect") || "/";
  const redirect = redirectInUrl ? redirectInUrl : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  // const client_id =
  //   "258796595331-7cb6sehma9pnihkr8dkhth4apjlkd37j.apps.googleusercontent.com";

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await Axios.post("/api/users/signin", {
        email,
        password,
      });
      ctxDispatch({ type: "USER_SIGNIN", payload: data });
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate(redirect || "/");
    } catch (err) {
      toast.error(getError(err));
    }
  };
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="small-container">
      <Helmet>
        <title>Sign In</title>
      </Helmet>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <div className="mb-3">
          <Button
            type="submit"
            style={{ borderColor: "black" }}
            className="btn btn-dark"
          >
            로그인
          </Button>
        </div>
        <div className="mb-3">
          새로 오셨나요?{" "}
          <Link to={`/signup?redirect=${redirect}`}>가입하기</Link>
        </div>
        <div className="mb-3">
          비밀번호를 잊어버렸나요?{" "}
          <Link to={`/forget-password`}>비밀번호 찾기</Link>
        </div>

        <Form.Group className="mb-3">
          <KakaoLogin />
          {/* <NaverLogin />
          <GoogleOAuthProvider clientId={client_id}>
            <GoogleLogin />
          </GoogleOAuthProvider> */}
        </Form.Group>
      </Form>
    </Container>
  );
}
