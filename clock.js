// file clock.js
// author Christian Pujol (pujolchr AT gmail.com)
// 04/02/2017


// ====== Global Variables ================================
/* global Notification */
const styleString =
    'background: -ms-linear-gradient(bottom, ' +
    '%color, %color  %percent%, ' +
    '#eee %percent%, #eee 100%); ' +
    'background: -moz-linear-gradient(bottom, ' +
    '%color, %color  %percent%, ' +
    '#eee %percent%, #eee 100%); ' +
    'background: linear-gradient(0, ' +
    '%color, %color  %percent%, ' +
    '#eee %percent%, #eee 100%); ' +
    'border: 3px solid %color;';

const message = 'End of times!';

const startTimeLeft = 1;
const startTimeRight = 1;

const colors = {
  left: '#5bc0de',
  right: '#5bc85c',
};

let notificationAllowed = false;
let onDisplay = 'left';

/* eslint-disable no-use-before-define, no-new */
const timers = {
  left: new Timer(startTimeLeft * 60, 'left'),
  right: new Timer(startTimeRight * 60, 'right'),
};
/* eslint-enable no-use-before-define, no-new  */
// ===========  helper functions ==========================

function pad(number, width) {
  let string = number.toString();
  while (string.length < width) {
    string = `0${string}`;
  }
  return string;
}

function display(timer) {
  const time = timer.remain();
  document.getElementById('timer').textContent =
        `${pad(time[0], 2)
        }:${
        pad(time[1], 2)
        }:${
        pad(time[2], 2)}`;
}

function fill(timer) {
  const percent = Math.floor((timer.count * 100) / timer.time);
  const color = colors[timer.timerId];

  let styled = styleString.replace(/%color/g, color);
  styled = styled.replace(/%percent/g, percent);
  document.getElementById('filling').setAttribute('style', styled);
}

function startCount(timer) {
  if (timer.count >= timer.time) {
    timer.stop();
    timer.setCount(0);
    timer.ring();
    return;
  }
  timer.increase();
  display(timer);
  fill(timer);
}

function ring(timerId) {
  if (notificationAllowed === 'granted') {
    // eslint-disable-next-line no-new
    new Notification(message);
    // eslint-disable-next-line no-console
  } else console.log(Notification.permission);

  if (timerId === 'right') {
    timers.left.start();
    onDisplay = 'left';
  } else if (timerId === 'left') {
    timers.right.start();
    onDisplay = 'right';
  }
}

function action() {
  if (timers[onDisplay].timer) {
    timers[onDisplay].stop();
    document.getElementById('action').textContent = 'Start';
  } else {
    timers[onDisplay].start();
    document.getElementById('action').textContent = 'Stop';
  }
}

    // eslint-disable-next-line no-unused-vars
function add(timerId, n) {
  let time = document.getElementById(`${timerId}-time`).textContent;
  time = parseInt(time, 10) + n;
  if (time < 0) time = 0;
  document.getElementById(`${timerId}-time`).textContent = time;
  timers[timerId].setTime(time);
}

// ===== an object that ring after a certain time ==========
function Timer(time, timerId) {
  this.time = time;
  this.timer = 0;
  this.count = 0;
  this.timerId = timerId;

    // on press start
  this.start = () => {
    if (!this.timer) {
      this.timer = setInterval(startCount, 1000, this);
    }
  };

  this.increase = () => {
    this.count += 1;
  };

    // on press stop
  this.stop = () => {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
    }
  };

  this.setCount = (count) => {
    this.count = count;
    return count;
  };
    // set time limit
  this.setTime = (t) => {
    this.time = t * 60;
    if (this.time < 0) this.time = 0;
  };

  this.ring = () => ring(this.timerId);

  this.remain = () => {
    const secondLeft = this.time - this.count;
    let minutes = Math.floor(secondLeft / 60);
    const second = secondLeft % 60;
    const hour = Math.floor(minutes / 60);
    minutes %= 60;

    return [hour, minutes, second];
  };
}

// init start times
document.getElementById('left-time').textContent = startTimeLeft;
document.getElementById('right-time').textContent = startTimeRight;

// ===== Listen for the event. ============================
document.getElementById('display').addEventListener('click', action);

// ===== ask permission for notification ==================
if ('Notification' in window) {
  Notification.requestPermission();
  notificationAllowed = Notification.permission;
}

