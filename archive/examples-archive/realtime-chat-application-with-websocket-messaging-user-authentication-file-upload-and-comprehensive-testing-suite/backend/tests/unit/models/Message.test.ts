import mongoose, { Types } from 'mongoose';
import { Message, IMessage } from '../../../src/models/Message';
import { User, IUser } from '../../../src/models/User';

describe('Message Model', () => {
  let testUser: IUser;
  let userId: Types.ObjectId;

  beforeEach(async () => {
    // Create a test user
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    await testUser.save();
    userId = testUser._id;
  });

  describe('Schema Validation', () => {
    it('should create a valid text message', async () => {
      const messageData = {
        text: 'Hello world!',
        userId,
        username: 'testuser',
        type: 'text'
      };

      const message = new Message(messageData);
      const savedMessage = await message.save();

      expect(savedMessage._id).toBeDefined();
      expect(savedMessage.text).toBe(messageData.text);
      expect(savedMessage.userId).toEqual(userId);
      expect(savedMessage.username).toBe(messageData.username);
      expect(savedMessage.type).toBe('text');
      expect(savedMessage.isEdited).toBe(false);
      expect(savedMessage.reactions).toHaveLength(0);
      expect(savedMessage.createdAt).toBeDefined();
      expect(savedMessage.updatedAt).toBeDefined();
    });

    it('should create a valid file message', async () => {
      const messageData = {
        text: 'Shared a file',
        userId,
        username: 'testuser',
        type: 'file' as const,
        fileUrl: 'https://example.com/file.pdf',
        fileName: 'document.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf'
      };

      const message = new Message(messageData);
      const savedMessage = await message.save();

      expect(savedMessage.type).toBe('file');
      expect(savedMessage.fileUrl).toBe(messageData.fileUrl);
      expect(savedMessage.fileName).toBe(messageData.fileName);
      expect(savedMessage.fileSize).toBe(messageData.fileSize);
      expect(savedMessage.mimeType).toBe(messageData.mimeType);
    });

    it('should create a valid system message', async () => {
      const messageData = {
        text: 'User joined the chat',
        userId,
        username: 'System',
        type: 'system' as const
      };

      const message = new Message(messageData);
      const savedMessage = await message.save();

      expect(savedMessage.type).toBe('system');
    });

    it('should require text', async () => {
      const messageData = {
        userId,
        username: 'testuser'
      };

      const message = new Message(messageData);
      
      await expect(message.save()).rejects.toThrow('Message text is required');
    });

    it('should require userId', async () => {
      const messageData = {
        text: 'Hello world!',
        username: 'testuser'
      };

      const message = new Message(messageData);
      
      await expect(message.save()).rejects.toThrow('User ID is required');
    });

    it('should require username', async () => {
      const messageData = {
        text: 'Hello world!',
        userId
      };

      const message = new Message(messageData);
      
      await expect(message.save()).rejects.toThrow('Username is required');
    });

    it('should validate text length', async () => {
      const messageData = {
        text: 'a'.repeat(1001),
        userId,
        username: 'testuser'
      };

      const message = new Message(messageData);
      
      await expect(message.save()).rejects.toThrow('Message cannot exceed 1000 characters');
    });

    it('should validate message type', async () => {
      const messageData = {
        text: 'Hello world!',
        userId,
        username: 'testuser',
        type: 'invalid' as any
      };

      const message = new Message(messageData);
      
      await expect(message.save()).rejects.toThrow('Type must be either text, file, or system');
    });

    it('should default type to text', async () => {
      const messageData = {
        text: 'Hello world!',
        userId,
        username: 'testuser'
      };

      const message = new Message(messageData);
      const savedMessage = await message.save();

      expect(savedMessage.type).toBe('text');
    });

    it('should require fileUrl for file messages', async () => {
      const messageData = {
        text: 'File message',
        userId,
        username: 'testuser',
        type: 'file' as const,
        fileName: 'test.txt'
      };

      const message = new Message(messageData);
      
      await expect(message.save()).rejects.toThrow('File URL is required for file messages');
    });

    it('should require fileName for file messages', async () => {
      const messageData = {
        text: 'File message',
        userId,
        username: 'testuser',
        type: 'file' as const,
        fileUrl: 'https://example.com/file.txt'
      };

      const message = new Message(messageData);
      
      await expect(message.save()).rejects.toThrow('File name is required for file messages');
    });

    it('should validate fileUrl format', async () => {
      const messageData = {
        text: 'File message',
        userId,
        username: 'testuser',
        type: 'file' as const,
        fileUrl: 'invalid-url',
        fileName: 'test.txt'
      };

      const message = new Message(messageData);
      
      await expect(message.save()).rejects.toThrow('must be a valid URL');
    });

    it('should validate file size limits', async () => {
      const messageData = {
        text: 'File message',
        userId,
        username: 'testuser',
        type: 'file' as const,
        fileUrl: 'https://example.com/file.txt',
        fileName: 'test.txt',
        fileSize: 60 * 1024 * 1024 // 60MB
      };

      const message = new Message(messageData);
      
      await expect(message.save()).rejects.toThrow('File size cannot exceed 50MB');
    });

    it('should validate negative file size', async () => {
      const messageData = {
        text: 'File message',
        userId,
        username: 'testuser',
        type: 'file' as const,
        fileUrl: 'https://example.com/file.txt',
        fileName: 'test.txt',
        fileSize: -1
      };

      const message = new Message(messageData);
      
      await expect(message.save()).rejects.toThrow('File size cannot be negative');
    });

    it('should trim text content', async () => {
      const messageData = {
        text: '  Hello world!  ',
        userId,
        username: '  testuser  '
      };

      const message = new Message(messageData);
      const savedMessage = await message.save();

      expect(savedMessage.text).toBe('Hello world!');
      expect(savedMessage.username).toBe('testuser');
    });
  });

  describe('Message Editing', () => {
    let message: IMessage;

    beforeEach(async () => {
      message = new Message({
        text: 'Original message',
        userId,
        username: 'testuser'
      });
      await message.save();
    });

    it('should set isEdited to true when text is modified', async () => {
      expect(message.isEdited).toBe(false);
      expect(message.editedAt).toBeUndefined();

      message.text = 'Edited message';
      const savedMessage = await message.save();

      expect(savedMessage.isEdited).toBe(true);
      expect(savedMessage.editedAt).toBeDefined();
    });

    it('should not set isEdited when other fields are modified', async () => {
      message.username = 'newusername';
      const savedMessage = await message.save();

      expect(savedMessage.isEdited).toBe(false);
      expect(savedMessage.editedAt).toBeUndefined();
    });

    it('should not set isEdited on new messages', async () => {
      const newMessage = new Message({
        text: 'New message',
        userId,
        username: 'testuser'
      });

      const savedMessage = await newMessage.save();

      expect(savedMessage.isEdited).toBe(false);
      expect(savedMessage.editedAt).toBeUndefined();
    });
  });

  describe('Reactions', () => {
    let message: IMessage;
    let anotherUserId: Types.ObjectId;

    beforeEach(async () => {
      message = new Message({
        text: 'Test message',
        userId,
        username: 'testuser'
      });
      await message.save();

      anotherUserId = new Types.ObjectId();
    });

    describe('addReaction', () => {
      it('should add a reaction to message', async () => {
        await message.addReaction(userId, '👍');

        expect(message.reactions).toHaveLength(1);
        expect(message.reactions[0].userId).toEqual(userId);
        expect(message.reactions[0].emoji).toBe('👍');
        expect(message.reactions[0].createdAt).toBeDefined();
      });

      it('should replace existing reaction from same user with same emoji', async () => {
        await message.addReaction(userId, '👍');
        await message.addReaction(userId, '👍');

        expect(message.reactions).toHaveLength(1);
      });

      it('should allow same user to have different reactions', async () => {
        await message.addReaction(userId, '👍');
        await message.addReaction(userId, '❤️');

        expect(message.reactions).toHaveLength(2);
        expect(message.reactions.map(r => r.emoji)).toContain('👍');
        expect(message.reactions.map(r => r.emoji)).toContain('❤️');
      });

      it('should allow different users to have same reaction', async () => {
        await message.addReaction(userId, '👍');
        await message.addReaction(anotherUserId, '👍');

        expect(message.reactions).toHaveLength(2);
        expect(message.reactions.every(r => r.emoji === '👍')).toBe(true);
      });
    });

    describe('removeReaction', () => {
      beforeEach(async () => {
        await message.addReaction(userId, '👍');
        await message.addReaction(userId, '❤️');
        await message.addReaction(anotherUserId, '👍');
      });

      it('should remove specific reaction from user', async () => {
        await message.removeReaction(userId, '👍');

        expect(message.reactions).toHaveLength(2);
        expect(message.reactions.find(r => r.userId.equals(userId) && r.emoji === '👍')).toBeUndefined();
        expect(message.reactions.find(r => r.userId.equals(userId) && r.emoji === '❤️')).toBeDefined();
        expect(message.reactions.find(r => r.userId.equals(anotherUserId) && r.emoji === '👍')).toBeDefined();
      });

      it('should not affect other reactions when removing non-existent reaction', async () => {
        const originalLength = message.reactions.length;
        await message.removeReaction(userId, '😄');

        expect(message.reactions).toHaveLength(originalLength);
      });
    });

    describe('getReactionCounts', () => {
      beforeEach(async () => {
        await message.addReaction(userId, '👍');
        await message.addReaction(anotherUserId, '👍');
        await message.addReaction(userId, '❤️');
      });

      it('should return correct reaction counts', () => {
        const counts = message.getReactionCounts();

        expect(counts).toEqual({
          '👍': 2,
          '❤️': 1
        });
      });

      it('should return empty object for no reactions', async () => {
        const emptyMessage = new Message({
          text: 'Empty message',
          userId,
          username: 'testuser'
        });

        const counts = emptyMessage.getReactionCounts();
        expect(counts).toEqual({});
      });
    });
  });

  describe('Instance Methods', () => {
    let message: IMessage;

    beforeEach(async () => {
      message = new Message({
        text: 'Test message',
        userId,
        username: 'testuser',
        type: 'text'
      });
      await message.save();
      
      await message.addReaction(userId, '👍');
    });

    describe('toPublicJSON', () => {
      it('should return public message data', () => {
        const publicData = message.toPublicJSON();

        expect(publicData).toHaveProperty('id');
        expect(publicData).toHaveProperty('text', message.text);
        expect(publicData).toHaveProperty('userId', message.userId);
        expect(publicData).toHaveProperty('username', message.username);
        expect(publicData).toHaveProperty('type', message.type);
        expect(publicData).toHaveProperty('isEdited', message.isEdited);
        expect(publicData).toHaveProperty('reactions');
        expect(publicData).toHaveProperty('reactionCounts');
        expect(publicData).toHaveProperty('timestamp');
        expect(publicData).toHaveProperty('createdAt');
        expect(publicData).toHaveProperty('updatedAt');

        expect(publicData).not.toHaveProperty('__v');
        expect(publicData).not.toHaveProperty('_id');
      });

      it('should include reaction counts', () => {
        const publicData = message.toPublicJSON();

        expect(publicData.reactionCounts).toEqual({ '👍': 1 });
      });

      it('should include file information for file messages', async () => {
        const fileMessage = new Message({
          text: 'File shared',
          userId,
          username: 'testuser',
          type: 'file',
          fileUrl: 'https://example.com/file.pdf',
          fileName: 'document.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf'
        });
        await fileMessage.save();

        const publicData = fileMessage.toPublicJSON();

        expect(publicData).toHaveProperty('fileUrl', 'https://example.com/file.pdf');
        expect(publicData).toHaveProperty('fileName', 'document.pdf');
        expect(publicData).toHaveProperty('fileSize', 1024);
        expect(publicData).toHaveProperty('mimeType', 'application/pdf');
      });
    });
  });

  describe('Static Methods', () => {
    let messages: IMessage[];

    beforeEach(async () => {
      // Create multiple test messages
      const messageData = [
        {
          text: 'First message',
          userId,
          username: 'testuser',
          type: 'text' as const,
          createdAt: new Date('2023-01-01T10:00:00Z')
        },
        {
          text: 'Second message',
          userId,
          username: 'testuser',
          type: 'text' as const,
          createdAt: new Date('2023-01-01T11:00:00Z')
        },
        {
          text: 'System message',
          userId,
          username: 'System',
          type: 'system' as const,
          createdAt: new Date('2023-01-01T12:00:00Z')
        }
      ];

      messages = await Message.insertMany(messageData);
    });

    describe('getMessages', () => {
      it('should return messages with default pagination', async () => {
        const result = await (Message as any).getMessages({});

        expect(result).toHaveLength(3);
        // Should be sorted by createdAt descending (newest first)
        expect(result[0].createdAt.getTime()).toBeGreaterThan(result[1].createdAt.getTime());
      });

      it('should limit results', async () => {
        const result = await (Message as any).getMessages({ limit: 2 });

        expect(result).toHaveLength(2);
      });

      it('should offset results', async () => {
        const result = await (Message as any).getMessages({ limit: 2, offset: 1 });

        expect(result).toHaveLength(2);
        // Should skip the first (newest) message
        expect(result[0]._id).not.toEqual(messages[2]._id);
      });

      it('should filter by userId', async () => {
        const result = await (Message as any).getMessages({ userId });

        expect(result).toHaveLength(3);
        result.forEach((msg: IMessage) => {
          expect(msg.userId).toEqual(userId);
        });
      });

      it('should filter by type', async () => {
        const result = await (Message as any).getMessages({ type: 'system' });

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('system');
      });

      it('should filter by date range', async () => {
        const after = new Date('2023-01-01T10:30:00Z');
        const result = await (Message as any).getMessages({ after });

        expect(result).toHaveLength(2); // Should exclude first message
      });
    });

    describe('getRecentMessages', () => {
      it('should return recent messages', async () => {
        const result = await (Message as any).getRecentMessages();

        expect(result).toHaveLength(3);
        // Should be sorted by newest first
        expect(result[0].createdAt.getTime()).toBeGreaterThan(result[1].createdAt.getTime());
      });

      it('should limit results', async () => {
        const result = await (Message as any).getRecentMessages(2);

        expect(result).toHaveLength(2);
      });
    });
  });

  describe('Virtuals', () => {
    let message: IMessage;

    beforeEach(async () => {
      message = new Message({
        text: 'Test message',
        userId,
        username: 'testuser'
      });
      await message.save();
    });

    describe('age', () => {
      it('should return message age in milliseconds', () => {
        const age = message.age;
        expect(typeof age).toBe('number');
        expect(age).toBeGreaterThan(0);
      });
    });

    describe('isRecent', () => {
      it('should return true for recent messages', () => {
        expect(message.isRecent).toBe(true);
      });

      it('should return false for old messages', async () => {
        const oldMessage = new Message({
          text: 'Old message',
          userId,
          username: 'testuser'
        });
        
        // Manually set old timestamp
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        oldMessage.createdAt = twoHoursAgo;

        expect(oldMessage.isRecent).toBe(false);
      });
    });
  });
});