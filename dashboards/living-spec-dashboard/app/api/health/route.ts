import { NextResponse } from 'next/server';
import { getProjectVersion } from '@/lib/data';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Simple health checks
    const version = getProjectVersion();
    const uptime = process.uptime();
    const memory = process.memoryUsage();
    const responseTime = Date.now() - startTime;
    
    // Mock database connection check
    const dbStatus = 'healthy'; // In real app, this would check actual DB connection
    
    // Mock external service checks
    const externalServices = {
      github: 'healthy',
      jira: 'healthy', 
      monitoring: 'healthy'
    };
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version,
      uptime: Math.floor(uptime),
      responseTime,
      memory: {
        used: Math.round(memory.heapUsed / 1024 / 1024),
        total: Math.round(memory.heapTotal / 1024 / 1024),
        external: Math.round(memory.external / 1024 / 1024),
      },
      database: {
        status: dbStatus,
        connectionPool: 'active',
      },
      services: externalServices,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      checks: {
        server: '✅ Server responding',
        memory: memory.heapUsed < 100 * 1024 * 1024 ? '✅ Memory usage normal' : '⚠️ High memory usage',
        responseTime: responseTime < 100 ? '✅ Response time good' : '⚠️ Slow response time',
      }
    };
    
    // Determine overall health status
    const isHealthy = responseTime < 1000 && 
                     memory.heapUsed < 200 * 1024 * 1024 &&
                     dbStatus === 'healthy';
    
    return NextResponse.json(
      {
        ...healthStatus,
        status: isHealthy ? 'healthy' : 'degraded'
      },
      { 
        status: isHealthy ? 200 : 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        responseTime: Date.now() - startTime,
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    );
  }
}

// Support for HEAD requests (common for load balancer health checks)
export async function HEAD() {
  try {
    const responseTime = Date.now() - Date.now();
    return new Response(null, {
      status: 200,
      headers: {
        'X-Health-Status': 'healthy',
        'X-Response-Time': responseTime.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}