import fetch from 'node-fetch';

async function testChat() {
  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello, chatbot!' })
    });

    const data = await response.json();
    console.log('Full response:', JSON.stringify(data, null, 2));
    console.log('Bot response:', data.response);
  } catch (error) {
    console.error('Error testing chat:', error);
  }
}

testChat();