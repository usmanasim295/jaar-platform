"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

import { Link as LinkIcon, Microphone } from "@/components/assets/icons";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Chats } from "@/components/modals/type";

import { useTranslation } from "react-i18next";
const MessagesChats = dynamic(
  () => import("@/components/modals/MessagesChats"),
  {
    ssr: false,
    loading: () => <p>Loading chat...</p>,
  },
);
export default function ChatUI() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chats | null>(null);

  return (
    <div className="max-w-[1400px] sm:px-[60px] px-3 mx-auto mt-8 font-jakarta mb-4 relative">
      <title>Messages</title>
      <h2 className="font-semibold typo-heading3  ">{t("Messages")}</h2>
      <div className=" shadow-dark rounded-xl flex flex-col lg:flex-row mt-6 sm:h-[75vh] overflow-hidden ">
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <div
          className={`absolute top-0 left-0 h-full w-3/4 sm:w-[300px] bg-white border-x border-[#F3F3F3]  transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-[360px] ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <MessagesChats
            setSelectedChat={setSelectedChat}
            selectedChat={selectedChat}
          />
        </div>

        <div className="w-full lg:w-[75%] flex flex-col bg-(--white)">
          <div className="flex items-center justify-between gap-3 rounded-2xlp-[16px] border-b border-[#E6E6E6]">
            <div className="flex items-center gap-3 pt-4 pb-5 pl-6">
              <button
                className="lg:hidden p-1 rounded hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>

              <img
                src={selectedChat?.img}
                alt="User"
                width={56}
                height={56}
                className="rounded-full"
              />
              <div className="relative">
                <span className=" absolute -left-8 -bottom-7 ml-1 h-3.5 w-3.5 bg-[#0EC72C] rounded-full"></span>
              </div>
              <div>
                <p className="font-medium typo-heading3 text-[#333333]">
                  {selectedChat?.name}
                </p>
              </div>
            </div>
          </div>

          <div
            className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-140px)] sm:max-h-[calc(85vh-120px)]"
            dir="ltr"
          >
            {selectedChat?.messages.map((msg) =>
              msg.type === "text" ? (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${
                    msg.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender !== "me" && (
                    <img
                      src={selectedChat.img}
                      alt="User"
                      width={24}
                      height={24}
                      className="rounded-full shrink-0"
                    />
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-2xl p-3 rounded-xl typo-body font-normal break-words leading-5 ${
                      msg.sender === "me"
                        ? "bg-(--primary) text-(--white)"
                        : "bg-(--light-grey) text-[#303030]"
                    }`}
                  >
                    {msg.content}
                    {msg.sender !== "me" ? (
                      <div className="typo-small mt-2.5 text-(--grey-text) leading-4">
                        {msg.time}
                      </div>
                    ) : (
                      <div className="typo-small mt-2.5 text-(--white) leading-4">
                        {msg.time}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  key={msg.id}
                  className="flex justify-start items-start gap-2 w-full"
                >
                  <img
                    src={selectedChat.img}
                    alt="User"
                    width={24}
                    height={24}
                    className="rounded-full shrink-0"
                  />
                  <div className="bg-gray-100 p-3 rounded-xl max-w-[85%] sm:max-w-2xl relative break-words">
                    <p className="text-(--primary) font-normal typo-heading3 ">
                      {msg.content}
                    </p>
                    <div className="absolute right-3 top-3 flex gap-2">
                      <button className="bg-(--danger) text-(--white) px-[9.5px] py-[5.5px] rounded-lg cursor-pointer">
                        <X size={24} />
                      </button>
                      <button className="bg-[#00A400] text-(--white) px-3 py-1 rounded-lg cursor-pointer typo-small font-medium">
                        {t("Accept")}
                      </button>
                    </div>
                    <p className="font-semibold mt-4 typo-label text-(--primary-black)">
                      {msg.offerTitle}
                    </p>
                    <p className="font-normal typo-body text-(--primary-black)">
                      {msg.offerDescription}
                    </p>
                    <div className="flex justify-between items-center mt-[10px]">
                      <div className="typo-small text-(--grey-text)">
                        {msg.time}
                      </div>
                      <Link href={`/job/${msg?.id}`}>
                        <button className="text-(--primary) typo-small font-semibold cursor-pointer">
                          {t("View Proposal")}
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-(--light-grey) flex items-center gap-2">
            <div className="flex items-center p-2 rounded-full bg-(--light-grey) gap-2 flex-1 h-[50px]">
              <input
                type="text"
                placeholder={t("Type your message...")}
                className="flex-1 rounded-full border-none outline-none text-sm px-4"
              />
              <button className="cursor-pointer">
                <LinkIcon />
              </button>
            </div>
            <button className="bg-(--primary) p-2 rounded-full cursor-pointer">
              <Microphone />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
