import React, { useState } from 'react';
import useStore from '@store/store';
import MessageContent from './MessageContent';
import useSubmit from '@hooks/useSubmit';
import { ChatInterface } from '@type/chat';
import { Role } from '@type/chat';
import SendIcon from '@icon/SendIcon2';

const Message = React.memo(
  ({
    role,
    content,
    messageIndex,
    sticky = false,
  }: {
    role: Role;
    content: string;
    messageIndex: number;
    sticky?: boolean;
  }) => {
    const hideSideMenu = useStore((state) => state.hideSideMenu);
    const currentChatIndex = useStore((state) => state.currentChatIndex);
    const inputRole = useStore((state) => state.inputRole);
    const setChats = useStore((state) => state.setChats);

    const { handleSubmit } = useSubmit();
    const handleSaveAndSubmit = (_content: string) => {
      const updatedChats: ChatInterface[] = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );
      const updatedMessages = updatedChats[currentChatIndex].messages;
      if (_content !== '') {
        updatedMessages.push({ role: inputRole, content: _content });
      }
      setChats(updatedChats);
      handleSubmit(_content);
    };
    const handle = (msg: string) => {
      handleSaveAndSubmit(msg);
    };
    const questions = [
      {
        id: 1,
        question: '本书的重点是什么',
      },
    ];
    return (
      <div
        className={`w-full text-gray-800 dark:text-gray-100 flex py-4 ${
          messageIndex % 2 ? 'justify-end' : 'justify-start'
        } `}
      >
        {!(messageIndex % 2) && (
          <div className='h-10 w-10 rounded-xl inline-flex items-center justify-center text-2xl mr-2 text-white'>
<svg width="102" height="102" viewBox="0 0 102 102" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.182007" y="0.182007" width="101" height="101" rx="29" fill="url(#paint0_linear_0_1)"/>
<path d="M39.4086 20.4446C44.864 12.5747 56.5 12.5747 61.9555 20.4446V20.4446C64.2912 23.814 68.0118 25.9621 72.0977 26.3002V26.3002C81.6409 27.0899 87.4589 37.1669 83.3712 45.8264V45.8264C81.621 49.534 81.621 53.83 83.3712 57.5376V57.5376C87.4589 66.1971 81.6409 76.2742 72.0977 77.0638V77.0638C68.0118 77.4019 64.2912 79.55 61.9555 82.9195V82.9195C56.5 90.7893 44.864 90.7893 39.4086 82.9195V82.9195C37.0728 79.55 33.3523 77.4019 29.2663 77.0638V77.0638C19.7231 76.2742 13.9051 66.1971 17.9929 57.5376V57.5376C19.743 53.83 19.743 49.534 17.9929 45.8264V45.8264C13.9051 37.1669 19.7231 27.0899 29.2663 26.3002V26.3002C33.3523 25.9621 37.0728 23.814 39.4086 20.4446V20.4446Z" stroke="white" stroke-width="2"/>
<path d="M55.4273 24.5923C62.5793 21.2161 70.9022 26.0213 71.5544 33.9033V33.9033C71.8337 37.278 73.6078 40.3508 76.3907 42.28V42.28C82.8906 46.7858 82.8906 56.3962 76.3907 60.902V60.902C73.6078 62.8312 71.8337 65.904 71.5544 69.2787V69.2787C70.9022 77.1606 62.5793 81.9659 55.4273 78.5897V78.5897C52.3651 77.1442 48.8169 77.1442 45.7547 78.5897V78.5897C38.6026 81.9659 30.2798 77.1606 29.6276 69.2787V69.2787C29.3483 65.904 27.5742 62.8312 24.7913 60.902V60.902C18.2914 56.3962 18.2914 46.7858 24.7913 42.28V42.28C27.5742 40.3508 29.3483 37.278 29.6276 33.9033V33.9033C30.2798 26.0213 38.6026 21.2161 45.7547 24.5923V24.5923C48.8169 26.0378 52.3651 26.0378 55.4273 24.5923V24.5923Z" stroke="white" stroke-width="2"/>
<path d="M64.5248 35.0766C70.734 35.5904 74.5194 42.1469 71.8598 47.7811V47.7811C70.721 50.1934 70.721 52.9886 71.8598 55.4009V55.4009C74.5194 61.0351 70.734 67.5916 64.5248 68.1054V68.1054C61.8663 68.3254 59.4456 69.723 57.9259 71.9153V71.9153C54.3763 77.0357 46.8055 77.0357 43.256 71.9153V71.9153C41.7363 69.723 39.3155 68.3254 36.6571 68.1054V68.1054C30.4479 67.5916 26.6625 61.0351 29.3221 55.4009V55.4009C30.4609 52.9886 30.4609 50.1934 29.3221 47.7811V47.7811C26.6625 42.1469 30.4479 35.5904 36.6571 35.0766V35.0766C39.3155 34.8566 41.7363 33.459 43.256 31.2667V31.2667C46.8055 26.1463 54.3763 26.1463 57.9259 31.2667V31.2667C59.4456 33.459 61.8663 34.8566 64.5248 35.0766V35.0766Z" stroke="white" stroke-width="2"/>
<defs>
<linearGradient id="paint0_linear_0_1" x1="-4.64668" y1="58.8085" x2="101.194" y2="59.2269" gradientUnits="userSpaceOnUse">
<stop stop-color="#4EBE96"/>
<stop offset="1" stop-color="#A4DA5E"/>
</linearGradient>
</defs>
</svg>

          </div>
        )}
        <div
          className={`text-sm flex transition-all max-w-[80%] flex-col ease-in-out rounded-2xl px-4 py-3 w-fit ${
            messageIndex % 2 ? ' bg-blue-500 text-white	' : 'bg-zinc-100'
          }`}
        >
          <MessageContent
            role={role}
            content={content}
            messageIndex={messageIndex}
            sticky={sticky}
          />
        </div>
      </div>
    );
  }
);

export default Message;
