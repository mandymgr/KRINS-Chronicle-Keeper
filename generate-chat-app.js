const { AIPatternBridge } = require('./src/ai-pattern-bridge');

async function generateChatApp() {
  const bridge = new AIPatternBridge();
  
  try {
    const result = await bridge.processProject(
      "Real-time chat application with WebSocket messaging, user authentication, file upload, and comprehensive testing suite"
    );
    
    console.log('Chat app workspace created:', result.workspace);
    return result;
  } catch (error) {
    console.error('Failed to generate chat app:', error);
    throw error;
  }
}

generateChatApp();