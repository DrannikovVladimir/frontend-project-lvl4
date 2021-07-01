/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { Provider } from 'react-redux';
import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';

import store from './app/store.js';
import resources from './locales/locales.js';
import rollbar, { RollbarContext, SocketContext } from './contexts/index.jsx';
import { addMessage } from './slices/messagesSlice.js';
import { newChannel, removeChannel, renameChannel } from './slices/channelsSlice.js';
import App from './components/App.jsx';

const SocketProvider = ({ children, socket }) => (
  <SocketContext.Provider value={socket}>
    {children}
  </SocketContext.Provider>
);

const Init = (socket) => {
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    resources,
  });

  socket.on('newMessage', (message) => store.dispatch(addMessage({ message })));
  socket.on('newChannel', (channel) => store.dispatch(newChannel({ channel })));
  socket.on('removeChannel', (channelId) => store.dispatch(removeChannel(channelId)));
  socket.on('renameChannel', (channel) => store.dispatch(renameChannel(channel)));

  return (
    <Provider store={store}>
      <RollbarContext.Provider value={rollbar}>
        <SocketProvider socket={socket}>
          <I18nextProvider i18n={i18nInstance}>
            <App />
          </I18nextProvider>
        </SocketProvider>
      </RollbarContext.Provider>
    </Provider>
  );
};

export default Init;
