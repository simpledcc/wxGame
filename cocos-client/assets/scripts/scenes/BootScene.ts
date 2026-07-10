import {
  _decorator,
  Button,
  Color,
  Component,
  Graphics,
  Label,
  Node,
  UITransform
} from "cc";
import { app } from "../core/App";

const { ccclass, property } = _decorator;

@ccclass("BootScene")
export class BootScene extends Component {
  @property(Label)
  statusLabel: Label | null = null;

  private gateRoot: Node | null = null;
  private gateStatus: Label | null = null;
  private acceptButton: Button | null = null;
  private contractButton: Button | null = null;
  private entering = false;

  async start(): Promise<void> {
    if (!app.privacy.hasAcceptedCurrentVersion()) {
      this.showPrivacyGate();
      return;
    }
    await this.enterHome();
  }

  private showPrivacyGate(): void {
    if (this.gateRoot) {
      this.gateRoot.active = true;
      return;
    }

    const gate = new Node("PrivacyGate");
    this.node.addChild(gate);
    gate.setPosition(0, 0);
    gate.addComponent(UITransform).setContentSize(960, 640);

    const panel = gate.addComponent(Graphics);
    panel.fillColor = new Color(24, 32, 43, 245);
    panel.roundRect(-420, -260, 840, 520, 16);
    panel.fill();

    this.createText(
      gate,
      "PrivacyTitle",
      "隐私保护提示",
      38,
      165,
      720,
      58
    );
    this.createText(
      gate,
      "PrivacyBody",
      `开始游戏前，请阅读${app.privacy.contractName}\n同意后才会初始化云服务并读取本地游戏记录\n不同意时将停留在当前页面`,
      24,
      55,
      720,
      130
    );

    this.contractButton = this.createButton(
      gate,
      "ContractButton",
      "查看隐私保护指引",
      -90,
      new Color(55, 71, 90, 255),
      () => {
        void this.openContract();
      }
    );
    this.acceptButton = this.createButton(
      gate,
      "AcceptButton",
      "同意并进入",
      -170,
      new Color(36, 160, 110, 255),
      () => {
        void this.acceptAndEnter();
      }
    );
    this.gateStatus = this.createText(
      gate,
      "PrivacyStatus",
      "同意前不会调用云能力",
      20,
      -230,
      720,
      40,
      new Color(190, 205, 220, 255)
    );
    this.gateRoot = gate;
  }

  private async openContract(): Promise<void> {
    try {
      const opened = await app.privacy.openContract();
      if (!opened && this.gateStatus) {
        this.gateStatus.string = "请在微信小游戏内打开隐私保护指引";
      }
    } catch {
      if (this.gateStatus) {
        this.gateStatus.string = "隐私保护指引暂时无法打开，请稍后重试";
      }
    }
  }

  private async acceptAndEnter(): Promise<void> {
    if (this.entering) {
      return;
    }
    app.privacy.acceptCurrentVersion();
    await this.enterHome();
  }

  private async enterHome(): Promise<void> {
    if (this.entering) {
      return;
    }
    this.entering = true;
    this.setControlsEnabled(false);
    this.setStatus("正在初始化...");
    if (this.gateStatus) {
      this.gateStatus.string = "正在连接游戏服务...";
    }
    try {
      await app.boot();
      this.setStatus("初始化完成");
      if (this.gateRoot) {
        this.gateRoot.active = false;
      }
      const joinedInvite = await app.lifecycle.activate();
      const targetRoute = joinedInvite ? app.store.getState().route : "home";
      app.router.enterRuntimeShell(targetRoute);
    } catch {
      this.showPrivacyGate();
      if (this.gateStatus) {
        this.gateStatus.string = "初始化失败，请检查网络后重试";
      }
      this.setStatus("初始化失败");
      this.setControlsEnabled(true);
    } finally {
      this.entering = false;
    }
  }

  private createText(
    parent: Node,
    name: string,
    text: string,
    fontSize: number,
    y: number,
    width: number,
    height: number,
    color = new Color(255, 255, 255, 255)
  ): Label {
    const node = new Node(name);
    parent.addChild(node);
    node.setPosition(0, y);
    node.addComponent(UITransform).setContentSize(width, height);
    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = Math.round(fontSize * 1.45);
    label.color = color;
    label.horizontalAlign = 1;
    label.verticalAlign = 1;
    label.enableWrapText = true;
    return label;
  }

  private createButton(
    parent: Node,
    name: string,
    text: string,
    y: number,
    color: Color,
    handler: () => void
  ): Button {
    const node = new Node(name);
    parent.addChild(node);
    node.setPosition(0, y);
    node.addComponent(UITransform).setContentSize(420, 62);
    const background = node.addComponent(Graphics);
    background.fillColor = color;
    background.roundRect(-210, -31, 420, 62, 10);
    background.fill();
    this.createText(node, `${name}Label`, text, 24, 0, 400, 58);
    const button = node.addComponent(Button);
    node.on(Button.EventType.CLICK, handler, this);
    return button;
  }

  private setControlsEnabled(enabled: boolean): void {
    if (this.acceptButton) {
      this.acceptButton.interactable = enabled;
    }
    if (this.contractButton) {
      this.contractButton.interactable = enabled;
    }
  }

  private setStatus(message: string): void {
    if (this.statusLabel) {
      this.statusLabel.string = message;
    }
  }
}
