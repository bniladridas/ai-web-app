import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const GeminiComponent = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [inputActive, setInputActive] = useState(false);
  const [containsCode, setContainsCode] = useState(false);

  // Check if response contains code blocks
  useEffect(() => {
    if (response) {
      setContainsCode(response.includes('```'));
    }
  }, [response]);

  // Add a chat to history when a new response is received
  useEffect(() => {
    if (response && query) {
      setChatHistory(prev => [...prev, { question: query, answer: response, timestamp: new Date(), hasCode: containsCode }]);
    }
  }, [response, containsCode]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5003/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Error generating response:', error);
      setResponse('Error: Unable to fetch response from the API.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInput = () => {
    setInputActive(!inputActive);
    if (!inputActive) {
      document.getElementById('query-input').focus();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess('Copied');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setCopySuccess('Failed');
      });
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const selectHistoryItem = (item) => {
    setQuery(item.question);
    setResponse(item.answer);
    setContainsCode(item.hasCode);
    if (window.innerWidth < 768) {
      setShowHistory(false);
    }
  };

  const clearHistory = () => {
    setChatHistory([]);
  };

  // Custom renderer for code blocks in markdown
  const renderers = {
    code: ({node, inline, className, children, ...props}) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={atomDark}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        <div style={styles.contentWrapper}>
          {/* Side panel for history */}
          <div style={{
            ...styles.historyPanel,
            transform: showHistory ? 'translateX(0)' : 'translateX(-100%)'
          }}>
            <div style={styles.historyHeader}>
              <h3 style={styles.historyTitle}>Query History</h3>
              <button 
                onClick={clearHistory} 
                style={styles.clearButton}
                title="Clear history"
              >
                Clear All
              </button>
            </div>
            <div style={styles.historyList}>
              {chatHistory.length === 0 ? (
                <p style={styles.emptyHistory}>No queries yet</p>
              ) : (
                chatHistory.map((chat, index) => (
                  <div 
                    key={index} 
                    style={styles.historyItem}
                    onClick={() => selectHistoryItem(chat)}
                  >
                    <div style={styles.historyIconContainer}>
                      <div style={styles.historyIcon}>
                        {chat.hasCode ? "〈/〉" : "Q"}
                      </div>
                    </div>
                    <div style={styles.historyContent}>
                      <p style={styles.historyQuestion}>
                        {chat.question.substring(0, 40)}
                        {chat.question.length > 40 ? '...' : ''}
                      </p>
                      <p style={styles.historyTime}>
                        {new Date(chat.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main content area */}
          <div style={styles.mainContent}>
            {/* Header with model name and logo */}
            <div style={styles.header}>
              <button 
                onClick={toggleHistory} 
                style={styles.historyButton}
                title="Toggle history"
              >
                <span style={styles.burgerIcon}></span>
              </button>
              <div style={styles.modelBadge}>
                <div style={styles.nexusIcon}>NX</div>
                <span style={styles.modelName}>Nexus AI • Quantum Insight</span>
              </div>
            </div>

            <div style={styles.contentContainer}>
              <h1 style={styles.title}>Nexus Insight</h1>
              <p style={styles.subtitle}>Quantum-powered intelligence for developers</p>
              
              <form onSubmit={handleSearch} style={styles.form}>
                <div style={{
                  ...styles.inputWrapper,
                  boxShadow: inputActive ? '0 0 0 2px #6200ea, 0 10px 25px rgba(0, 0, 0, 0.2)' : '0 10px 25px rgba(0, 0, 0, 0.2)',
                }}>
                  <input
                    id="query-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask me anything..."
                    style={styles.input}
                    onFocus={() => setInputActive(true)}
                    onBlur={() => setInputActive(false)}
                  />
                  <button type="button" onClick={toggleInput} style={styles.toggleButton}>
                    <span style={inputActive ? styles.toggleActive : styles.toggle}></span>
                  </button>
                  <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? (
                      <span style={styles.loadingSpinner}></span>
                    ) : (
                      <span style={styles.buttonText}>Generate</span>
                    )}
                  </button>
                </div>
              </form>
              
              {response && (
                <div style={styles.responseContainer}>
                  <div style={styles.responseHeader}>
                    <span style={styles.responseTitle}>
                      <span style={styles.responseIcon}>{containsCode ? "〈/〉" : "✓"}</span>
                      {containsCode ? "Code Response" : "Response"}
                    </span>
                    {containsCode && (
                      <button 
                        onClick={() => copyToClipboard(response)} 
                        style={styles.copyButton}
                        title="Copy to clipboard"
                      >
                        {copySuccess || 'Copy Code'}
                      </button>
                    )}
                  </div>
                  <div style={styles.responseContent}>
                    <ReactMarkdown
                      components={renderers}
                      children={response}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer with social links */}
            <div style={styles.footer}>
              <div style={styles.socialLinks}>
                <a 
                  href="https://github.com/bniladridas" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={styles.socialLink}
                  title="GitHub Profile"
                >
                  <div style={styles.socialIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <span style={styles.socialText}>Gen AI Dev</span>
                </a>
                <a 
                  href="https://www.linkedin.com/in/bniladridas" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={styles.socialLink}
                  title="LinkedIn Profile"
                >
                  <div style={styles.socialIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </div>
                  <span style={styles.socialText}>bniladridas</span>
                </a>
              </div>
              <div style={styles.copyright}>
                © 2025 Nexus AI • All rights reserved
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    height: '100vh',
    backgroundImage: 'url("https://images.unsplash.com/photo-1604147706283-d7119b5b822c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    fontFamily: "'Inter', 'Roboto', sans-serif",
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(13, 10, 33, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  contentWrapper: {
    display: 'flex',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  historyPanel: {
    width: '320px',
    height: '100%',
    backgroundColor: 'rgba(20, 16, 49, 0.95)',
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '2px 0 20px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  historyTitle: {
    color: '#fff',
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  clearButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: '#e0e0e0',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  historyList: {
    overflowY: 'auto',
    flex: 1,
    padding: '15px',
  },
  historyItem: {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      transform: 'translateY(-2px)'
    }
  },
  historyIconContainer: {
    marginRight: '12px',
  },
  historyIcon: {
    width: '32px',
    height: '32px',
    backgroundColor: 'rgba(98, 0, 234, 0.2)',
    color: '#a388ff',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px',
  },
  historyContent: {
    flex: 1,
  },
  historyQuestion: {
    margin: '0 0 5px 0',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
  },
  historyTime: {
    margin: 0,
    color: '#aaa',
    fontSize: '12px',
  },
  emptyHistory: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: '40px',
    fontSize: '14px',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 30px',
    backgroundColor: 'rgba(13, 10, 33, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  historyButton: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
    position: 'relative',
  },
  burgerIcon: {
    width: '20px',
    height: '2px',
    backgroundColor: '#fff',
    position: 'relative',
    display: 'block',
    ':before': {
      content: '""',
      position: 'absolute',
      width: '20px',
      height: '2px',
      backgroundColor: '#fff',
      top: '-6px'
    },
    ':after': {
      content: '""',
      position: 'absolute',
      width: '20px',
      height: '2px',
      backgroundColor: '#fff',
      top: '6px'
    }
  },
  modelBadge: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(98, 0, 234, 0.15)',
    padding: '8px 15px',
    borderRadius: '12px',
    border: '1px solid rgba(98, 0, 234, 0.3)',
  },
  nexusIcon: {
    width: '28px',
    height: '28px',
    background: 'linear-gradient(135deg, #6200ea, #b388ff)',
    color: '#fff',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    marginRight: '10px',
    fontSize: '12px',
  },
  modelName: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 30px',
    width: '80%',
    maxWidth: '900px',
    margin: '0 auto',
    overflowY: 'auto',
  },
  title: {
    fontSize: '52px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #6200ea, #b388ff)',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    marginBottom: '8px',
    textShadow: '0 2px 10px rgba(98, 0, 234, 0.3)',
    fontFamily: "'Montserrat', sans-serif",
  },
  subtitle: {
    fontSize: '18px',
    color: '#ccc',
    marginBottom: '50px',
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: '0.5px',
  },
  form: {
    width: '100%',
    marginBottom: '40px',
  },
  inputWrapper: {
    display: 'flex',
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'box-shadow 0.3s ease',
    background: 'rgba(255, 255, 255, 0.95)',
  },
  input: {
    width: '100%',
    padding: '20px 100px 20px 25px',
    fontSize: '16px',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: '#333',
    fontFamily: "'Inter', sans-serif",
  },
  toggleButton: {
    position: 'absolute',
    right: '70px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '36px',
    height: '20px',
    backgroundColor: '#e0e0e0',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    padding: 0,
  },
  toggle: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '16px',
    height: '16px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    transition: 'transform 0.2s, background-color 0.2s',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
  },
  toggleActive: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '16px',
    height: '16px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    transition: 'transform 0.2s, background-color 0.2s',
    transform: 'translateX(16px)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
  },
  button: {
    position: 'absolute',
    right: '6px',
    top: '6px',
    bottom: '6px',
    padding: '0 20px',
    fontSize: '15px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #6200ea, #9d46ff)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '60px',
  },
  buttonText: {
    display: 'flex',
    alignItems: 'center',
  },
  loadingSpinner: {
    display: 'inline-block',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTop: '2px solid #fff',
    animation: 'spin 0.8s linear infinite',
  },
  responseContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '30px',
  },
  responseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    backgroundColor: 'rgba(13, 10, 33, 0.05)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  },
  responseTitle: {
    fontWeight: '600',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
  },
  responseIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    backgroundColor: 'rgba(98, 0, 234, 0.1)',
    borderRadius: '6px',
    marginRight: '8px',
    color: '#6200ea',
    fontSize: '14px',
  },
  copyButton: {
    backgroundColor: '#6200ea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontWeight: '500',
  },
  responseContent: {
    padding: '25px',
    color: '#333',
    fontSize: '15px',
    lineHeight: '1.6',
    maxHeight: '500px',
    overflowY: 'auto',
    fontFamily: "'Inter', sans-serif",
  },
  // Footer styles
  footer: {
    backgroundColor: 'rgba(13, 10, 33, 0.8)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '15px 30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '10px',
  },
  socialLink: {
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: 'rgba(98, 0, 234, 0.15)',
    transition: 'all 0.2s ease',
    border: '1px solid rgba(98, 0, 234, 0.3)',
  },
  socialIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px',
    color: '#a388ff',
  },
  socialText: {
    fontSize: '14px',
    fontWeight: '500',
  },
  copyright: {
    color: '#aaa',
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '5px',
  }
};

// Add CSS for the loading spinner animation and hover effects
const spinnerStyle = document.createElement('style');
spinnerStyle.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Add styles for hover effects that can't be included in inline styles */
  .history-item:hover {
    background-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }
  
  .clear-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .copy-button:hover {
    background-color: #7c26ff;
  }
  
  /* Social link hover effects */
  a.social-link:hover {
    background-color: rgba(98, 0, 234, 0.25);
    transform: translateY(-2px);
  }
  
  /* Import fonts */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@700;800&display=swap');
`;
document.head.appendChild(spinnerStyle);

export default GeminiComponent;