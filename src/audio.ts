// src/audio.ts
import axios from "axios";

export async function downloadOga(url: string): Promise<Buffer> {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data);
}