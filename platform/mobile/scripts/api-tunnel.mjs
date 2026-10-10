import { connect } from "@expo/ngrok";

const url = await connect({ addr: 8000, proto: "http" });

console.warn(`TUNNEL_URL=${ url }`);

await new Promise(() => {});
