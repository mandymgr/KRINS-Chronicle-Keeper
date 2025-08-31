import mongoose from 'mongoose';
import { User, IUser } from '../../../src/models/User';
import bcrypt from 'bcryptjs';

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
      expect(savedUser.isActive).toBe(true); // Default value
      expect(savedUser.lastSeen).toBeDefined();
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should require username', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Username is required');
    });

    it('should require email', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Email is required');
    });

    it('should require password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Password is required');
    });

    it('should validate email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Please enter a valid email');
    });

    it('should validate username format', async () => {
      const userData = {
        username: 'test@user!',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Username can only contain letters, numbers, and underscores');
    });

    it('should validate username length - minimum', async () => {
      const userData = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Username must be at least 3 characters long');
    });

    it('should validate username length - maximum', async () => {
      const userData = {
        username: 'a'.repeat(31),
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Username cannot exceed 30 characters');
    });

    it('should validate password length', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '12345'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Password must be at least 6 characters long');
    });

    it('should enforce unique username', async () => {
      const userData1 = {
        username: 'testuser',
        email: 'test1@example.com',
        password: 'password123'
      };

      const userData2 = {
        username: 'testuser',
        email: 'test2@example.com',
        password: 'password123'
      };

      await new User(userData1).save();
      
      const user2 = new User(userData2);
      await expect(user2.save()).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      const userData1 = {
        username: 'testuser1',
        email: 'test@example.com',
        password: 'password123'
      };

      const userData2 = {
        username: 'testuser2',
        email: 'test@example.com',
        password: 'password123'
      };

      await new User(userData1).save();
      
      const user2 = new User(userData2);
      await expect(user2.save()).rejects.toThrow();
    });

    it('should convert email to lowercase', async () => {
      const userData = {
        username: 'testuser',
        email: 'Test@Example.COM',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.email).toBe('test@example.com');
    });

    it('should trim whitespace from username and email', async () => {
      const userData = {
        username: '  testuser  ',
        email: '  test@example.com  ',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.username).toBe('testuser');
      expect(savedUser.email).toBe('test@example.com');
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const password = 'password123';
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.password).not.toBe(password);
      expect(savedUser.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt format
    });

    it('should not rehash password if not modified', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();
      const originalHash = savedUser.password;

      // Update a different field
      savedUser.username = 'updateduser';
      const updatedUser = await savedUser.save();

      expect(updatedUser.password).toBe(originalHash);
    });

    it('should rehash password if modified', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();
      const originalHash = savedUser.password;

      // Update password
      savedUser.password = 'newpassword123';
      const updatedUser = await savedUser.save();

      expect(updatedUser.password).not.toBe(originalHash);
      expect(updatedUser.password).toMatch(/^\$2[ayb]\$.{56}$/);
    });
  });

  describe('Instance Methods', () => {
    let user: IUser;

    beforeEach(async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      user = new User(userData);
      await user.save();
    });

    describe('comparePassword', () => {
      it('should return true for correct password', async () => {
        const isMatch = await user.comparePassword('password123');
        expect(isMatch).toBe(true);
      });

      it('should return false for incorrect password', async () => {
        const isMatch = await user.comparePassword('wrongpassword');
        expect(isMatch).toBe(false);
      });

      it('should handle empty password gracefully', async () => {
        const isMatch = await user.comparePassword('');
        expect(isMatch).toBe(false);
      });
    });

    describe('toPublicJSON', () => {
      it('should return public user data without password', () => {
        const publicData = user.toPublicJSON();

        expect(publicData).toHaveProperty('id');
        expect(publicData).toHaveProperty('username', user.username);
        expect(publicData).toHaveProperty('email', user.email);
        expect(publicData).toHaveProperty('isActive', user.isActive);
        expect(publicData).toHaveProperty('lastSeen');
        expect(publicData).toHaveProperty('createdAt');
        
        expect(publicData).not.toHaveProperty('password');
        expect(publicData).not.toHaveProperty('__v');
        expect(publicData).not.toHaveProperty('_id');
      });

      it('should include avatar if present', async () => {
        user.avatar = 'https://example.com/avatar.jpg';
        await user.save();

        const publicData = user.toPublicJSON();
        expect(publicData).toHaveProperty('avatar', user.avatar);
      });
    });

    describe('updateLastSeen', () => {
      it('should update lastSeen timestamp', async () => {
        const originalLastSeen = user.lastSeen;
        
        // Wait a bit to ensure timestamp difference
        await new Promise(resolve => setTimeout(resolve, 10));
        
        await user.updateLastSeen();
        
        expect(user.lastSeen.getTime()).toBeGreaterThan(originalLastSeen.getTime());
      });
    });
  });

  describe('Virtuals', () => {
    let user: IUser;

    beforeEach(async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      user = new User(userData);
      await user.save();
    });

    describe('isOnline', () => {
      it('should return true for recent lastSeen', () => {
        user.lastSeen = new Date(); // Now
        expect(user.isOnline).toBe(true);
      });

      it('should return false for old lastSeen', () => {
        user.lastSeen = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
        expect(user.isOnline).toBe(false);
      });

      it('should return true for lastSeen just under 5 minutes ago', () => {
        user.lastSeen = new Date(Date.now() - 4 * 60 * 1000); // 4 minutes ago
        expect(user.isOnline).toBe(true);
      });

      it('should return false for lastSeen just over 5 minutes ago', () => {
        user.lastSeen = new Date(Date.now() - 6 * 60 * 1000); // 6 minutes ago
        expect(user.isOnline).toBe(false);
      });
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create test users
      const users = [
        {
          username: 'activeuser1',
          email: 'active1@example.com',
          password: 'password123',
          isActive: true,
          lastSeen: new Date()
        },
        {
          username: 'activeuser2',
          email: 'active2@example.com',
          password: 'password123',
          isActive: true,
          lastSeen: new Date(Date.now() - 60000) // 1 minute ago
        },
        {
          username: 'inactiveuser',
          email: 'inactive@example.com',
          password: 'password123',
          isActive: false,
          lastSeen: new Date()
        }
      ];

      await User.insertMany(users);
    });

    describe('findActiveUsers', () => {
      it('should return only active users', async () => {
        const activeUsers = await (User as any).findActiveUsers();
        
        expect(activeUsers).toHaveLength(2);
        activeUsers.forEach((user: IUser) => {
          expect(user.isActive).toBe(true);
        });
      });

      it('should sort by lastSeen descending', async () => {
        const activeUsers = await (User as any).findActiveUsers();
        
        expect(activeUsers[0].lastSeen.getTime()).toBeGreaterThanOrEqual(
          activeUsers[1].lastSeen.getTime()
        );
      });
    });

    describe('findByEmailOrUsername', () => {
      it('should find user by email', async () => {
        const user = await (User as any).findByEmailOrUsername('active1@example.com');
        
        expect(user).toBeTruthy();
        expect(user.email).toBe('active1@example.com');
        expect(user.password).toBeDefined(); // Should include password
      });

      it('should find user by username', async () => {
        const user = await (User as any).findByEmailOrUsername('activeuser1');
        
        expect(user).toBeTruthy();
        expect(user.username).toBe('activeuser1');
        expect(user.password).toBeDefined(); // Should include password
      });

      it('should be case insensitive for email', async () => {
        const user = await (User as any).findByEmailOrUsername('ACTIVE1@EXAMPLE.COM');
        
        expect(user).toBeTruthy();
        expect(user.email).toBe('active1@example.com');
      });

      it('should return null for non-existent user', async () => {
        const user = await (User as any).findByEmailOrUsername('nonexistent@example.com');
        
        expect(user).toBeNull();
      });
    });
  });
});