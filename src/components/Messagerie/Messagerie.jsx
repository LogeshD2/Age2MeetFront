import React, { useState } from 'react';
import './Messagerie.css';

const MessagerieSection = () => {
  const [selectedContact, setSelectedContact] = useState({
    id: 3,
    name: 'Oze',
    avatar: 'O'
  });
  const [newMessage, setNewMessage] = useState('');

  const contacts = [
    {
      id: 1,
      name: 'Chat',
      avatar: 'C',
      lastMessage: 'Oui, ca leur plait gout meat et day, I met someone special today, she\'s really pretty. I\'d like to talk more.',
      time: '10:30',
      unread: true
    },
    {
      id: 2,
      name: 'Gisèle',
      avatar: 'G',
      lastMessage: 'Call me if I get get this okay',
      time: '9:45',
      unread: false
    },
    {
      id: 3,
      name: 'Oze',
      avatar: 'O',
      lastMessage: 'Oze, ca leur plait gout meat et day, I met someone special today, she\'s...',
      time: '8:20',
      unread: true
    },
    {
      id: 4,
      name: 'Bamideb',
      avatar: 'B',
      lastMessage: 'Are you coming to class tomorrow?',
      time: '7:15',
      unread: false
    },
    {
      id: 5,
      name: 'Lucia',
      avatar: 'L',
      lastMessage: 'Happy new year, where are you staying?',
      time: '6:30',
      unread: false
    },
    {
      id: 6,
      name: 'Maya',
      avatar: 'M',
      lastMessage: 'Hope you\'re fine, u, you still on',
      time: '5:45',
      unread: false
    },
    {
      id: 7,
      name: 'Chi',
      avatar: 'C',
      lastMessage: 'Hope you enjoy dinner!',
      time: '4:20',
      unread: false
    },
    {
      id: 8,
      name: 'chuom',
      avatar: 'C',
      lastMessage: 'I couldn\'t see doing that, I\'m my father so I say it',
      time: '3:10',
      unread: false
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'Oze',
      content: 'Lorem ipsum dolor sit amet consectetur. Dictum quos fermentum sodales sed interdum in eget. Elit lacus tincidunt massa fringilla at.',
      time: '10:30',
      isMe: false
    },
    {
      id: 2,
      sender: 'Me',
      content: 'Lorem ipsum dolor sit amet consectetur. Rhoncus amet aliquet ultrices ut. Sit tellus egestas viverra lectus.',
      time: '10:32',
      isMe: true
    },
    {
      id: 3,
      sender: 'Oze',
      content: 'Lorem ipsum dolor sit amet consectetur. Pellentesque sagittis sed dictum lorem. Neque eget faucibus tempor egestas pruvate vitae suscipit. Sit odio risus dolor egestas id ultrices non nibh. Pretium ante.',
      time: '10:35',
      isMe: false
    },
    {
      id: 4,
      sender: 'Me',
      content: 'Sit tellus consectetur lorem suscipit. Euismod bibendum done orci et ullamcorper vivamus tempus.',
      time: '10:36',
      isMe: true
    }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="messagerie-page">
      <div className="messagerie-container">
        {/* Liste des contacts */}
        <div className="contacts-list">
          <div className="contacts-header">
            <h2>Messages</h2>
          </div>
          <div className="contacts-scroll">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={`contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="contact-avatar">
                  {contact.avatar}
                </div>
                <div className="contact-info">
                  <div className="contact-header">
                    <span className="contact-name">{contact.name}</span>
                    <span className="contact-time">{contact.time}</span>
                  </div>
                  <div className="contact-message">
                    {contact.lastMessage}
                  </div>
                </div>
                {contact.unread && <div className="unread-indicator"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="conversation-area">
          {selectedContact ? (
            <>
              <div className="conversation-header">
                <div className="conversation-avatar">
                  {selectedContact.avatar}
                </div>
                <div className="conversation-info">
                  <h3>{selectedContact.name}</h3>
                  <span className="status">En ligne</span>
                </div>
              </div>

              <div className="messages-container">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.isMe ? 'message-me' : 'message-other'}`}
                  >
                    {!message.isMe && (
                      <div className="message-avatar">
                        {selectedContact.avatar}
                      </div>
                    )}
                    <div className="message-content">
                      <div className="message-bubble">
                        {message.content}
                      </div>
                      <div className="message-time">{message.time}</div>
                    </div>
                    {message.isMe && (
                      <div className="message-avatar">
                        Me
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <form className="message-input-area" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type something..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="message-input"
                />
                <div className="input-actions">
                  <button type="button" className="attach-btn">📎</button>
                  <button type="button" className="emoji-btn">😊</button>
                  <button type="button" className="image-btn">🖼️</button>
                  <button type="submit" className="send-btn">➤</button>
                </div>
              </form>
            </>
          ) : (
            <div className="no-conversation">
              <p>Sélectionnez une conversation pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagerieSection; 