function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days*24*60*60*1000).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const key = encodeURIComponent(name) + "=";
  return document.cookie.split("; ").reduce((acc, part) => {
    if (part.indexOf(key) === 0) acc = decodeURIComponent(part.substring(key.length));
    return acc;
  }, null);
}

function eraseCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

const CK = {
  likes: "lab6_likes",
  dislikes: "lab6_dislikes",
  vote: "lab6_vote",
  commented: "lab6_commented",
  comments: "lab6_comments"
};

const DEFAULT_COUNTS = { likes: 0, dislikes: 0 };

const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");
const likeCountEl = document.getElementById("likeCount");
const dislikeCountEl = document.getElementById("dislikeCount");
const input = document.getElementById("commentInput");
const submitComment = document.getElementById("submitComment");
const clearInput = document.getElementById("clearInput");
const resetAll = document.getElementById("resetAll");
const commentsList = document.getElementById("comments");
const toast = document.getElementById("toast");

// ===== Utility functions =====
function showToast(msg, ms = 1400) {
  toast.textContent = msg;
  toast.style.display = "block";
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.style.display = "none", ms);
}

function readIntCookie(key, fallback) {
  const v = parseInt(getCookie(key), 10);
  return Number.isFinite(v) ? v : fallback;
}

function readJsonCookie(key, fallback) {
  try {
    const v = getCookie(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function writeJsonCookie(key, obj) {
  setCookie(key, JSON.stringify(obj));
}

function setPicked(which) {
  likeBtn.classList.toggle("picked", which === "like");
  dislikeBtn.classList.toggle("picked", which === "dislike");
  likeBtn.toggleAttribute("disabled", !!which);
  dislikeBtn.toggleAttribute("disabled", !!which);
}

function renderCounts() {
  likeCountEl.textContent = readIntCookie(CK.likes, DEFAULT_COUNTS.likes);
  dislikeCountEl.textContent = readIntCookie(CK.dislikes, DEFAULT_COUNTS.dislikes);
}

function renderComments() {
  const arr = readJsonCookie(CK.comments, []);
  commentsList.innerHTML = "";
  arr.forEach(txt => {
    const li = document.createElement("li");
    li.textContent = txt;
    commentsList.appendChild(li);
  });
}

(function init() {
  if (getCookie(CK.likes) === null) setCookie(CK.likes, DEFAULT_COUNTS.likes);
  if (getCookie(CK.dislikes) === null) setCookie(CK.dislikes, DEFAULT_COUNTS.dislikes);
  if (getCookie(CK.comments) === null) writeJsonCookie(CK.comments, []);

  renderCounts();
  renderComments();

  const vote = getCookie(CK.vote);
  setPicked(vote || null);
})();

likeBtn.addEventListener("click", () => handleVote("like"));
dislikeBtn.addEventListener("click", () => handleVote("dislike"));

function handleVote(which) {
  if (getCookie(CK.vote)) {
    showToast("You already voted. Use Reset to change your vote.");
    return;
  }

  const likeVal = readIntCookie(CK.likes, DEFAULT_COUNTS.likes);
  const dislikeVal = readIntCookie(CK.dislikes, DEFAULT_COUNTS.dislikes);

  if (which === "like") setCookie(CK.likes, likeVal + 1);
  else setCookie(CK.dislikes, dislikeVal + 1);

  setCookie(CK.vote, which);
  renderCounts();
  setPicked(which);
  showToast(`Thanks for your ${which}!`);
}

submitComment.addEventListener("click", () => {
  const txt = input.value.trim();
  if (!txt) return showToast("Write something first 🙂");
  if (getCookie(CK.commented) === "true") {
    showToast("You already left a comment. Use Reset to clear it.");
    return;
  }

  const arr = readJsonCookie(CK.comments, []);
  arr.push(txt);
  writeJsonCookie(CK.comments, arr);
  setCookie(CK.commented, "true");

  input.value = "";
  renderComments();
  showToast("Comment submitted!");
});

clearInput.addEventListener("click", () => {
  input.value = "";
  input.focus();
});

resetAll.addEventListener("click", () => {
  const vote = getCookie(CK.vote);
  if (vote === "like") {
    const v = Math.max(0, readIntCookie(CK.likes, DEFAULT_COUNTS.likes) - 1);
    setCookie(CK.likes, v);
  } else if (vote === "dislike") {
    const v = Math.max(0, readIntCookie(CK.dislikes, DEFAULT_COUNTS.dislikes) - 1);
    setCookie(CK.dislikes, v);
  }

  eraseCookie(CK.vote);
  eraseCookie(CK.commented);
  writeJsonCookie(CK.comments, []);

  setPicked(null);
  renderCounts();
  renderComments();
  input.value = "";
  showToast("Your vote & comments were reset. You can vote again now.");
});
