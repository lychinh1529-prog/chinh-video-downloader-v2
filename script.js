"use strict";

/* ========================================
   CHINH VIDEO DOWNLOADER
   Frontend JavaScript
======================================== */

document.addEventListener("DOMContentLoaded", () => {
  const videoUrl = document.getElementById("videoUrl");
  const charCount = document.getElementById("charCount");
  const clearBtn = document.getElementById("clearBtn");
  const pasteBtn = document.getElementById("pasteBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const statusBox = document.getElementById("statusBox");
  const platformName = document.getElementById("platformName");
  const headerSettings = document.getElementById("headerSettings");

  const platforms = document.querySelectorAll(".platform");
  const navButtons = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".section");
  const goButtons = document.querySelectorAll("[data-go]");

  const MAX_LENGTH = 500;

  let selectedPlatform = "";
  let manualPlatform = false;

  /* ========================================
     NHẬN DIỆN NỀN TẢNG
  ======================================== */

  function detectPlatform(value) {
    if (!value.trim()) {
      return "";
    }

    let url;

    try {
      url = new URL(value.trim());
    } catch {
      return "";
    }

    if (!["http:", "https:"].includes(url.protocol)) {
      return "";
    }

    const host = url.hostname.toLowerCase().replace(/^www\./, "");

    if (
      host === "youtube.com" ||
      host.endsWith(".youtube.com") ||
      host === "youtu.be"
    ) {
      return "YouTube";
    }

    if (
      host === "douyin.com" ||
      host.endsWith(".douyin.com")
    ) {
      return "Douyin";
    }

    if (
      host === "bilibili.com" ||
      host.endsWith(".bilibili.com") ||
      host === "b23.tv"
    ) {
      return "Bilibili";
    }

    if (
      host === "tiktok.com" ||
      host.endsWith(".tiktok.com")
    ) {
      return "TikTok";
    }

    return "";
  }

  /* ========================================
     THÔNG BÁO
  ======================================== */

  function showStatus(message, type = "info") {
    if (!statusBox) return;

    statusBox.textContent = message;
    statusBox.className = "status";

    if (type === "error") {
      statusBox.style.background = "#fff0f0";
      statusBox.style.color = "#d92d3a";
    } else if (type === "success") {
      statusBox.style.background = "#eafaf0";
      statusBox.style.color = "#168344";
    } else {
      statusBox.style.background = "#eaf3ff";
      statusBox.style.color = "#075de0";
    }
  }

  function clearStatus() {
    if (!statusBox) return;

    statusBox.textContent = "";
    statusBox.className = "status";
    statusBox.removeAttribute("style");
  }

  /* ========================================
     CẬP NHẬT THẺ NỀN TẢNG
  ======================================== */

  function updatePlatformCards(name) {
    platforms.forEach((item) => {
      const isActive = item.dataset.platform === name;

      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
    });
  }

  function updatePlatformName(name) {
    selectedPlatform = name;

    if (platformName) {
      platformName.textContent = name
        ? `Nền tảng: ${name}`
        : "Nền tảng: Chưa xác định";
    }

    updatePlatformCards(name);
  }

  /* ========================================
     CẬP NHẬT Ô NHẬP
  ======================================== */

  function updateInput() {
    if (!videoUrl) return;

    const value = videoUrl.value;
    const trimmedValue = value.trim();

    if (charCount) {
      charCount.textContent = `${value.length}/${MAX_LENGTH}`;

      charCount.classList.toggle(
        "warning",
        value.length >= MAX_LENGTH * 0.9
      );
    }

    videoUrl.classList.remove("invalid");

    if (!trimmedValue) {
      updatePlatformName("");
      manualPlatform = false;

      if (downloadBtn) {
        downloadBtn.disabled = true;
      }

      clearStatus();
      return;
    }

    const detected = detectPlatform(trimmedValue);

    if (detected) {
      if (!manualPlatform || selectedPlatform === detected) {
        updatePlatformName(detected);
      }
    } else {
      updatePlatformName("");
    }

    if (downloadBtn) {
      downloadBtn.disabled = false;
    }

    clearStatus();
  }

  if (videoUrl) {
    videoUrl.addEventListener("input", () => {
      manualPlatform = false;
      updateInput();
    });

    videoUrl.addEventListener("paste", () => {
      manualPlatform = false;

      setTimeout(updateInput, 0);
    });
  }

  /* ========================================
     CHỌN NỀN TẢNG THỦ CÔNG
  ======================================== */

  platforms.forEach((item) => {
    function selectPlatform() {
      const name = item.dataset.platform;

      if (!name) return;

      manualPlatform = true;
      updatePlatformName(name);

      if (videoUrl && videoUrl.value.trim()) {
        const detected = detectPlatform(videoUrl.value);

        if (detected && detected !== name) {
          showStatus(
            `Liên kết này thuộc ${detected}, không phải ${name}.`,
            "error"
          );
        } else {
          clearStatus();
        }
      }
    }

    item.addEventListener("click", selectPlatform);

    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectPlatform();
      }
    });
  });

  /* ========================================
     NÚT XÓA
  ======================================== */

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (videoUrl) {
        videoUrl.value = "";
        videoUrl.classList.remove("invalid");
        videoUrl.focus();
      }

      manualPlatform = false;
      updateInput();
    });
  }

  /* ========================================
     NÚT DÁN
  ======================================== */

  if (pasteBtn) {
    pasteBtn.addEventListener("click", async () => {
      try {
        if (!navigator.clipboard || !navigator.clipboard.readText) {
          showStatus(
            "Trình duyệt chưa cho phép đọc bộ nhớ tạm. Hãy chạm vào ô nhập và chọn Dán.",
            "error"
          );
          return;
        }

        const text = await navigator.clipboard.readText();

        if (!text.trim()) {
          showStatus("Bộ nhớ tạm đang trống.", "error");
          return;
        }

        if (videoUrl) {
          videoUrl.value = text.slice(0, MAX_LENGTH);
          manualPlatform = false;
          updateInput();
          videoUrl.focus();

          if (text.length > MAX_LENGTH) {
            showStatus(
              "Liên kết quá dài. Nội dung đã được giới hạn ở 500 ký tự.",
              "error"
            );
          } else {
            showStatus("Đã dán liên kết thành công.", "success");
          }
        }
      } catch {
        showStatus(
          "Không thể truy cập bộ nhớ tạm. Hãy chạm giữ ô nhập rồi chọn Dán.",
          "error"
        );
      }
    });
  }

  /* ========================================
     NÚT TẢI VIDEO
  ======================================== */

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      if (!videoUrl) return;

      const value = videoUrl.value.trim();

      if (!value) {
        videoUrl.classList.add("invalid");
        showStatus("Mày hãy nhập liên kết video trước nhé.", "error");
        videoUrl.focus();
        return;
      }

      if (value.length > MAX_LENGTH) {
        showStatus(
          "Liên kết vượt quá giới hạn 500 ký tự.",
          "error"
        );
        return;
      }

      const detected = detectPlatform(value);

      if (!detected) {
        videoUrl.classList.add("invalid");
        showStatus(
          "Liên kết không hợp lệ hoặc chưa thuộc nền tảng được hỗ trợ.",
          "error"
        );
        videoUrl.focus();
        return;
      }

      showStatus(
        `Đã nhận diện ${detected}. Chức năng tải video thực tế chưa được kết nối máy chủ/API.`,
        "info"
      );
    });
  }

  /* ========================================
     ĐIỀU HƯỚNG CÁC TRANG
  ======================================== */

  function openSection(target) {
    const targetSection = document.getElementById(target);

    if (!targetSection || !targetSection.classList.contains("section")) {
      return;
    }

    sections.forEach((section) => {
      section.classList.toggle("active", section.id === target);
    });

    navButtons.forEach((button) => {
      const isActive = button.dataset.target === target;

      button.classList.toggle("active", isActive);

      if (isActive) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openSection(button.dataset.target);
    });
  });

  goButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openSection(button.dataset.go);
    });
  });

  if (headerSettings) {
    headerSettings.addEventListener("click", () => {
      openSection("settings");
    });
  }

  /* ========================================
     KHỞI TẠO
  ======================================== */

  updateInput();
  updatePlatformCards("");

  platforms.forEach((item) => {
    item.setAttribute("aria-pressed", "false");
  });

  console.log("Chinh Video Downloader đã khởi tạo.");
});
// --- CẤU HÌNH VÀ XỬ LÝ FIREBASE AUTH & TRIAL ---
const firebaseConfig = {
  apiKey: "AIzaSyAcn-F8s2qD0EpcRjwLgF2bsHvwK-ibAc",
  authDomain: "chinh-video.firebaseapp.com",
  projectId: "chinh-video",
  storageBucket: "chinh-video.appspot.com",
  messagingSenderId: "292692951758",
  appId: "1:292692951758:web:5e35d1ff4e61c8b634869f",
  measurementId: "G-T6EMG9SDLN"
};

