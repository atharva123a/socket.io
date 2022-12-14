const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const roomUsers = document.getElementById('users');

const socket = io();

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.emit('userJoin', { username, room });

// the event "message" is being listened to here:
socket.on('message', (message) => {
  outputMessage(message);
  // scroll to bottom:
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('roomUsers', ({ room, users }) => {
  outputRoom(room);
  outputUsers(users);
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;

  // emit for the backend:
  socket.emit('chatMessage', msg);

  // Clear Input:
  e.target.elements.msg.value = '';

  e.target.elements.msg.focus();
});

function outputMessage(message) {
  const div = document.createElement('div');

  div.classList.add('message');

  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;

  document.querySelector('.chat-messages').appendChild(div);
}

// output Room Name:
function outputRoom(room) {
  roomName.innerText = room;
}

// output users:
function outputUsers(users) {
  roomUsers.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join('')}
  `;
}
