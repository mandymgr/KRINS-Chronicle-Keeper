#!/usr/bin/env python3
"""
🚀 Dev Memory OS - Simple HTTP Server
Ultra-lightweight server using Python's built-in modules
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
from datetime import datetime, timedelta
import threading
import webbrowser
import time

# Mock data
mock_adrs = [
    {
        "id": "1",
        "title": "Use PostgreSQL for Primary Database",
        "status": "accepted",
        "problem_statement": "We need a reliable, ACID-compliant database",
        "author_name": "Backend Specialist",
        "created_at": "2024-01-15T10:00:00Z",
        "similarity": 0.95,
        "context": "Database architecture decision"
    },
    {
        "id": "2",
        "title": "Implement AI Team Coordination System",
        "status": "accepted",
        "problem_statement": "Need efficient AI specialist coordination",
        "author_name": "Krin (Team Leader)",
        "created_at": "2024-02-20T14:30:00Z",
        "similarity": 0.87,
        "context": "Revolutionary AI team management"
    }
]

mock_patterns = [
    {
        "id": "1",
        "name": "Repository Pattern",
        "description": "Encapsulates data access logic",
        "category": "Data Access",
        "effectiveness_score": 4.2,
        "usage_count": 156,
        "author_name": "Architecture Team",
        "created_at": "2024-01-10T08:00:00Z"
    },
    {
        "id": "2",
        "name": "Observer Pattern",
        "description": "Define one-to-many dependency between objects",
        "category": "Behavioral",
        "effectiveness_score": 4.5,
        "usage_count": 203,
        "author_name": "Design Team",
        "created_at": "2024-01-25T16:45:00Z"
    }
]

mock_activities = [
    {
        "id": 1,
        "specialist": "krin",
        "specialistName": "Krin (Team Leader)",
        "emoji": "🚀",
        "message": "AI Team Coordination System initialized successfully",
        "type": "success",
        "timestamp": (datetime.now() - timedelta(minutes=5)).isoformat()
    },
    {
        "id": 2,
        "specialist": "backend",
        "specialistName": "Backend Specialist",
        "emoji": "⚙️",
        "message": "Python HTTP server deployed with zero dependencies",
        "type": "completed",
        "timestamp": (datetime.now() - timedelta(minutes=2)).isoformat()
    },
    {
        "id": 3,
        "specialist": "frontend",
        "specialistName": "Frontend Specialist",
        "emoji": "🎨",
        "message": "React app ready for demonstration",
        "type": "active",
        "timestamp": datetime.now().isoformat()
    }
]

class DevMemoryHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        path = self.path
        response = {}
        
        if path == '/':
            response = {
                "message": "🚀 Dev Memory OS Python Server",
                "status": "operational",
                "features": ["Zero dependencies", "Built-in Python HTTP server", "CORS enabled"],
                "timestamp": datetime.now().isoformat()
            }
        elif path == '/health':
            response = {
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "services": {"database": "connected", "search": "operational"}
            }
        elif path.startswith('/api/patterns/recommend'):
            parsed = urllib.parse.urlparse(path)
            query_params = urllib.parse.parse_qs(parsed.query)
            limit = int(query_params.get('limit', [5])[0])
            
            response = {
                "success": True,
                "recommendations": mock_patterns[:limit],
                "patterns": mock_patterns[:limit],
                "total_found": len(mock_patterns),
                "timestamp": datetime.now().isoformat()
            }
        elif path == '/api/ai-team/activities':
            response = {
                "success": True,
                "activities": mock_activities,
                "total": len(mock_activities),
                "timestamp": datetime.now().isoformat()
            }
        else:
            response = {"error": "Not found", "path": path}
        
        self.wfile.write(json.dumps(response, indent=2).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            request_data = json.loads(post_data.decode('utf-8'))
        except:
            request_data = {}
        
        path = self.path
        
        if path == '/api/search/semantic':
            query = request_data.get('query', '')
            max_results = request_data.get('max_results', 10)
            
            print(f"🔍 Semantic search: '{query}'")
            
            # Simulate processing time
            time.sleep(0.5)
            
            response = {
                "success": True,
                "query": query,
                "total_results": len(mock_adrs) + len(mock_patterns),
                "results_by_type": {
                    "adrs": mock_adrs[:max_results//2],
                    "patterns": mock_patterns[:max_results//2],
                    "knowledge": []
                },
                "timestamp": datetime.now().isoformat()
            }
        else:
            response = {"error": "Not found", "path": path}
        
        self.wfile.write(json.dumps(response, indent=2).encode())

def run_server(port=8000):
    """Start the HTTP server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, DevMemoryHandler)
    
    print(f"\n🌟 ===================================")
    print(f"🚀 Dev Memory OS Server Started!")
    print(f"===================================")
    print(f"📡 Server: http://localhost:{port}")
    print(f"📊 Health: http://localhost:{port}/health")
    print(f"🔍 Search: POST http://localhost:{port}/api/search/semantic")
    print(f"💡 Patterns: http://localhost:{port}/api/patterns/recommend")
    print(f"🤖 Activities: http://localhost:{port}/api/ai-team/activities")
    print(f"===================================")
    print(f"✨ Features: Zero dependencies, CORS enabled")
    print(f"⚡ Performance: Built-in Python HTTP server")
    print(f"===================================\n")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        httpd.shutdown()

if __name__ == "__main__":
    run_server()