// Khởi tạo Firebase nếu chưa có
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Theo dõi trạng thái tài khoản
auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById('authScreen').style.display = 'none';
    checkTrialStatus(user.uid);
  } else {
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('lockScreen').style.display = 'none';
    document.getElementById('mainAppContent').style.display = 'none';
  }
});

// Đăng ký tài khoản mới + cấp mã VN-xxxxxx
function handleSignup() {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;

  if (!email || !password) {
    document.getElementById('authMessage').innerText = "Vui lòng nhập đầy đủ Gmail và mật khẩu!";
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const uniqueId = 'VN-' + Math.floor(100000 + Math.random() * 900000);
      const currentTime = new Date().getTime();

      db.collection("users").doc(user.uid).set({
        email: email,
        uniqueId: uniqueId,
        createdAt: currentTime,
        status: "trial"
      }).then(() => {
        alert("Tạo tài khoản thành công! Mã định danh của bạn là: " + uniqueId);
      });
    })
    .catch((error) => {
      document.getElementById('authMessage').innerText = "Lỗi: " + error.message;
    });
}

// Đăng nhập
function handleLogin() {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;

  if (!email || !password) {
    document.getElementById('authMessage').innerText = "Vui lòng nhập email và mật khẩu!";
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .catch((error) => {
      document.getElementById('authMessage').innerText = "Sai tài khoản hoặc mật khẩu!";
    });
}

// Đăng xuất
function handleLogout() {
  auth.signOut();
}

// Kiểm tra thời hạn 14 ngày
function checkTrialStatus(uid) {
  db.collection("users").doc(uid).get().then((doc) => {
    if (doc.exists) {
      const data = doc.data();
      const uniqueId = data.uniqueId || "VN-151120";
      const createdAt = data.createdAt;
      const accountStatus = data.status; // 'trial' hoặc 'active'

      document.getElementById('userIdDisplay').innerText = uniqueId;

      if (accountStatus === 'active') {
        document.getElementById('lockScreen').style.display = 'none';
        document.getElementById('mainAppContent').style.display = 'block';
        return;
      }

      const now = new Date().getTime();
      const fourteenDays = 14 * 24 * 60 * 60 * 1000;

      if (now - createdAt > fourteenDays) {
        document.getElementById('lockScreen').style.display = 'flex';
        document.getElementById('mainAppContent').style.display = 'none';
      } else {
        document.getElementById('lockScreen').style.display = 'none';
        document.getElementById('mainAppContent').style.display = 'block';
      }
    }
  });
}

// Sao chép mã định danh
function copyUserId() {
  const userIdText = document.getElementById("userIdDisplay").innerText;
  navigator.clipboard.writeText(userIdText).then(() => {
    alert("Đã sao chép mã định danh: " + userIdText);
  });
}

