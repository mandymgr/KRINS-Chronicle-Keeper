import { deploy } from "./deploy-runner/src/index";

async function deployMcpAiTeam() {
  console.log('🚀 Starting Level 4 Canary Deployment for MCP-AI-Team...');
  
  try {
    const result = await deploy({
      app: "mcp-ai-team",
      env: "prod",
      strategy: "canary",
      context: "../mcp-ai-team",
      dockerfile: "../mcp-ai-team/Dockerfile"
    });
    
    console.log('✅ MCP-AI-Team deployed successfully!');
    console.log('📊 Deployment details:', result);
    
    return result;
  } catch (error) {
    console.error('❌ MCP-AI-Team deployment failed:', error);
    throw error;
  }
}

// Run deployment if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  deployMcpAiTeam()
    .then(result => {
      console.log('🎉 Deployment completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('🛑 Deployment failed:', error);
      process.exit(1);
    });
}

export { deployMcpAiTeam };