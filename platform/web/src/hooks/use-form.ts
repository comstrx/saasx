"use client";

import { bindForm, isDeferred } from "engine/context";
import { client } from "@/hooks/use-client";

export { isDeferred };
export const { useForm } = bindForm(client);
