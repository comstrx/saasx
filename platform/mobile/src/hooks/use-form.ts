import { bindForm, isDeferred } from "engine/client";
import { client } from "@/hooks/use-client";

export { isDeferred };
export const { useForm } = bindForm(client);
