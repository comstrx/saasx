import { StatusBar } from "expo-status-bar";

export default function Status ({ scheme }: { scheme: "light" | "dark" | "auto" }) {

    return <StatusBar style={scheme} />;

}
