import React from "react";
import { Book, MessageCircle, Mail, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardContent } from "@/shared/ui/surface-card";

type HelpTopicKey = "documentation" | "supportChat" | "emailSupport" | "faq";

const HELP_TOPIC_KEYS: Array<{
  key: HelpTopicKey;
  descKey: string;
  icon: typeof Book;
  link: string;
}> = [
  { key: "documentation", descKey: "documentationDesc", icon: Book, link: "#" },
  { key: "supportChat", descKey: "supportChatDesc", icon: MessageCircle, link: "#" },
  {
    key: "emailSupport",
    descKey: "emailSupportDesc",
    icon: Mail,
    link: "mailto:support@privatetransfer.com",
  },
  { key: "faq", descKey: "faqDesc", icon: FileText, link: "#" },
];

function HelpTopicsGrid() {
  const { t: translate } = useTranslation("help");

  return (
    <div className="grid grid-cols-2 gap-6">
      {HELP_TOPIC_KEYS.map((topic) => {
        const Icon = topic.icon;
        return (
          <Card key={topic.key}>
            <CardContent className="py-8">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {translate(topic.key)}
                </h3>
                <p className="mb-4 text-gray-600">{translate(topic.descKey)}</p>
                <a
                  href={topic.link}
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  {translate("goLink")}
                </a>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function PopularQuestionsCard() {
  const { t: translate } = useTranslation("help");

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">
          {translate("popularQuestions")}
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="mb-2 font-medium text-gray-900">{translate("q1")}</h3>
          <p className="text-sm text-gray-600">{translate("a1")}</p>
        </div>
        <div className="border-b border-gray-200 pb-4">
          <h3 className="mb-2 font-medium text-gray-900">{translate("q2")}</h3>
          <p className="text-sm text-gray-600">{translate("a2")}</p>
        </div>
        <div>
          <h3 className="mb-2 font-medium text-gray-900">{translate("q3")}</h3>
          <p className="text-sm text-gray-600">{translate("a3")}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function Help() {
  const { t: translate } = useTranslation("help");

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{translate("title")}</h1>
        <p className="mt-1 text-gray-600">{translate("subtitle")}</p>
      </div>

      <HelpTopicsGrid />
      <PopularQuestionsCard />
    </div>
  );
}
