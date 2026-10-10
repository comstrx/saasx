import { useLocalSearchParams } from "expo-router";
import { LegalScreen } from "@/features/legal";

export default function LegalRoute () {

    const { page } = useLocalSearchParams<{ page: string }>();

    return <LegalScreen page={page ?? ""} />;

}
