"use client";

import UpcomingBooking from "@/components/upcoming-booking";
import { useUpcoming } from "../hooks/use-upcoming";

type Props = { order: string; list: string };

export default function Upcoming ({ order, list }: Props) {

    const next = useUpcoming(order, list);

    return next ? <UpcomingBooking {...next} /> : null;

}
