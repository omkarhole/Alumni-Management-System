import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

/**
 * SocketProvider: Manages WebSocket connection lifecycle and event handling
 * Provides socket instance and utilities to child components
 */
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [reactions, setReactions] = useState(new Map());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    try {
      const newSocket = io(API_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transport: ['websocket', 'polling'],
        withCredentials: true
      });

      // Connection successful
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
      });

      // Connection error
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Disconnect
      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        setOnlineUsers(new Map());
      });

      // Global error handler
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  }, []);

  /**
   * Join a conversation room
   */
  const joinConversation = useCallback((userId, conversationId) => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected');
      return;
    }

    setCurrentUserId(userId);
    setActiveConversation(conversationId);

    socket.emit('joinConversation', {
      userId,
      conversationId
    });

    console.log(`Joined conversation: ${conversationId}`);
  }, [socket, isConnected]);

  /**
   * Leave a conversation room
   */
  const leaveConversation = useCallback((userId, conversationId) => {
    if (!socket) return;

    socket.emit('leaveConversation', { userId, conversationId });
    setActiveConversation(null);

    console.log(`Left conversation: ${conversationId}`);
  }, [socket]);

  /**
   * Mark messages as read
   */
  const markAsRead = useCallback((conversationId, messageIds, userId) => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected, mark as read failed');
      return;
    }

    socket.emit('markAsRead', {
      conversationId,
      messageIds: Array.isArray(messageIds) ? messageIds : [messageIds],
      userId
    });
  }, [socket, isConnected]);

  /**
   * Add emoji reaction to a message
   */
  const addReaction = useCallback((conversationId, messageId, userId, emoji) => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected, add reaction failed');
      return;
    }

    socket.emit('addReaction', {
      conversationId,
      messageId,
      userId,
      emoji
    });
  }, [socket, isConnected]);

  /**
   * Remove emoji reaction from a message
   */
  const removeReaction = useCallback((conversationId, messageId, userId, emoji) => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected, remove reaction failed');
      return;
    }

    socket.emit('removeReaction', {
      conversationId,
      messageId,
      userId,
      emoji
    });
  }, [socket, isConnected]);

  /**
   * Send voice message
   */
  const sendVoiceMessage = useCallback((conversationId, messageId, userId, audioUrl, duration) => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected, voice message failed');
      return;
    }

    socket.emit('voiceMessage', {
      conversationId,
      messageId,
      userId,
      audioUrl,
      duration
    });
  }, [socket, isConnected]);

  /**
   * Send typing indicator
   */
  const sendTypingIndicator = useCallback((conversationId, userId, isTyping) => {
    if (!socket) return;

    socket.emit('typingIndicator', {
      conversationId,
      userId,
      isTyping
    });
  }, [socket]);

  /**
   * Delete a message
   */
  const deleteMessage = useCallback((conversationId, messageId, userId) => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected, delete message failed');
      return;
    }

    socket.emit('messageDelete', {
      conversationId,
      messageId,
      userId
    });
  }, [socket, isConnected]);

  /**
   * Edit a message
   */
  const editMessage = useCallback((conversationId, messageId, userId, newContent) => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected, edit message failed');
      return;
    }

    socket.emit('messageEdit', {
      conversationId,
      messageId,
      userId,
      newContent
    });
  }, [socket, isConnected]);

  /**
   * Register listener for incoming event
   */
  const on = useCallback((event, handler) => {
    if (!socket) return;
    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket]);

  /**
   * Remove listener
   */
  const off = useCallback((event, handler) => {
    if (!socket) return;
    socket.off(event, handler);
  }, [socket]);

  const value = {
    socket: socketRef.current,
    isConnected,
    currentUserId,
    activeConversation,
    onlineUsers,
    reactions,
    typingUsers,
    joinConversation,
    leaveConversation,
    markAsRead,
    addReaction,
    removeReaction,
    sendVoiceMessage,
    sendTypingIndicator,
    deleteMessage,
    editMessage,
    on,
    off
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Hook to use Socket context
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export default SocketContext;
