
// Fix: Changed 'httpseact' to 'react' in the import statement.
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Chat } from "@google/genai";

// --- DYNAMIC CONFIGURATION (Simulates .env file) ---
const config = {
    appName: 'Aura',
    logo: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2C8.26801 2 2 8.26801 2 16C2 23.732 8.26801 30 16 30Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.9498 20.9497C22.6566 19.2429 23.7144 16.9334 23.9744 14.5C23.7144 12.0666 22.6566 9.75712 20.9498 8.05029C19.2429 6.34347 16.9334 5.28564 14.5 5.02564C12.0666 5.28564 9.75712 6.34347 8.05029 8.05029C6.34347 9.75712 5.28564 12.0666 5.02564 14.5C5.28564 16.9334 6.34347 19.2429 8.05029 20.9497C9.75712 22.6566 12.0666 23.7144 14.5 23.9744C16.9334 23.7144 19.2429 22.6566 20.9498 20.9497Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    welcomeMessage: "Hi, I'm Aura. How can I help you today?",
    fontFamily: "'Inter', sans-serif",
    theme: {
        light: {
            background: '#FFFFFF',
            sidebarBackground: '#F7F7F7',
            textColor: '#1A1A1A',
            accentColor: '#6A45FF',
            inputBackground: '#F0F0F0',
            borderColor: '#E0E0E0',
            userMessageBackground: '#6A45FF',
            userMessageColor: '#FFFFFF',
            aiMessageBackground: '#F0F0F0',
            aiMessageColor: '#1A1A1A',
        },
        dark: {
            background: '#1A1A1A',
            sidebarBackground: '#111111',
            textColor: '#FFFFFF',
            accentColor: '#8B6BFF',
            inputBackground: '#2A2A2A',
            borderColor: '#3A3A3A',
            userMessageBackground: '#8B6BFF',
            userMessageColor: '#FFFFFF',
            aiMessageBackground: '#2A2A2A',
            aiMessageColor: '#FFFFFF',
        }
    }
};

// --- STYLES ---
const GlobalStyles = () => {
    const styles = `
        body {
            margin: 0;
            font-family: ${config.fontFamily};
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        * {
            box-sizing: border-box;
        }
        .sidebar { transition: transform 0.3s ease-in-out; }
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
                position: fixed;
                z-index: 100;
                height: 100%;
            }
            .sidebar.open {
                transform: translateX(0);
            }
        }
    `;
    return <style>{styles}</style>;
};

// --- TYPES ---
interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
}

interface ChatHistory {
    id: number;
    title: string;
    pinned: boolean;
}

// --- MAIN APP COMPONENT ---
const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    useEffect(() => {
        const user = localStorage.getItem('aura-currentUser');
        if (user) {
            setIsLoggedIn(true);
            setCurrentUser(user);
        }
    }, []);

    const handleLogin = (username: string) => {
        localStorage.setItem('aura-currentUser', username);
        setIsLoggedIn(true);
        setCurrentUser(username);
    };

    const handleLogout = () => {
        localStorage.removeItem('aura-currentUser');
        setIsLoggedIn(false);
        setCurrentUser(null);
    };
    
    // Fix: Remove invalid CSS pseudo-selectors from React style objects
    // Fix: Added className for media queries to be handled by GlobalStyles
    return (
        <>
            <GlobalStyles />
            {isLoggedIn && currentUser ? (
                <ChatInterface currentUser={currentUser} onLogout={handleLogout} />
            ) : (
                <AuthScreen onLogin={handleLogin} />
            )}
        </>
    );
};

