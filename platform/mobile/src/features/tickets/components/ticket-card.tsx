import { useTranslation } from "react-i18next";
import { CaseCard } from "@/components/case-card";
import type { Ticket } from "@/model/ticket";
import type { ToneName } from "@/theme/roles";

type TicketCardProps = {
    ticket: Ticket;
    at: string;
    onPress: () => void;
};

export const ticketTints: Record<Ticket["status"], ToneName> = {
    pending: "warning",
    resolved: "success",
    closed: "neutral",
};

export function TicketCard ({ ticket, at, onPress }: TicketCardProps) {

    const { t } = useTranslation();

    return (
        <CaseCard
            title={ticket.title}
            reference={`#${ ticket.id }`}
            preview={ticket.content}
            status={t(`tickets.status.${ ticket.status }`)}
            tone={ticketTints[ticket.status]}
            at={at}
            onPress={onPress}
        />
    );

}
