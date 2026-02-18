import type {
  ChannelThreadingContext,
  ChannelThreadingToolContext,
} from "../channels/plugins/types.js";
import type { OpenClawConfig } from "../config/config.js";
import { resolveSlackAccount, resolveSlackReplyToMode } from "./accounts.js";

export function buildSlackThreadingToolContext(params: {
  cfg: OpenClawConfig;
  accountId?: string | null;
  context: ChannelThreadingContext;
  hasRepliedRef?: { value: boolean };
}): ChannelThreadingToolContext {
  const account = resolveSlackAccount({
    cfg: params.cfg,
    accountId: params.accountId,
  });
  const configuredReplyToMode = resolveSlackReplyToMode(account, params.context.ChatType);
  const effectiveReplyToMode = params.context.ThreadLabel ? "all" : configuredReplyToMode;
  const threadId = params.context.MessageThreadId ?? params.context.ReplyToId;
  const to = params.context.To?.trim() || "";
  const chatType = (params.context.ChatType ?? "").toLowerCase();

  // Slack targets can be either channel:* (roomish) or user:* (DM). We keep a
  // normalized identifier here so `resolveThreadTsFromContext()` can decide
  // whether to auto-inject threadTs for tool calls.
  const currentChannelId = to.startsWith("channel:")
    ? to.slice("channel:".length)
    : chatType === "direct" && to.startsWith("user:")
      ? to.slice("user:".length)
      : undefined;

  return {
    currentChannelId,
    currentThreadTs: threadId != null ? String(threadId) : undefined,
    replyToMode: effectiveReplyToMode,
    hasRepliedRef: params.hasRepliedRef,
  };
}