// --- AUTHENTICATION SCREEN ---
const AuthScreen = ({ onLogin }: { onLogin: (username: string) => void }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const theme = config.theme.dark; // Auth screen is always dark themed for focus

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim().length < 3) {
            setError('Username must be at least 3 characters.');
            return;
        }
        setError('');

        const users = JSON.parse(localStorage.getItem('aura-users') || '[]');

        if (isRegister) {
            if (users.includes(username)) {
                setError('Username already exists. Please login.');
            } else {
                users.push(username);
                localStorage.setItem('aura-users', JSON.stringify(users));
                onLogin(username);
            }
        } else {
            if (users.includes(username)) {
                onLogin(username);
            } else {
                setError('User not found. Please register.');
            }
        }
    };

    const styles: { [key: string]: React.CSSProperties } = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: theme.background,
            color: theme.textColor,
        },
        formContainer: {
            background: theme.sidebarBackground,
            padding: '40px',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '360px',
            textAlign: 'center',
            border: `1px solid ${theme.borderColor}`,
        },
        logoContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px',
            color: theme.accentColor,
        },
        title: {
            fontSize: '24px',
            fontWeight: 600,
            margin: '0 0 8px 0',
            color: theme.textColor,
        },
        subtitle: {
            fontSize: '14px',
            marginBottom: '32px',
            color: theme.textColor,
            opacity: 0.7,
        },
        input: {
            width: '100%',
            padding: '12px',
            background: theme.inputBackground,
            border: `1px solid ${theme.borderColor}`,
            borderRadius: '8px',
            color: theme.textColor,
            fontSize: '14px',
            marginBottom: '16px',
        },
        button: {
            width: '100%',
            padding: '12px',
            background: theme.accentColor,
            color: theme.userMessageColor,
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 500,
            cursor: 'pointer',
        },
        toggleText: {
            marginTop: '24px',
            fontSize: '14px',
        },
        toggleLink: {
            color: theme.accentColor,
            cursor: 'pointer',
            fontWeight: 500,
        },
        error: {
            color: '#FF6B6B',
            fontSize: '12px',
            marginTop: '-10px',
            marginBottom: '10px',
            height: '14px',
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <div style={styles.logoContainer}>
                    <div dangerouslySetInnerHTML={{ __html: config.logo }} />
                    <h1 style={{ margin: 0, fontSize: '28px' }}>{config.appName}</h1>
                </div>
                <h2 style={styles.title}>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
                <p style={styles.subtitle}>{isRegister ? 'Get started with your new account.' : 'Log in to continue.'}</p>
                <form onSubmit={handleSubmit}>
                    <div style={styles.error}>{error}</div>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        style={styles.input}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        aria-label="Username"
                    />
                    <button type="submit" style={styles.button}>
                        {isRegister ? 'Register' : 'Login'}
                    </button>
                </form>
                <p style={styles.toggleText}>
                    {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                    <span
                        style={styles.toggleLink}
                        onClick={() => { setIsRegister(!isRegister); setError(''); }}
                        role="button"
                    >
                        {isRegister ? 'Login' : 'Register'}
                    </span>
                </p>
            </div>
        </div>
    );
};


