"""
🚀 KRINS-Chronicle-Keeper Startup Script
Initialize database and create default admin user
"""

import asyncio
import os
import sys
from pathlib import Path
import logging
from getpass import getpass

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from database.connection import init_database, get_db_session_context
from auth.service import AuthService
from auth.models import UserRegistration

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

async def create_admin_user():
    """Create default admin user"""
    try:
        async with get_db_session_context() as db:
            auth_service = AuthService(db)
            
            # Check if admin user exists
            existing_admin = await auth_service.get_user_by_username("admin")
            if existing_admin:
                logger.info("✅ Admin user already exists")
                return
            
            # Get admin details
            print("🔧 Creating admin user...")
            
            admin_email = input("Admin email (admin@krins.ai): ") or "admin@krins.ai"
            
            # Use environment variable for password, or prompt
            admin_password = os.getenv("KRINS_ADMIN_PASSWORD")
            if not admin_password:
                admin_password = getpass("Admin password: ")
                if not admin_password:
                    admin_password = "admin123"  # Default for development
                    logger.warning("⚠️ Using default password 'admin123' - change in production!")
            
            # Create admin user
            admin_registration = UserRegistration(
                username="admin",
                email=admin_email,
                password=admin_password,
                full_name="System Administrator"
            )
            
            admin_user = await auth_service.register_user(admin_registration, "127.0.0.1")
            
            # Assign admin role
            rbac_service = auth_service.rbac_service
            await rbac_service.assign_role_to_user(str(admin_user.id), "super_admin")
            
            logger.info(f"✅ Admin user created: {admin_user.username} ({admin_user.email})")
            
    except Exception as e:
        logger.error(f"❌ Failed to create admin user: {str(e)}")
        raise

async def create_demo_users():
    """Create demo users for development"""
    demo_users = [
        {
            "username": "architect",
            "email": "architect@krins.ai", 
            "password": "architect123",
            "full_name": "System Architect",
            "role": "architect"
        },
        {
            "username": "developer",
            "email": "developer@krins.ai",
            "password": "developer123", 
            "full_name": "Senior Developer",
            "role": "developer"
        },
        {
            "username": "analyst",
            "email": "analyst@krins.ai",
            "password": "analyst123",
            "full_name": "Business Analyst", 
            "role": "viewer"
        }
    ]
    
    try:
        async with get_db_session_context() as db:
            auth_service = AuthService(db)
            
            for demo_user in demo_users:
                # Check if user exists
                existing_user = await auth_service.get_user_by_username(demo_user["username"])
                if existing_user:
                    logger.info(f"⏭️ Demo user {demo_user['username']} already exists")
                    continue
                
                # Create demo user
                user_registration = UserRegistration(
                    username=demo_user["username"],
                    email=demo_user["email"],
                    password=demo_user["password"],
                    full_name=demo_user["full_name"]
                )
                
                user = await auth_service.register_user(user_registration, "127.0.0.1")
                
                # Assign role
                rbac_service = auth_service.rbac_service
                await rbac_service.assign_role_to_user(str(user.id), demo_user["role"])
                
                logger.info(f"✅ Demo user created: {user.username} ({user.email}) - Role: {demo_user['role']}")
    
    except Exception as e:
        logger.error(f"❌ Failed to create demo users: {str(e)}")
        raise

async def display_startup_info():
    """Display startup information"""
    print("\n" + "="*60)
    print("🧠 KRINS-Chronicle-Keeper - Authentication System")
    print("="*60)
    print("🚀 Database initialized successfully!")
    print("🛡️ Authentication system configured")
    print("👥 Default roles and permissions created")
    print("🔑 Admin user created")
    
    if os.getenv("KRINS_ENV") == "development":
        print("👨‍💻 Demo users created for development")
        print("\nDemo Login Credentials:")
        print("  • Admin: admin / admin123")
        print("  • Architect: architect / architect123") 
        print("  • Developer: developer / developer123")
        print("  • Analyst: analyst / analyst123")
    
    print("\n📚 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/health")
    print("🔐 Auth Endpoints: http://localhost:8000/auth/*")
    print("="*60)

async def main():
    """Main startup function"""
    try:
        logger.info("🚀 Starting KRINS-Chronicle-Keeper initialization...")
        
        # Initialize database
        logger.info("🗄️ Initializing database...")
        await init_database()
        
        # Create admin user
        logger.info("👤 Setting up admin user...")
        await create_admin_user()
        
        # Create demo users in development
        if os.getenv("KRINS_ENV", "development") == "development":
            logger.info("👨‍💻 Creating demo users...")
            await create_demo_users()
        
        # Display info
        await display_startup_info()
        
        logger.info("✅ KRINS-Chronicle-Keeper initialization completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Initialization failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    # Set development environment if not specified
    if not os.getenv("KRINS_ENV"):
        os.environ["KRINS_ENV"] = "development"
    
    asyncio.run(main())