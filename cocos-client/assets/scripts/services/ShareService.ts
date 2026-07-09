import type { RuntimePort, ShareMessageOptions } from "../adapters/RuntimePort";
import type { PrivacyService } from "./PrivacyService";

export type ShareRoomResult = "shared" | "copied";

function normalizeRoomCode(roomCode: string): string {
  return roomCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

export class ShareService {
  constructor(
    private readonly runtime: RuntimePort,
    private readonly privacy: PrivacyService
  ) {}

  async shareRoom(roomCode: string, modeLabel: string): Promise<ShareRoomResult> {
    this.privacy.requireAccepted("share");
    const normalizedCode = normalizeRoomCode(roomCode);
    const options: ShareMessageOptions = {
      title: `邀请你加入${modeLabel} · 房间${normalizedCode}`,
      query: `invite=1&roomCode=${encodeURIComponent(normalizedCode)}`
    };
    if (await this.runtime.shareAppMessage(options)) {
      return "shared";
    }
    await this.copyRoomCode(normalizedCode);
    return "copied";
  }

  async copyRoomCode(roomCode: string): Promise<void> {
    this.privacy.requireAccepted("share");
    const normalizedCode = normalizeRoomCode(roomCode);
    await this.runtime.setClipboardText(normalizedCode);
    this.runtime.showToast("房间码已复制");
  }
}
