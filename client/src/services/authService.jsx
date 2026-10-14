import axios from "axios";

const registerUser = async (formData) => {
  const response = await axios.post("/api/auth/register", formData);
  return response.data;
};

const loginUser = async (formData) => {
  const response = await axios.post("/api/auth/login", formData);

  localStorage.setItem("user", JSON.stringify(response.data));

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  return response.data;
};



const getMyProfile = async (payload) => {
  let token = payload.queryKey[1];
  let options = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get("/api/auth/me", options);
  return response.data;
};

const updateProfile = async (payload) => {
  let options = {
    headers: {
      authorization: `Bearer ${payload.token}`,
    },
  };

  const response = await axios.put("/api/auth/me", payload, options);
  console.log(response);
  return response.data;
};





const changePassword = async ({ currentPassword, newPassword }) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    "http://localhost:8080/api/auth/change-password",
    { currentPassword, newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const authService = { registerUser, loginUser, getMyProfile, updateProfile, changePassword };

export default authService;
