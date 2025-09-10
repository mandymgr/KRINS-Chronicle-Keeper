"""
KRINS Developer Hub - Docker Management
Real Docker operations using docker-py SDK - NO MOCK DATA
"""

import docker
import subprocess
import asyncio
import psutil
from datetime import datetime
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class DockerManager:
    def __init__(self):
        self.client = None
        self.connect()
    
    def connect(self):
        """Connect to Docker daemon"""
        try:
            self.client = docker.from_env()
            self.client.ping()  # Test connection
            logger.info("Connected to Docker daemon")
        except Exception as e:
            logger.error(f"Failed to connect to Docker: {e}")
            self.client = None
    
    async def get_status(self) -> List[Dict]:
        """Get real Docker Compose service status"""
        if not self.client:
            return []
        
        services = []
        
        try:
            # Get Docker Compose services
            result = subprocess.run(
                ['docker', 'compose', 'ps', '--format', 'json'],
                capture_output=True,
                text=True,
                cwd='/Users/mandymarigjervikrygg/Desktop/Krins-Studio/KRINS-Chronicle-Keeper'
            )
            
            if result.returncode != 0:
                logger.error(f"Docker compose ps failed: {result.stderr}")
                return []
            
            import json
            compose_services = []
            for line in result.stdout.strip().split('\n'):
                if line.strip():
                    compose_services.append(json.loads(line))
            
            # Get container details from Docker API
            containers = self.client.containers.list(all=True)
            
            for compose_service in compose_services:
                service_name = compose_service.get('Service', 'unknown')
                container_name = compose_service.get('Name', '')
                state = compose_service.get('State', 'unknown')
                
                # Find matching container for resource usage
                container = None
                for c in containers:
                    if container_name in c.name:
                        container = c
                        break
                
                # Get resource usage
                cpu_percent = 0.0
                memory_usage = 0
                restarts = 0
                
                if container:
                    try:
                        stats = container.stats(stream=False)
                        
                        # Calculate CPU percentage
                        cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - \
                                   stats['precpu_stats']['cpu_usage']['total_usage']
                        system_delta = stats['cpu_stats']['system_cpu_usage'] - \
                                      stats['precpu_stats']['system_cpu_usage']
                        
                        if system_delta > 0:
                            cpu_percent = (cpu_delta / system_delta) * len(stats['cpu_stats']['cpu_usage']['percpu_usage']) * 100
                        
                        # Memory usage in MB
                        memory_usage = stats['memory_stats']['usage'] / (1024 * 1024)
                        
                        # Restart count
                        restarts = container.attrs['RestartCount']
                        
                    except Exception as e:
                        logger.warning(f"Failed to get stats for {service_name}: {e}")
                
                services.append({
                    'name': service_name,
                    'image': compose_service.get('Image', 'unknown'),
                    'state': 'running' if state == 'running' else 'stopped',
                    'status': compose_service.get('Status', 'unknown'),
                    'ports': compose_service.get('Publishers', []),
                    'cpu': round(cpu_percent, 2),
                    'memory': round(memory_usage, 2),
                    'restarts': restarts
                })
                
        except Exception as e:
            logger.error(f"Failed to get Docker status: {e}")
        
        return services
    
    async def start_service(self, service_name: str) -> Dict:
        """Start a Docker Compose service"""
        try:
            start_time = datetime.now()
            
            result = subprocess.run(
                ['docker', 'compose', 'start', service_name],
                capture_output=True,
                text=True,
                cwd='/Users/mandymarigjervikrygg/Desktop/Krins-Studio/KRINS-Chronicle-Keeper'
            )
            
            duration = (datetime.now() - start_time).total_seconds()
            
            if result.returncode == 0:
                return {
                    'success': True,
                    'output': f"Service {service_name} started successfully",
                    'duration': duration,
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return {
                    'success': False,
                    'output': result.stdout,
                    'error': result.stderr,
                    'duration': duration,
                    'timestamp': datetime.now().isoformat()
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'duration': 0,
                'timestamp': datetime.now().isoformat()
            }
    
    async def stop_service(self, service_name: str) -> Dict:
        """Stop a Docker Compose service"""
        try:
            start_time = datetime.now()
            
            result = subprocess.run(
                ['docker', 'compose', 'stop', service_name],
                capture_output=True,
                text=True,
                cwd='/Users/mandymarigjervikrygg/Desktop/Krins-Studio/KRINS-Chronicle-Keeper'
            )
            
            duration = (datetime.now() - start_time).total_seconds()
            
            if result.returncode == 0:
                return {
                    'success': True,
                    'output': f"Service {service_name} stopped successfully",
                    'duration': duration,
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return {
                    'success': False,
                    'output': result.stdout,
                    'error': result.stderr,
                    'duration': duration,
                    'timestamp': datetime.now().isoformat()
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'duration': 0,
                'timestamp': datetime.now().isoformat()
            }
    
    async def get_logs(self, service_name: str, lines: int = 100) -> str:
        """Get real Docker service logs"""
        try:
            result = subprocess.run(
                ['docker', 'compose', 'logs', '--tail', str(lines), service_name],
                capture_output=True,
                text=True,
                cwd='/Users/mandymarigjervikrygg/Desktop/Krins-Studio/KRINS-Chronicle-Keeper'
            )
            
            if result.returncode == 0:
                return result.stdout
            else:
                return f"Error getting logs: {result.stderr}"
                
        except Exception as e:
            return f"Error getting logs: {str(e)}"
    
    async def get_system_health(self) -> Dict:
        """Get overall system health"""
        try:
            services = await self.get_status()
            
            healthy_services = sum(1 for s in services if s['state'] == 'running')
            total_services = len(services)
            
            # System resource usage
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            overall_status = 'healthy'
            if healthy_services < total_services:
                overall_status = 'warning'
            if healthy_services < total_services * 0.5:
                overall_status = 'error'
            
            return {
                'overall': overall_status,
                'services': services,
                'metrics': {
                    'cpu': cpu_percent,
                    'memory': memory.percent,
                    'disk': disk.percent
                },
                'summary': {
                    'healthy_services': healthy_services,
                    'total_services': total_services,
                    'uptime': self._get_system_uptime()
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get system health: {e}")
            return {
                'overall': 'error',
                'services': [],
                'metrics': {},
                'error': str(e)
            }
    
    def _get_system_uptime(self) -> str:
        """Get system uptime"""
        try:
            uptime_seconds = psutil.boot_time()
            uptime = datetime.now() - datetime.fromtimestamp(uptime_seconds)
            days = uptime.days
            hours, remainder = divmod(uptime.seconds, 3600)
            minutes, _ = divmod(remainder, 60)
            
            return f"{days}d {hours}h {minutes}m"
        except:
            return "unknown"

# Singleton instance
docker_manager = DockerManager()