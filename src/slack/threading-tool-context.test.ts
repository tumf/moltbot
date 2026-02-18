import { describe, expect, it } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
import { buildSlackThreadingToolContext } from "./threading-tool-context.js";

const emptyCfg = {} as OpenClawConfig;

describe("buildSlackThreadingToolContext", () => {
  it("uses top-level replyToMode by default", () => {
    const cfg = {
      channels: {
        slack: { replyToMode: "first" },
      },
    } as OpenClawConfig;
    const result = buildSlackThreadingToolContext({
      cfg,
      accountId: null,
      context: { ChatType: "channel" },
    });
    expect(result.replyToMode).toBe("first");
  });

  it("uses chat-type replyToMode overrides for direct messages when configured", () => {
    const cfg = {
      channels: {
        slack: {
          replyToMode: "off",
          replyToModeByChatType: { direct: "all" },
        },
      },
    } as OpenClawConfig;
    const result = buildSlackThreadingToolContext({
      cfg,
      accountId: null,
      context: { ChatType: "direct" },
    });
    expect(result.replyToMode).toBe("all");
  });

  it("uses top-level replyToMode for channels when no channel override is set", () => {
    const cfg = {
      channels: {
        slack: {
          replyToMode: "off",
          replyToModeByChatType: { direct: "all" },
        },
      },
    } as OpenClawConfig;
    const result = buildSlackThreadingToolContext({
      cfg,
      accountId: null,
      context: { ChatType: "channel" },
    });
    expect(result.replyToMode).toBe("off");
  });

  it("falls back to top-level when no chat-type override is set", () => {
    const cfg = {
      channels: {
        slack: {
          replyToMode: "first",
        },
      },
    } as OpenClawConfig;
    const result = buildSlackThreadingToolContext({
      cfg,
      accountId: null,
      context: { ChatType: "direct" },
    });
    expect(result.replyToMode).toBe("first");
  });

  it("uses legacy dm.replyToMode for direct messages when no chat-type override exists", () => {
    const cfg = {
      channels: {
        slack: {
          replyToMode: "off",
          dm: { replyToMode: "all" },
        },
      },
    } as OpenClawConfig;
    const result = buildSlackThreadingToolContext({
      cfg,
      accountId: null,
      context: { ChatType: "direct" },
    });
    expect(result.replyToMode).toBe("all");
  });

  it("uses all mode when ThreadLabel is present", () => {
    const cfg = {
      channels: {
        slack: { replyToMode: "off" },
      },
    } as OpenClawConfig;
    const result = buildSlackThreadingToolContext({
      cfg,
      accountId: null,
      context: { ChatType: "channel", ThreadLabel: "some-thread" },
    });
    expect(result.replyToMode).toBe("all");
  });

  it("defaults to off when no replyToMode is configured", () => {
    const result = buildSlackThreadingToolContext({
      cfg: emptyCfg,
      accountId: null,
      context: { ChatType: "direct" },
    });
    expect(result.replyToMode).toBe("off");
  });

  it("sets currentChannelId for channel targets", () => {
    const result = buildSlackThreadingToolContext({
      cfg: emptyCfg,
      accountId: null,
      context: { ChatType: "channel", To: "channel:C123" },
    });
    expect(result.currentChannelId).toBe("C123");
  });

  it("sets currentChannelId for direct-message user targets", () => {
    const result = buildSlackThreadingToolContext({
      cfg: emptyCfg,
      accountId: null,
      context: { ChatType: "direct", To: "user:U123" },
    });
    expect(result.currentChannelId).toBe("U123");
  });
});
