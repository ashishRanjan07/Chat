import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import io from 'socket.io-client';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const socket = io('http://192.168.70.147:3000', {
  transports: ['websocket']
});

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadUsername();

    socket.on('message', data => {
      if (data.username !== username) {
        setMessages(prev => [
          ...prev,
          {
            ...data,
            type: 'received',
          },
        ]);
      }
    });

    socket.on('userJoined', username => {
      setMessages(prev => [
        ...prev,
        {text: `${username} joined the chat`, type: 'system'},
      ]);
    });

    socket.on('userLeft', username => {
      setMessages(prev => [
        ...prev,
        {text: `${username} left the chat`, type: 'system'},
      ]);
    });

    return () => {
      socket.off('message');
      socket.off('userJoined');
      socket.off('userLeft');
    };
  }, [username]);

  const loadUsername = async () => {
    const storedUsername = await AsyncStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      setIsUsernameSet(true);
      socket.emit('join', storedUsername);
    }
  };

  const handleSetUsername = () => {
    if (username.trim()) {
      AsyncStorage.setItem('username', username);
      setIsUsernameSet(true);
      socket.emit('join', username);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      // Add to local state first (shown on right)
      setMessages(prev => [
        ...prev,
        {
          username: 'You',
          text: message,
          type: 'sent',
        },
      ]);

      // Send to server
      socket.emit('message', message);
      setMessage('');
    }
  };

  if (!isUsernameSet) {
    return (
      <View style={styles.usernameContainer}>
        <Text style={styles.usernameTitle}>Enter your username</Text>
        <TextInput
          style={styles.usernameInput}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.usernameButton}
          onPress={handleSetUsername}>
          <Text style={styles.usernameButtonText}>Join Chat</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}>
      <SafeAreaView />
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <View
            style={[
              styles.messageContainer,
              item.type === 'sent' && styles.sentMessage,
              item.type === 'system' && styles.systemMessage,
            ]}>
            {item.type !== 'system' && item.type !== 'received' && (
              <Text style={styles.messageUsername}>{item.username}</Text>
            )}
            <Text
              style={[
                styles.messageText,
                item.type === 'sent' && styles.sentMessageText,
                item.type === 'system' && styles.systemMessageText,
              ]}>
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message"
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  usernameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  usernameTitle: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  usernameInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  usernameButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  usernameButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 10,
  },
  // messageContainer: {
  //   maxWidth: '80%',
  //   padding: 10,
  //   borderRadius: 8,
  //   marginBottom: 10,
  //   backgroundColor: '#e5e5ea',
  //   alignSelf: 'flex-start',
  // },
  systemMessage: {
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  messageUsername: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 4,
    color: '#333',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  sentMessageText: {
    color: '#fff',
  },
  systemMessageText: {
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  sentMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: '#e5e5ea',
    alignSelf: 'flex-start',
  },
});

export default App;
