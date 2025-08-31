#!/usr/bin/env node

/**
 * 🚀 Simple MCP AI Team Server - All Specialists Demo
 */

import { AISpecialist } from './ai-specialist.js';
import { SpecialistRoles } from './types.js';

console.log('🚀 ============================================');
console.log('🚀 KRIN\'S AI TEAM - ALL SPECIALISTS ACTIVE');
console.log('🚀 ============================================');

const activityMonitor = {
  logActivity: (activity) => {
    console.log(`📊 ${activity.specialistName}: ${activity.message}`);
  }
};

// Spawn all AI specialists
const specialists = [];

console.log('\n🧠 Krin: Spawning complete AI development team...');

// 1. Backend Specialist
const backendSpecialist = new AISpecialist(SpecialistRoles.BACKEND, { activityMonitor });
specialists.push(backendSpecialist);

// 2. Frontend Specialist  
const frontendSpecialist = new AISpecialist(SpecialistRoles.FRONTEND, { activityMonitor });
specialists.push(frontendSpecialist);

// 3. Testing Specialist
const testingSpecialist = new AISpecialist(SpecialistRoles.TESTING, { activityMonitor });
specialists.push(testingSpecialist);

// 4. Security Specialist
const securitySpecialist = new AISpecialist(SpecialistRoles.SECURITY, { activityMonitor });
specialists.push(securitySpecialist);

// 5. DevOps/Performance Specialist
const devopsSpecialist = new AISpecialist(SpecialistRoles.DEVOPS, { activityMonitor });
specialists.push(devopsSpecialist);

// 6. UI/UX Specialist
const uiuxSpecialist = new AISpecialist(SpecialistRoles.UI_UX, { activityMonitor });
specialists.push(uiuxSpecialist);

// 7. Data Specialist
const dataSpecialist = new AISpecialist(SpecialistRoles.DATA, { activityMonitor });
specialists.push(dataSpecialist);

// 8. AI/ML Specialist
const aimlSpecialist = new AISpecialist(SpecialistRoles.AI_ML, { activityMonitor });
specialists.push(aimlSpecialist);

console.log('\n✅ Complete AI Team Assembled!');
console.log(`👥 Total Specialists: ${specialists.length}`);

console.log('\n📋 Team Roster:');
specialists.forEach((specialist, index) => {
  console.log(`${index + 1}. ${specialist.emoji} ${specialist.name} - ${specialist.role}`);
  console.log(`   Capabilities: ${specialist.capabilities.slice(0, 3).join(', ')}...`);
});

console.log('\n🔥 All specialists are now active and ready for autonomous development!');
console.log('🌐 Frontend Dashboard: http://localhost:3000/');
console.log('📊 Backend API: http://localhost:3003/');

// Keep server alive
console.log('\n⏰ Server running... Press Ctrl+C to stop');

// Simulate team activity every 5 seconds
let activityCounter = 0;
setInterval(() => {
  activityCounter++;
  const randomSpecialist = specialists[Math.floor(Math.random() * specialists.length)];
  const activities = [
    'Performing code analysis',
    'Optimizing performance',
    'Running automated tests', 
    'Monitoring system health',
    'Reviewing security protocols',
    'Updating documentation',
    'Coordinating with team members',
    'Processing development tasks'
  ];
  
  const activity = activities[Math.floor(Math.random() * activities.length)];
  
  console.log(`\n[${new Date().toLocaleTimeString()}] ${randomSpecialist.emoji} ${randomSpecialist.name}: ${activity}`);
  
  if (activityCounter % 6 === 0) {
    console.log('\n🧠 Krin: AI Team coordination cycle complete - All specialists operational! 🚀');
  }
}, 5000);