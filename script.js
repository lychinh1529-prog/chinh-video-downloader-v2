"use strict";

/* ========================================
   CHINH VIDEO DOWNLOADER
   Frontend JavaScript & Firebase Auth Integration
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
    if (!value.trim()) return "";
    let url;
    try {
      url = new URL(value.trim());
    } catch {
      return "";
    }
    if (!["http:", "https:"].includes(url.protocol)) return "";
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtu.be") return "YouTube";
    if (host === "douyin.com" || host.endsWith(".douyin.com")) return "Douyin";
    if (host === "bilibili.com" || host.endsWith(".bilibili.com") || host === "b23.tv") return "Bilibili";
    if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "TikTok";
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
     CẬP NHẬT THẺ NỀN TẢNG & Ô NHẬP
  ======================================== */

  function updatePlatformCards(name) {
    platforms.forEach((item) => {
      const isActive = item.dataset.platform === name;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
  }

  function updatePlatformName(name) {
    selectedPlatform = name;
    if (platformName) {
      platformName.textContent = name ? `Nền tảng: ${name}` : "Nền tảng: Chưa xác định";
    }
    updatePlatformCards(name);
  }

  function updateInput() {
    if (!videoUrl) return;
    const value = videoUrl.value;
    const trimmedValue = value.trim();

    if (charCount) {
      charCount.textContent = `${value.length}/${MAX_LENGTH}`;
      charCount.classList.toggle("warning", value.length >= MAX_LENGTH * 0.9);
    }
    videoUrl.classList.remove("invalid");

    if (!trimmedValue) {
      updatePlatformName("");
      manualPlatform = false;
      if (downloadBtn) downloadBtn.disabled = true;
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
    if (downloadBtn) downloadBtn.disabled = false;
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
     CHỌN NỀN TẢNG THỦ CÔNG & NÚT DÁN/XÓA
  ======================================== */

  platforms.forEach((item) => {
    item.addEventListener("click", () => {
      const name = item.dataset.platform;
      if (!name) return;
      manualPlatform = true;
      updatePlatformName(name);
    });
  });

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

  if (pasteBtn) {
    pasteBtn.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (videoUrl) {
          videoUrl.value = text.slice(0, MAX_LENGTH);
          manualPlatform = false;
          updateInput();
          videoUrl.focus();
          showStatus("Đã dán liên kết thành công.", "success");
        }
      } catch {
        showStatus("Không thể truy cập bộ nhớ tạm.", "error");
      }
    });
  }

  /* ========================================
     ĐIỀU HƯỚNG CÁC TRANG (SECTIONS)
  ======================================== */

  function openSection(target) {
    const targetSection = document.getElementById(target);
    if (!targetSection) return;

    sections.forEach((section) => {
      section.classList.toggle("active", section.id === target);
    });

    navButtons.forEach((button) => {
      const isActive = button.dataset.target === target;
      button.classList.toggle("active", isActive);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
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

  updateInput();
  updatePlatformCards("");
});


/* ========================================
   CẤU HÌNH VÀ XỬ LÝ FIREBASE AUTH & TRIAL
======================================== */
const firebaseConfig = {
  apiKey: "AIzaSy4cm_F8s2qD0EpcRjwgLFg2bsHvwK-ibAc",
  authDomain: "chinh-video.firebaseapp.com",
  projectId: "chinh-video",
  storageBucket: "chinh-video.firebasestorage.app",
  messagingSenderId: "292692951758",
  appId: "1:292692951758:web:5e35d1ff4e61c8b634069f",
  measurementId: "G-T6EMG9SDLN"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Theo dõi trạng thái tài khoản đăng nhập
auth.onAuthStateChanged((user) => {
  const authScreen = document.getElementById('authScreen');
  const registerSection = document.getElementById('registerSection');
  const lockScreen = document.getElementById('lockScreen');
  const mainAppContent = document.getElementById('mainAppContent');

  if (user) {
    // Kiểm tra xem đã xác minh email chưa trước khi cho vào trang chủ
    user.reload().then(() => {
      if (user.emailVerified) {
        if (authScreen) authScreen.style.display = 'none';
        if (registerSection) registerSection.style.display = 'none';
        checkTrialStatus(user.uid);
      } else {
        // Chưa xác minh thì hiển thị màn hình chờ xác minh
        if (authScreen) authScreen.style.display = 'none';
        if (registerSection) {
          registerSection.style.display = 'flex';
          document.getElementById('registerFormDiv').style.display = 'none';
          document.getElementById('verifyEmailDiv').style.display = 'block';
        }
        if (lockScreen) lockScreen.style.display = 'none';
        if (mainAppContent) mainAppContent.style.display = 'none';
      }
    });
  } else {
    if (authScreen) authScreen.style.display = 'flex';
    if (registerSection) registerSection.style.display = 'none';
    if (lockScreen) lockScreen.style.display = 'none';
    if (mainAppContent) mainAppContent.style.display = 'none';
  }
});

// 1. Đăng ký tài khoản mới + Gửi email xác minh
function handleSignup() {
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const msgElement = document.getElementById('regMessage');

  if (!email || !password) {
    if (msgElement) msgElement.innerText = "Vui lòng nhập đầy đủ Gmail và mật khẩu!";
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      
      user.sendEmailVerification().then(() => {
        const uniqueId = 'VN-' + Math.floor(100000 + Math.random() * 900000);
        const currentTime = new Date().getTime();

        db.collection("users").doc(user.uid).set({
          email: email,
          uniqueId: uniqueId,
          createdAt: currentTime,
          status: "trial"
        }).then(() => {
          // Chuyển sang giao diện thông báo chờ xác minh
          document.getElementById('registerFormDiv').style.display = 'none';
          document.getElementById('verifyEmailDiv').style.display = 'block';
          if (msgElement) msgElement.innerText = "";
        });
      });
    })
    .catch((error) => {
      if (msgElement) {
        msgElement.style.color = "#d92d3a";
        msgElement.innerText = "Lỗi: " + error.message;
      }
    });
}

// Kiểm tra khi người dùng bấm nút "Tôi đã xác minh"
function checkEmailVerificationStatus() {
  const user = auth.currentUser;
  const msgElement = document.getElementById('regMessage');

  if (user) {
    user.reload().then(() => {
      if (user.emailVerified) {
        alert("Xác minh thành công! Chào mừng bạn đến với trang chủ.");
        checkTrialStatus(user.uid);
      } else {
        if (msgElement) {
          msgElement.style.color = "#d92d3a";
          msgElement.innerText = "Bạn chưa bấm vào đường dẫn xác minh trong email! Vui lòng kiểm tra lại hộp thư.";
        }
      }
    });
  }
}

// 2. Đăng nhập tài khoản
function handleLogin() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const msgElement = document.getElementById('authMessage');

  if (!email || !password) {
    if (msgElement) msgElement.innerText = "Vui lòng nhập email và mật khẩu!";
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      user.reload().then(() => {
        if (!user.emailVerified) {
          auth.signOut();
          if (msgElement) {
            msgElement.style.color = "#d92d3a";
            msgElement.innerText = "Tài khoản chưa xác minh email! Vui lòng kiểm tra hộp thư.";
          }
        }
      });
    })
    .catch((error) => {
      if (msgElement) {
        msgElement.style.color = "#d92d3a";
        msgElement.innerText = "Sai tài khoản hoặc mật khẩu!";
      }
    });
}

