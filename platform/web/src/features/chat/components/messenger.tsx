"use client";

import ChatContacts from "@/components/chat-contacts";
import ChatMessageDialogs from "@/components/chat-message-dialogs";
import ChatMessageInfo from "@/components/chat-message-info";
import ChatRoomDialogs from "@/components/chat-room-dialogs";
import ChatRooms from "@/components/chat-rooms";
import ChatThread from "@/components/chat-thread";
import MessengerLayout from "@/components/messenger-layout";
import SectionSkeleton from "@/components/section-skeleton";
import SettingsLayout from "@/components/settings-layout";
import SignInPrompt from "@/components/sign-in-prompt";
import StateNotice from "@/components/state-notice";
import { quickReactions } from "@/hooks/use-chat-messages";
import { useTranslations } from "@/lib/providers/intl";
import { useMessenger } from "../hooks/use-messenger";

type Props = {
    title: string; description: string; icon?: string | null; tone?: "teal" | "blue" | "ember" | "green" | "amber" | "red";
    links: { login: string; art: string; empty: string };
};

export default function Messenger ({ title, description, icon, tone, links }: Props) {

    const state = useMessenger(links.login);
    const { t, actions, control, contacts } = state;
    const common = useTranslations("common");

    if ( !state.ready ) return <SectionSkeleton />;

    if ( !state.token ) return (

        <SignInPrompt
            level={1} title={title} description={t("signInBody")} href={state.login} label={t("signIn")} art={links.art}
        />

    );

    const threadLabels = {
        back: t("back"), online: t("online"), retry: common("retry"), unavailable: t("unavailable"), emptyTitle: t("threadEmptyTitle"),
        emptyBody: t("threadEmptyBody"), blocked: t("blockedNote"), muted: t("mutedNote"),
        message: {
            reactionCount: ( emoji: string, count: number ) => t("reactionCount", { emoji, count }),
            tools: {
                react: t("react"), reactWith: ( emoji: string ) => t("reactWith", { emoji }), actions: t("messageActions"),
                reply: t("reply"),
                copy: t("copy"), edit: t("edit"), forward: t("forward"), star: t("star"), unstar: t("unstar"), pin: t("pin"),
                unpin: t("unpin"), delete: t("delete"), info: t("info.open"),
            },
        },
        room: {
            actions: t("roomActions"), report: t("reportRoom"), delete: t("deleteRoom"),
            toggles: {
                pinned: { on: t("toggles.pinned.on"), off: t("toggles.pinned.off") },
                muted: { on: t("toggles.muted.on"), off: t("toggles.muted.off") },
                archived: { on: t("toggles.archived.on"), off: t("toggles.archived.off") },
                blocked: { on: t("toggles.blocked.on"), off: t("toggles.blocked.off") },
            },
        },
    };
    const conversation = state.conversation;
    const update = state.updates.thread;

    return (

        <SettingsLayout title={title} description={description} icon={icon} tone={tone}>

            <MessengerLayout
                list={(

                    <ChatRooms
                        tabs={state.tabs} tab={state.tab} rooms={state.rooms} filter={state.filter} contacting={state.contacting}
                        art={links.empty}
                        loading={state.tab === "updates" ? state.updates.loading : state.loading}
                        failed={state.tab === "updates" ? state.updates.failed : state.failed}
                        found={state.finder}
                        onFilter={state.setFilter} onSupport={() => { void state.contact(); }} onCompose={() => contacts.setOpen(true)}
                        onReload={state.tab === "updates" ? state.updates.reload : state.reload}
                        labels={{
                            tabs: t("tabsLabel"), search: t("search"), support: t("support"), compose: t("compose"), retry: common("retry"),
                            unavailable: t("unavailable"), emptyTitle: t(`empty.${state.tab}.title`),
                            emptyBody: t(`empty.${state.tab}.body`),
                            results: t("results"), noResults: t("noResults"), pinned: t("pinnedNote"), muted: t("mutedNote"),
                        }}
                    />

                )}
                thread={conversation ? (

                    <ChatThread
                        title={conversation.title} image={conversation.image} online={conversation.online} messages={conversation.messages}
                        loading={conversation.loading} failed={conversation.failed} back={state.back} emojis={quickReactions}
                        flags={state.settings} busy={control.pending} onReload={conversation.reload} labels={threadLabels}
                        room={{
                            onToggle: ( key ) => { void control.toggle(key); },
                            onReport: () => control.setAsked("report"), onDelete: () => control.setAsked("delete"),
                        }}
                        composer={{
                            draft: state.draft, files: state.files, sending: state.sending, error: state.sendError,
                            replying: actions.replying, onDraft: state.setDraft, onSend: () => { void state.submit(); },
                            onFiles: state.addFiles, onRemoveFile: state.removeFile, onCancelReply: () => actions.setReplying(null),
                            labels: {
                                message: t("message"), send: t("send"), attach: t("attach"), cancelReply: t("cancelReply"),
                                replyingTo: ( author: string ) => t("replyingTo", { author }),
                                removeFile: ( name: string ) => t("removeFile", { name }),
                            },
                        }}
                        actions={{
                            onReact: ( message, emoji ) => { void actions.toggleReaction(message.id, emoji, message.reaction); },
                            onReply: ( message ) => actions.setReplying({
                                id: message.id, author: message.author, text: message.text || t("attachment"),
                            }),
                            onCopy: ( message ) => { void actions.copy(message.text); },
                            onEdit: ( message ) => actions.setEditing({ id: message.id, content: message.text }),
                            onForward: ( message ) => actions.setForwarding(message.id),
                            onStar: ( message ) => { void actions.toggleStar(message.id, message.starred); },
                            onPin: ( message ) => { void actions.togglePin(message.id, message.pinned); },
                            onDelete: ( message ) => { void actions.discard(message.id); },
                            onInfo: ( message ) => actions.setInspecting(message.id),
                        }}
                    />

                ) : update ? (

                    <ChatThread
                        title={update.title} image={update.image} online={false} loading={update.loading} failed={update.failed}
                        messages={update.messages} back={state.back} flags={state.settings} busy={false}
                        onReload={update.reload} labels={threadLabels} room={null} composer={null}
                        emojis={quickReactions}
                        actions={{
                            onReact: ( message, emoji ) => { void state.notices.toggleReaction(message.id, emoji, message.reaction); },
                            onCopy: ( message ) => { void state.notices.copy(message.text); },
                            onStar: ( message ) => { void state.notices.toggleStar(message.id, message.starred); },
                            onPin: ( message ) => { void state.notices.togglePin(message.id, message.pinned); },
                            onInfo: ( message ) => state.notices.setInspecting(message.id),
                        }}
                    />

                ) : null}
                placeholder={<StateNotice compact art={links.empty} title={t("pickTitle")} description={t("pickBody")} />}
            />

            <ChatMessageDialogs
                editing={actions.editing} editPending={actions.editPending} editError={actions.editError}
                forwarding={actions.forwarding != null} forwardPending={actions.forwardPending} targets={state.targets}
                labels={{
                    close: t("close"), editTitle: t("editTitle"), message: t("message"), save: t("save"), forwardTitle: t("forwardTitle"),
                    forwardBody: t("forwardBody"), noTargets: t("noTargets"),
                }}
                onEditChange={( content ) => actions.setEditing(actions.editing ? { ...actions.editing, content } : null)}
                onEditClose={() => actions.setEditing(null)} onSave={() => { void actions.saveEdit(); }}
                onForwardClose={() => actions.setForwarding(null)} onForward={( roomId ) => { void actions.sendForward(roomId); }}
            />

            <ChatMessageInfo
                {...state.info}
                labels={{ title: t("info.title"), close: t("close"), retry: common("retry"), unavailable: t("unavailable") }}
            />

            <ChatRoomDialogs
                asked={control.asked} name={conversation?.title ?? ""} reason={control.reason} content={control.content}
                reporting={control.reporting} erasing={control.erasing} error={control.reportError}
                labels={{
                    close: t("close"), reportTitle: t("reportTitle"), reportBody: t("reportBody"), reason: t("reportReason"),
                    details: t("reportDetails"), send: t("reportSend"), deleteTitle: t("deleteTitle"), deleteBody: t("deleteBody"),
                    delete: t("deleteRoom"), destroy: t("destroyRoom"), destroyHint: t("destroyHint"),
                }}
                onClose={() => control.setAsked(null)} onReason={control.setReason} onContent={control.setContent}
                onSend={() => { void control.send(); }} onErase={( forever ) => { void control.erase(forever); }}
            />

            <ChatContacts
                open={contacts.open} query={contacts.query} loading={contacts.loading} failed={contacts.failed} selected={contacts.selected}
                items={contacts.items} onOpenChange={contacts.setOpen} onQuery={contacts.setQuery} onReload={contacts.reload}
                onChoose={( id ) => { void contacts.choose(id); }}
                labels={{
                    title: t("contactsTitle"), body: t("contactsBody"), close: t("close"), search: t("contactsSearch"),
                    empty: t("contactsEmpty"),
                    retry: common("retry"), unavailable: t("unavailable"), opening: t("opening"),
                }}
            />

        </SettingsLayout>

    );

}
