import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:5000/api';
let token = '';
let postId = '';
let userId = '';

async function runTests() {
  console.log('Starting E2E API Tests...');
  try {
    // 1. Register
    console.log('1. Registering user...');
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    });
    token = registerRes.data.token;
    userId = registerRes.data.user._id;
    console.log('✅ Registered successfully');

    // 2. Create Post
    console.log('2. Creating post...');
    const createRes = await axios.post(`${API_URL}/posts`, {
      title: 'My Test Post',
      content: 'This is a test content',
      coverImage: 'http://example.com/image.jpg'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    postId = createRes.data.data._id;
    console.log('✅ Post created successfully:', postId);

    // 3. Fetch Public Posts
    console.log('3. Fetching public posts...');
    const publicRes = await axios.get(`${API_URL}/posts/public`);
    const posts = publicRes.data.data;
    if (posts.some(p => p._id === postId)) {
      console.log('✅ Post found in public feed');
    } else {
      throw new Error('Post not found in public feed');
    }

    // 4. Fetch Single Post (Public)
    console.log('4. Fetching single post publicly...');
    const singleRes = await axios.get(`${API_URL}/posts/${postId}`);
    if (singleRes.data.data.title === 'My Test Post') {
      console.log('✅ Single post fetched successfully');
    } else {
      throw new Error('Single post data mismatch');
    }

    // 5. Update Post
    console.log('5. Updating post...');
    const updateRes = await axios.put(`${API_URL}/posts/${postId}`, {
      title: 'Updated Test Post',
      content: 'Updated content',
      coverImage: 'http://example.com/updated.jpg'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (updateRes.data.data.title === 'Updated Test Post') {
      console.log('✅ Post updated successfully');
    } else {
      throw new Error('Post update failed');
    }

    // 6. Delete Post
    console.log('6. Deleting post...');
    await axios.delete(`${API_URL}/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Post deleted successfully');

    console.log('🎉 ALL TESTS PASSED!');
  } catch (err) {
    console.error('❌ TEST FAILED:', err.response ? err.response.data : err.message);
  }
}

runTests();