// 3. Quên mật khẩu
function handleForgotPassword() {
  const email = document.getElementById('authEmail').value.trim();
  const msgElement = document.getElementById('authMessage');

  if (!email) {
    if (msgElement) {
      msgElement.style.color = "#d92d3a";
      msgElement.innerText = "Vui lòng nhập Gmail vào ô bên trên để lấy lại mật khẩu!";
    }
    return;
  }

  auth.sendPasswordResetEmail(email)
    .then(() => {
      if (msgElement) {
        msgElement.style.color = "#168344";
        msgElement.innerText = "Đã gửi liên kết khôi phục mật khẩu tới email: " + email;
      }
    })
    .catch((error) => {
      if (msgElement) {
        msgElement.style.color = "#d92d3a";
        msgElement.innerText = "Lỗi: " + error.message;
      }
    });
}

// 4. Chức năng ẩn/hiện mật khẩu (Icon con mắt)
function togglePasswordVisibility(inputId, iconId) {
  const passwordInput = document.getElementById(inputId);
  const toggleIcon = document.getElementById(iconId);
  if (!passwordInput) return;

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    if (toggleIcon) toggleIcon.textContent = "🙈"; 
  } else {
    passwordInput.type = "password";
    if (toggleIcon) toggleIcon.textContent = "👁️"; 
  }
}

// Chuyển đổi qua lại giữa màn hình Đăng nhập và Đăng ký
function showAuthSection(sectionId) {
  const loginSection = document.getElementById('authScreen');
  const registerSection = document.getElementById('registerSection');
  
  if (sectionId === 'register') {
    if (loginSection) loginSection.style.display = 'none';
    if (registerSection) {
      registerSection.style.display = 'flex';
      document.getElementById('registerFormDiv').style.display = 'block';
      document.getElementById('verifyEmailDiv').style.display = 'none';
    }
  } else {
    if (loginSection) loginSection.style.display = 'flex';
    if (registerSection) registerSection.style.display = 'none';
  }
}

// Đăng xuất tài khoản
function handleLogout() {
  auth.signOut();
}

// Kiểm tra thời hạn dùng thử 14 ngày
function checkTrialStatus(uid) {
  db.collection("users").doc(uid).get().then((doc) => {
    const authScreen = document.getElementById('authScreen');
    const registerSection = document.getElementById('registerSection');
    const lockScreen = document.getElementById('lockScreen');
    const mainAppContent = document.getElementById('mainAppContent');
    const userIdDisplay = document.getElementById('userIdDisplay');

    if (authScreen) authScreen.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';

    if (doc.exists) {
      const data = doc.data();
      const uniqueId = data.uniqueId || "VN-151120";
      const createdAt = data.createdAt;
      const accountStatus = data.status;

      if (userIdDisplay) userIdDisplay.innerText = uniqueId;

      if (accountStatus === 'active') {
        if (lockScreen) lockScreen.style.display = 'none';
        if (mainAppContent) mainAppContent.style.display = 'block';
        return;
      }

      const now = new Date().getTime();
      const fourteenDays = 14 * 24 * 60 * 60 * 1000;

      if (now - createdAt > fourteenDays) {
        if (lockScreen) lockScreen.style.display = 'flex';
        if (mainAppContent) mainAppContent.style.display = 'none';
      } else {
        if (lockScreen) lockScreen.style.display = 'none';
        if (mainAppContent) mainAppContent.style.display = 'block';
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
