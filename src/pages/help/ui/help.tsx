import { useState } from "react";
import {
  Headphones,
  Mail,
  MessageCircle,
  PhoneCall,
  Send,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";

type SupportMethodKey =
  | "bookCall"
  | "telegram"
  | "email"
  | "linkedin";

type SupportMethod = {
  key: SupportMethodKey;
  hintKey: `${SupportMethodKey}Hint`;
  icon: typeof PhoneCall;
  href?: string;
};

const SUPPORT_METHODS: SupportMethod[] = [
  { key: "bookCall", hintKey: "bookCallHint", icon: PhoneCall },
  {
    key: "telegram",
    hintKey: "telegramHint",
    icon: MessageCircle,
    href: "https://t.me/pasha_arc",
  },
  {
    key: "email",
    hintKey: "emailHint",
    icon: Mail,
    href: "mailto:support@arcn.io",
  },
  { key: "linkedin", hintKey: "linkedinHint", icon: UserRound },
];

function SupportChatCard() {
  const { t: translate } = useTranslation("help");
  const [message, setMessage] = useState("");

  return (
    <section className="support-chat-card ui-card" aria-label={translate("chatTitle")}>
      <div className="support-chat-header">
        <span className="support-icon-frame" aria-hidden="true">
          <Headphones size={17} strokeWidth={1.5} />
        </span>
        <div className="support-chat-header__text">
          <h2 className="support-chat-header__title">{translate("chatTitle")}</h2>
          <p className="support-chat-header__subtitle">{translate("chatSubtitle")}</p>
        </div>
      </div>

      <div className="support-chat-body">
        <div className="support-message-card">
          <MessageCircle size={24} strokeWidth={1.5} aria-hidden="true" />
          <div className="support-message-card__text">
            <p className="support-message-card__title">
              {translate("startConversation")}
            </p>
            <p className="support-message-card__hint">
              {translate("startConversationHint")}
            </p>
          </div>
        </div>
      </div>

      <form
        className="support-chat-input"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <MessageCircle size={18} strokeWidth={1.5} aria-hidden="true" />
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={translate("messagePlaceholder")}
          aria-label={translate("messagePlaceholder")}
        />
        <button
          type="submit"
          className="ui-icon-button support-chat-input__send"
          aria-label={translate("sendMessage")}
          title={translate("sendMessage")}
        >
          <Send size={16} strokeWidth={1.5} />
        </button>
      </form>
    </section>
  );
}

function SupportMethodsAside() {
  const { t: translate } = useTranslation("help");

  return (
    <aside className="support-side">
      <section className="support-ways-heading-card ui-card">
        <h2 className="support-ways-heading-card__title">
          {translate("otherWaysTitle")}
        </h2>
        <p className="support-ways-heading-card__subtitle">
          {translate("otherWaysSubtitle")}
        </p>
      </section>

      <section className="support-methods-card ui-card">
        <div className="support-methods">
          {SUPPORT_METHODS.map((method) => {
            const Icon = method.icon;
            const content = (
              <>
                <span className="support-method__icon" aria-hidden="true">
                  <Icon size={17} strokeWidth={1.5} />
                </span>
                <span>
                  <span className="support-method__title">
                    {translate(method.key)}
                  </span>
                  <span className="support-method__hint">
                    {translate(method.hintKey)}
                  </span>
                </span>
              </>
            );

            if (method.href) {
              const external = method.href.startsWith("http");
              return (
                <a
                  key={method.key}
                  className="support-method"
                  href={method.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                >
                  {content}
                </a>
              );
            }

            return (
              <button key={method.key} className="support-method" type="button">
                {content}
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
}

export function Help() {
  return (
    <div className="help-page">
      <div className="support-route">
        <SupportChatCard />
        <SupportMethodsAside />
      </div>
    </div>
  );
}
