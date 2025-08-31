import React, { useState } from 'react';

/**
 * 🚀 Revolutionary Todo App - Simple Version to Prove Concept
 * Built with AI Pattern-Driven Development
 * @authors Krin & Mandy
 */

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const SimpleApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const [isDark, setIsDark] = useState(false);

  const addTodo = () => {
    if (inputText.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputText.trim(),
        completed: false
      }]);
      setInputText('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const appStyle = {
    minHeight: '100vh',
    backgroundColor: isDark ? '#1a202c' : '#f7fafc',
    color: isDark ? '#e2e8f0' : '#2d3748',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle = {
    textAlign: 'center' as const,
    marginBottom: '30px'
  };

  const inputContainerStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    maxWidth: '500px',
    margin: '0 auto 20px'
  };

  const inputStyle = {
    flex: 1,
    padding: '10px',
    border: `1px solid ${isDark ? '#4a5568' : '#cbd5e0'}`,
    borderRadius: '5px',
    backgroundColor: isDark ? '#2d3748' : 'white',
    color: isDark ? '#e2e8f0' : '#2d3748'
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  };

  const todoListStyle = {
    maxWidth: '500px',
    margin: '0 auto'
  };

  const todoItemStyle = (completed: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    margin: '5px 0',
    backgroundColor: isDark ? '#2d3748' : 'white',
    border: `1px solid ${isDark ? '#4a5568' : '#e2e8f0'}`,
    borderRadius: '5px',
    textDecoration: completed ? 'line-through' : 'none',
    opacity: completed ? 0.6 : 1
  });

  return (
    <div style={appStyle}>
      <div style={headerStyle}>
        <h1>🚀 Revolutionary Todo App</h1>
        <p>Built with AI Pattern-Driven Development by Krin & Mandy</p>
        <button 
          onClick={() => setIsDark(!isDark)}
          style={{...buttonStyle, backgroundColor: isDark ? '#f6e05e' : '#2d3748'}}
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <div style={inputContainerStyle}>
        <input
          style={inputStyle}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="What needs to be done?"
        />
        <button style={buttonStyle} onClick={addTodo}>
          Add Todo
        </button>
      </div>

      <div style={todoListStyle}>
        {todos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>🎉 No todos yet! Add one above to get started.</p>
          </div>
        ) : (
          todos.map(todo => (
            <div key={todo.id} style={todoItemStyle(todo.completed)}>
              <button
                onClick={() => toggleTodo(todo.id)}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '3px',
                  border: `2px solid ${todo.completed ? '#48bb78' : '#cbd5e0'}`,
                  backgroundColor: todo.completed ? '#48bb78' : 'transparent',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {todo.completed && '✓'}
              </button>
              <span style={{ flex: 1 }}>{todo.text}</span>
              <button
                onClick={() => deleteTodo(todo.id)}
                style={{
                  ...buttonStyle,
                  backgroundColor: '#f56565',
                  padding: '5px 10px'
                }}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '12px', opacity: 0.7 }}>
        <p>Built with Revolutionary AI Pattern-Driven Development</p>
        <p>🤖 Powered by Krin & Mandy System • Following ADR-0004</p>
        <p>Status: ✅ Proof of Concept Successful!</p>
      </div>
    </div>
  );
};

export default SimpleApp;