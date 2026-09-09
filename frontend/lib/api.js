import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getDevices() {
  const res = await axios.get(`${API_URL}/devices/`);
  return res.data;
}

export async function getDevice(deviceId) {
  const res = await axios.get(`${API_URL}/devices/${deviceId}/`);
  return res.data;
}

export async function toggleLed(deviceId, ledId, state) {
  const res = await axios.post(
    `${API_URL}/devices/${deviceId}/led/${ledId}/toggle/`,
    { state }
  );
  return res.data;
}