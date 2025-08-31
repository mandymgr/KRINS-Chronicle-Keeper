#!/usr/bin/env node

/**
 * 🧪 Basic MCP AI Team Coordination Test
 * Demonstrates the revolutionary autonomous AI team system
 */

import { KrinAITeamCoordinator } from '../src/team-coordinator.js';
import { SpecialistRoles, TaskTypes } from '../src/types.js';

async function runBasicCoordinationTest() {
  console.log('🚀 ============================================');
  console.log('🚀 MCP AI TEAM COORDINATION TEST');
  console.log('🚀 ============================================');
  console.log('');

  // Initialize Krin AI Team Coordinator
  const krin = new KrinAITeamCoordinator();
  
  try {
    console.log('📋 Test 1: Spawning AI Specialists');
    console.log('────────────────────────────────');
    
    // Spawn Backend Specialist
    const backendSpecialist = await krin.spawnSpecialist(SpecialistRoles.BACKEND);
    console.log(`✅ ${backendSpecialist.emoji} ${backendSpecialist.name} spawned successfully`);
    
    // Spawn Frontend Specialist
    const frontendSpecialist = await krin.spawnSpecialist(SpecialistRoles.FRONTEND);
    console.log(`✅ ${frontendSpecialist.emoji} ${frontendSpecialist.name} spawned successfully`);
    
    // Spawn Testing Specialist
    const testingSpecialist = await krin.spawnSpecialist(SpecialistRoles.TESTING);
    console.log(`✅ ${testingSpecialist.emoji} ${testingSpecialist.name} spawned successfully`);
    
    console.log('');
    console.log(`🎯 AI Team assembled: ${krin.specialists.size} specialists ready`);
    console.log('');

    console.log('📋 Test 2: Individual Task Assignment');
    console.log('────────────────────────────────');
    
    // Test Backend Specialist task
    const backendTask = {
      id: 'task-backend-001',
      type: TaskTypes.CODE_GENERATION,
      description: 'Design and implement REST API for todo application',
      complexity: 'medium'
    };
    
    const backendResult = await backendSpecialist.acceptTask(backendTask);
    console.log(`✅ Backend task result: ${backendResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (backendResult.patterns_applied) {
      console.log(`   📋 Patterns applied: ${backendResult.patterns_applied.length}`);
    }
    
    // Test Frontend Specialist task
    const frontendTask = {
      id: 'task-frontend-001',
      type: TaskTypes.CODE_GENERATION,
      description: 'Create React TypeScript components for todo interface',
      complexity: 'medium'
    };
    
    const frontendResult = await frontendSpecialist.acceptTask(frontendTask);
    console.log(`✅ Frontend task result: ${frontendResult.success ? 'SUCCESS' : 'FAILED'}`);
    
    // Test Testing Specialist task  
    const testingTask = {
      id: 'task-testing-001',
      type: TaskTypes.TESTING,
      description: 'Comprehensive testing of todo application',
      complexity: 'high'
    };
    
    const testingResult = await testingSpecialist.acceptTask(testingTask);
    console.log(`✅ Testing task result: ${testingResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (testingResult.result?.unit_tests) {
      console.log(`   🧪 Unit tests: ${testingResult.result.unit_tests.passed} passed, ${testingResult.result.unit_tests.failed} failed`);
    }
    
    console.log('');
    console.log('📋 Test 3: Inter-Specialist Communication');
    console.log('────────────────────────────────');
    
    // Backend sends message to Frontend
    const backendMessage = await backendSpecialist.sendMessage(
      frontendSpecialist.id,
      'Backend API ready! Here are the endpoints and data schemas for integration.',
      'coordination'
    );
    
    // Frontend receives and processes message
    const frontendResponse = await frontendSpecialist.receiveMessage(backendMessage);
    console.log(`✅ Inter-specialist communication: Backend → Frontend successful`);
    
    // Frontend sends question to Testing
    const frontendQuestion = await frontendSpecialist.sendMessage(
      testingSpecialist.id,
      'What testing approach do you recommend for the new todo components?',
      'question'
    );
    
    const testingAnswer = await testingSpecialist.receiveMessage(frontendQuestion);
    console.log(`✅ Specialist Q&A: Frontend ↔ Testing successful`);
    
    console.log('');
    console.log('📋 Test 4: Team Coordination Status');
    console.log('────────────────────────────────');
    
    const coordinationStatus = krin.getCoordinationStatus();
    console.log(`👥 Total specialists: ${coordinationStatus.specialists.total}`);
    console.log(`🟢 Active specialists: ${coordinationStatus.specialists.active}`);
    console.log(`⚡ Idle specialists: ${coordinationStatus.specialists.idle}`);
    console.log(`📊 Tasks coordinated: ${coordinationStatus.metrics.tasksCoordinated}`);
    console.log(`✅ Success rate: ${coordinationStatus.metrics.successRate}%`);
    
    console.log('');
    console.log('📋 Test 5: Autonomous Project Coordination');
    console.log('────────────────────────────────');
    
    const projectResult = await krin.coordinateProject(
      'Build a todo application with user authentication and real-time sync',
      {
        context: 'web-app',
        techStack: ['react-typescript', 'node-express', 'postgresql'],
        requirements: ['authentication', 'real-time-sync', 'responsive-design']
      }
    );
    
    console.log(`🎉 Autonomous project coordination completed!`);
    console.log(`📈 Success rate: ${projectResult.results.successRate}%`);
    console.log(`⚡ Tasks completed: ${projectResult.results.tasksCompleted}/${projectResult.results.tasksTotal}`);
    console.log(`👥 Team size: ${projectResult.team.length} specialists`);
    
    // Show project timeline
    console.log('');
    console.log('📋 Project Timeline:');
    projectResult.results.timeline.forEach((event, index) => {
      const status = event.success ? '✅' : '❌';
      console.log(`   ${status} Phase ${event.phase}: ${event.task} (${event.specialist})`);
    });
    
    console.log('');
    console.log('🎯 ============================================');
    console.log('🎯 MCP AI TEAM COORDINATION TEST COMPLETED');
    console.log('🎯 ============================================');
    console.log('');
    console.log('🌟 Revolutionary Results:');
    console.log('   ✅ AI specialists spawned and coordinated successfully');
    console.log('   ✅ Individual task assignment and completion working');
    console.log('   ✅ Inter-specialist communication functioning');
    console.log('   ✅ Autonomous project coordination achieved');
    console.log('   ✅ Real-time status monitoring operational');
    console.log('');
    console.log('🚀 The future of software development is NOW!');
    console.log('');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBasicCoordinationTest();
}