import React from 'react';
import useStore from '@store/store';
import { useTranslation } from 'react-i18next';
import { ChatInterface, MessageInterface } from '@type/chat';
import { getChatCompletion, getChatCompletionStream, getData } from '@api/api';
import { parseEventSource } from '@api/helper';
import { limitMessageTokens } from '@utils/messageUtils';
import { _defaultChatConfig } from '@constants/chat';
import { officialAPIEndpoint } from '@constants/auth';

const useSubmit = () => {
  const { t } = useTranslation('api');
  const error = useStore((state) => state.error);
  const setError = useStore((state) => state.setError);
  const apiEndpoint = useStore((state) => state.apiEndpoint);
  const apiKey = useStore((state) => state.apiKey);
  const setGenerating = useStore((state) => state.setGenerating);
  const generating = useStore((state) => state.generating);
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const setChats = useStore((state) => state.setChats);

  const generateTitle = async (
    message: MessageInterface[]
  ): Promise<string> => {
    let data;
    if (!apiKey || apiKey.length === 0) {
      // official endpoint
      if (apiEndpoint === officialAPIEndpoint) {
        throw new Error(t('noApiKeyWarning') as string);
      }

      // other endpoints
      data = await getChatCompletion(
        useStore.getState().apiEndpoint,
        message,
        _defaultChatConfig
      );
    } else if (apiKey) {
      // own apikey
      data = await getChatCompletion(
        useStore.getState().apiEndpoint,
        message,
        _defaultChatConfig,
        apiKey
      );
    }
    return data.choices[0].message.content;
  };

  const handleSubmit = async (msg?: string) => {
    const chats = useStore.getState().chats;
    if (generating || !chats) return;

    const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(chats));

    updatedChats[currentChatIndex].messages.push({
      role: 'assistant',
      content: '',
    });

    setChats(updatedChats);
    setGenerating(true);

    try {
      let stream;
      if (chats[currentChatIndex].messages.length === 0)
        throw new Error('No messages submitted!');

      const messages = limitMessageTokens(
        chats[currentChatIndex].messages,
        chats[currentChatIndex].config.max_tokens,
        chats[currentChatIndex].config.model
      );
      if (messages.length === 0) throw new Error('Message exceed max token!');

      // no api key (free)
      if (!apiKey || apiKey.length === 0) {
        // official endpoint
        if (apiEndpoint === officialAPIEndpoint) {
          throw new Error(t('noApiKeyWarning') as string);
        }

        // other endpoints
        stream = await getChatCompletionStream(
          useStore.getState().apiEndpoint,
          messages,
          chats[currentChatIndex].config
        );
      } else if (apiKey) {
        // own apikey
        // stream = await getChatCompletionStream(
        //   useStore.getState().apiEndpoint,
        //   messages,
        //   chats[currentChatIndex].config,
        //   apiKey
        // );
        stream = await getData(msg || '')
      }

      if (stream) {
        if (stream.locked)
          throw new Error(
            'Oops, the stream is locked right now. Please try again'
          );
        const reader = stream.getReader();
        let reading = true;
        let partial = '';
        while (reading && useStore.getState().generating) {
          const { done, value } = await reader.read();
          const result = parseEventSource(
            partial + new TextDecoder().decode(value)
          );
          partial = '';

          if (result === '[DONE]' || done) {
            reading = false;
          } else {
            const resultString = result.reduce((output: string, curr) => {
              if (typeof curr === 'string') {
                output += curr;
              } else {
                const content = curr.choices[0].delta.content;
                if (content) output += content;
              }
              return output;
            }, '');

            const updatedChats: ChatInterface[] = JSON.parse(
              JSON.stringify(useStore.getState().chats)
            );
            const updatedMessages = updatedChats[currentChatIndex].messages;
            updatedMessages[updatedMessages.length - 1].content += resultString;
            setChats(updatedChats);
          }
        }
        if (useStore.getState().generating) {
          reader.cancel('Cancelled by user');
        } else {
          reader.cancel('Generation completed');
        }
        reader.releaseLock();
        stream.cancel();
      }

      // generate title for new chats
      const currChats = useStore.getState().chats;
      if (
        useStore.getState().autoTitle &&
        currChats &&
        !currChats[currentChatIndex]?.titleSet
      ) {
        const messages_length = currChats[currentChatIndex].messages.length;
        const assistant_message =
          currChats[currentChatIndex].messages[messages_length - 1].content;
        const user_message =
          currChats[currentChatIndex].messages[messages_length - 2].content;

        const message: MessageInterface = {
          role: 'user',
          content: `Generate a title in less than 6 words for the following message:\nUser: ${user_message}\nAssistant: ${assistant_message}`,
        };

        let title = (await generateTitle([message])).trim();
        if (title.startsWith('"') && title.endsWith('"')) {
          title = title.slice(1, -1);
        }
        const updatedChats: ChatInterface[] = JSON.parse(
          JSON.stringify(useStore.getState().chats)
        );
        updatedChats[currentChatIndex].title = title;
        updatedChats[currentChatIndex].titleSet = true;
        setChats(updatedChats);
      }
    } catch (e: unknown) {
      const err = (e as Error).message;
      console.log(err);
      setError(err);
    }
    setGenerating(false);
  };

  return { handleSubmit, error };
};

export default useSubmit;
