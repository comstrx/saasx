"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PingButton() {

    return <Button onClick={() => toast.success("Client runtime OK — UI chain wired.")}>Ping</Button>;

}