// --- CHAT INTERFACE ---
const ChatInterface = ({ currentUser, onLogout }: { currentUser: string, onLogout: () => void }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const chatInstanceRef = useRef<Chat | null>(null);

    useEffect(() => {
        setMessages([{ id: 1, text: config.welcomeMessage, sender: 'ai' }]);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        chatInstanceRef.current = ai.chats.create({ model: 'gemini-2.5-flash' });
    }, []);

    const currentTheme = config.theme[theme];

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            if (chatInstanceRef.current) {
                // Fix: Corrected sendMessage argument to pass an object
                const response = await chatInstanceRef.current.sendMessage({ message: userMessage.text });
                const aiMessage: Message = { id: Date.now() + 1, text: response.text, sender: 'ai' };
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error('API call failed:', error);
            const errorMessage: Message = { id: Date.now() + 1, text: "Sorry, I couldn't process that. Please try again.", sender: 'ai' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const styles: { [key: string]: React.CSSProperties } = {
        chatContainer: {
            display: 'flex',
            height: '100vh',
            background: currentTheme.background,
            color: currentTheme.textColor,
            transition: 'background 0.3s, color 0.3s',
        },
        mainContent: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
        },
        menuButton: {
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'none',
            border: 'none',
            color: currentTheme.textColor,
            cursor: 'pointer',
            zIndex: 101,
        },
    };

    return (
        <div style={styles.chatContainer}>
            <Sidebar
                theme={theme}
                setTheme={setTheme}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                currentUser={currentUser}
                onLogout={onLogout}
            />
            <main style={styles.mainContent}>
                 <button style={styles.menuButton} onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="menu-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <ChatWindow messages={messages} isLoading={isLoading} theme={currentTheme} />
                <MessageInput input={input} setInput={setInput} handleSend={handleSend} isLoading={isLoading} theme={currentTheme} />
            </main>
        </div>
    );
};

// --- SIDEBAR COMPONENT ---
const Sidebar = ({ theme, setTheme, isOpen, setIsOpen, currentUser, onLogout }: {
    theme: 'light' | 'dark',
    setTheme: (theme: 'light' | 'dark') => void,
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    currentUser: string,
    onLogout: () => void
}) => {
    const currentTheme = config.theme[theme];
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([
        { id: 1, title: 'Brainstorming session', pinned: true },
        { id: 2, title: 'React component help', pinned: false },
        { id: 3, title: 'Marketing copy ideas', pinned: false },
    ]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredHistory = chatHistory
        .filter(chat => chat.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    const styles: { [key: string]: React.CSSProperties } = {
        sidebar: {
            width: '260px',
            background: currentTheme.sidebarBackground,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            borderRight: `1px solid ${currentTheme.borderColor}`,
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '30px',
            color: currentTheme.accentColor,
        },
        appName: {
            fontSize: '20px',
            fontWeight: 600,
        },
        searchInput: {
            width: '100%',
            padding: '10px',
            background: currentTheme.inputBackground,
            border: `1px solid ${currentTheme.borderColor}`,
            borderRadius: '8px',
            color: currentTheme.textColor,
            fontSize: '14px',
            marginBottom: '20px',
        },
        chatHistoryList: {
            flex: 1,
            overflowY: 'auto',
        },
        chatHistoryItem: {
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '8px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        footer: {
            borderTop: `1px solid ${currentTheme.borderColor}`,
            paddingTop: '20px',
        },
        userProfile: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
        },
        userAvatar: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: currentTheme.accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            fontWeight: 600,
        },
        userName: {
            fontWeight: 500,
        },
        themeToggleContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        toggleSwitch: {
            position: 'relative',
            display: 'inline-block',
            width: '50px',
            height: '26px',
        },
        toggleSlider: {
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: currentTheme.inputBackground,
            transition: '.4s',
            borderRadius: '26px',
        },
        toggleKnob: {
            position: 'absolute',
            height: '20px',
            width: '20px',
            left: '3px',
            bottom: '3px',
            backgroundColor: 'white',
            transition: '.4s',
            borderRadius: '50%',
            transform: theme === 'dark' ? 'translateX(24px)' : 'translateX(0px)',
            background: currentTheme.accentColor,
        },
        logoutButton: {
            background: 'none',
            border: 'none',
            color: currentTheme.textColor,
            opacity: 0.7,
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            padding: '10px 0',
            fontSize: '14px',
        }
    };

    return (
        <aside style={styles.sidebar} className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div style={styles.header}>
                <div dangerouslySetInnerHTML={{ __html: config.logo }} />
                <span style={styles.appName}>{config.appName}</span>
            </div>
            <input
                type="text"
                placeholder="Search history..."
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div style={styles.chatHistoryList}>
                {filteredHistory.map(chat => (
                    <div key={chat.id} style={styles.chatHistoryItem}>
                        <span>{chat.title}</span>
                        {chat.pinned && <span style={{ color: currentTheme.accentColor }}>★</span>}
                    </div>
                ))}
            </div>
            <div style={styles.footer}>
                <div style={styles.userProfile}>
                     <div style={styles.userAvatar}>{currentUser.charAt(0).toUpperCase()}</div>
                    <span style={styles.userName}>{currentUser}</span>
                </div>
                 <div style={styles.themeToggleContainer}>
                    <span>Theme</span>
                    <label style={styles.toggleSwitch}>
                        <input type="checkbox" checked={theme === 'dark'} onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={styles.toggleSlider}>
                             <span style={styles.toggleKnob}></span>
                        </span>
                    </label>
                </div>
                 <button style={styles.logoutButton} onClick={onLogout}>
                    Logout
                </button>
            </div>
        </aside>
    );
};


// --- CHAT WINDOW COMPONENT ---
const ChatWindow = ({ messages, isLoading, theme }: { messages: Message[], isLoading: boolean, theme: typeof config.theme.light }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const styles: { [key: string]: React.CSSProperties } = {
        chatWindow: {
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            paddingBottom: '100px', // Space for input
        },
        message: {
            display: 'flex',
            marginBottom: '20px',
            maxWidth: '80%',
        },
        messageBubble: {
            padding: '12px 18px',
            borderRadius: '18px',
            lineHeight: 1.5,
        },
        loadingIndicator: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 18px',
            background: theme.aiMessageBackground,
            color: theme.aiMessageColor,
            borderRadius: '18px',
        },
        dot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: theme.aiMessageColor,
            animation: 'blink 1.4s infinite both',
        },
    };

    return (
        <div style={styles.chatWindow}>
            <style>
                {`
                @keyframes blink {
                    0% { opacity: .2; }
                    20% { opacity: 1; }
                    100% { opacity: .2; }
                }
                .dot:nth-child(2) { animation-delay: .2s; }
                .dot:nth-child(3) { animation-delay: .4s; }
                `}
            </style>
            {messages.map((msg, index) => (
                <div key={msg.id || index} style={{
                    ...styles.message,
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    marginLeft: msg.sender === 'user' ? 'auto' : '0',
                    marginRight: msg.sender === 'ai' ? 'auto' : '0',
                }}>
                    <div style={{
                        ...styles.messageBubble,
                        background: msg.sender === 'user' ? theme.userMessageBackground : theme.aiMessageBackground,
                        color: msg.sender === 'user' ? theme.userMessageColor : theme.aiMessageColor,
                        borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '18px',
                        borderBottomRightRadius: msg.sender === 'user' ? '4px' : '18px',
                    }}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div style={{ ...styles.message, justifyContent: 'flex-start' }}>
                    <div style={styles.loadingIndicator}>
                        <div className="dot" style={styles.dot}></div>
                        <div className="dot" style={styles.dot}></div>
                        <div className="dot" style={styles.dot}></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

// --- MESSAGE INPUT COMPONENT ---
const MessageInput = ({ input, setInput, handleSend, isLoading, theme }: {
    input: string,
    setInput: (input: string) => void,
    handleSend: () => void,
    isLoading: boolean,
    theme: typeof config.theme.light
}) => {
    const styles: { [key: string]: React.CSSProperties } = {
        inputContainer: {
            padding: '20px',
            borderTop: `1px solid ${theme.borderColor}`,
            background: theme.background,
        },
        inputWrapper: {
            display: 'flex',
            alignItems: 'center',
            background: theme.inputBackground,
            borderRadius: '12px',
            padding: '5px 15px',
            maxWidth: '800px',
            margin: '0 auto',
        },
        input: {
            flex: 1,
            border: 'none',
            background: 'transparent',
            color: theme.textColor,
            padding: '15px 0',
            fontSize: '16px',
            outline: 'none',
        },
        sendButton: {
            background: theme.accentColor,
            border: 'none',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
        },
    };
    return (
        <div style={styles.inputContainer}>
            <div style={styles.inputWrapper}>
                <input
                    type="text"
                    style={styles.input}
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                    disabled={isLoading}
                />
                <button
                    style={{ ...styles.sendButton, opacity: isLoading ? 0.5 : 1 }}
                    onClick={handleSend}
                    disabled={isLoading}
                    aria-label="Send message"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

// --- RENDER THE APP ---
const container = document.getElementById('root');
if (container) {
    // Fix: Updated from ReactDOM.render to createRoot for React 18+
    const root = createRoot(container);
    root.render(<App />);
}
