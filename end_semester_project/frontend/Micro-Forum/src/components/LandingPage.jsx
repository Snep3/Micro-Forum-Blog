import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./landingPage.css";
import notTwitterLogo from "../images/notTwitter.png";

const API_URL = "http://localhost:5000";

export default function LandingPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Function to clear message after 10 seconds delay
  // will be used later for success and error messages
  const clearMessage = () => {
    setTimeout(() => {
      setMessage("");
      setError("");
    }, 10000);
  };

  // Register function to create a new user with the givern { username, password }
  const register = async () => {
    try {
      await axios.post(`${API_URL}/users/register`, { username, password });
      setMessage("Registration successful :D");
      clearMessage();
    } catch (err) {
      console.error(err);
      setError("Registration failed >:(");
      clearMessage();
    }
  };

  const login = async () => {
    try {
      // Attempt to login with the given username and password
      // if successful, the server will return a token to onLogin and it will be saved in the App.jsx cuasing postpage to be opened
      const res = await axios.post(`${API_URL}/users/login`, {
        username,
        password,
      });
      const token = res.data.token;
      setMessage("Login successful! :D");
      onLogin(token);
      clearMessage();
    } catch (err) {
      console.error(err);
      setError("Login failed >:(");
      clearMessage();
    }
  };

  return (
    <div
      className="vh-100  d-flex justify-content-center align-items-center"
      style={{ background: "linear-gradient(145deg, #0c1c2e, #060e1a)" }}
    >
      <div
        className="card p-5 rounded-5 text-light shadow-lg"
        style={{
          backgroundColor: "#1b2735",
          width: "100%",
          maxWidth: "400px",
          minHeight: "400px",
        }}
      >
        {/* logo */}
        <div className="LandingHeader d-flex align-items-center gap-2">
          <img src={notTwitterLogo} />
          <p className="mt-3">WorseTwitter</p>
        </div>

        {/* inputs - username and password*/}

        <div className="LandingInputs m-4">
          <p className="fs-5 fw-bold">Sign Up / Login:</p>
          <div className="d-flex flex-column align-items-center gap-4">
            <input
              className="UsernameInput input-group-text border-0 rounded-3 text-start w-100"
              style={{ backgroundColor: "#1e2d44", color: "#9bafcdff" }}
              placeholder="Username.."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="PasswordInput input-group-text border-0 rounded-3 text-start w-100"
              style={{ backgroundColor: "#1e2d44", color: "#9bafcdff" }}
              type="password"
              placeholder="Password.."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {message && <div className="message_success">{message}</div>}
          {error && <div className="message_error">{error}</div>}
        </div>
        {/* buttons - Sign Up and Login */}
        <div className="LandingBtn">
          <div className="button-group d-flex justify-content-center gap-4 mt-3 mb-3">
            <button className="landing_btn p-2 ps-3 pe-3" onClick={register}>
              Sign Up
            </button>
            <button className="landing_btn p-2 ps-4 pe-4" onClick={login}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
