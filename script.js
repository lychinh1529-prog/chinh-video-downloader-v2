"use strict";

/* ========================================
   CHINH VIDEO DOWNLOADER
   Frontend JavaScript & Direct Database Integration
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
     XỬ LÝ SỰ KIỆN TẢI XUỐNG (THÊM MỚI)
  ======================================== */
  if (downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
      const urlValue = videoUrl ? videoUrl.value.trim() : "";
      if (!urlValue) {
        showStatus("Vui lòng nhập hoặc dán liên kết video hợp lệ!", "error");
        return;
      }

      const platform = selectedPlatform || detectPlatform(urlValue);
      if (!platform) {
        showStatus("Không nhận diện được nền tảng video. Vui lòng kiểm tra lại đường dẫn!", "error");
        return;
      }

      // Hiển thị trạng thái đang xử lý
      downloadBtn.disabled = true;
      showStatus(`Đang kết nối máy chủ để trích xuất video từ ${platform}...`, "info");

      try {
        // Giả lập quá trình gọi API xử lý tải xuống (Bạn có thể thay thế bằng API fetch backend thực tế của bạn ở đây)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        showStatus(`Trích xuất video từ ${platform} thành công! Đang chuẩn bị tải xuống...`, "success");
        
        // Tạo liên kết tải xuống mẫu hoặc kích hoạt hành động tải
        setTimeout(() => {
          showStatus("Tải xuống hoàn tất!", "success");
          downloadBtn.disabled = false;
        }, 1500);

      } catch (error) {
        console.error("Lỗi tải xuống:", error);
        showStatus("Có lỗi xảy ra trong quá trình tải xuống. Vui lòng thử lại sau!", "error");
        downloadBtn.disabled = false;
      }
    });
  }

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
   CẤU HÌNH BẢO MẬT VÀ XỬ LÝ DATABASE TÀI KHOẢN
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
const db = firebase.firestore();

// Kiểm tra xem trình duyệt đã lưu đăng nhập chưa
document.addEventListener("DOMContentLoaded", () => {
  const savedUsername = localStorage.getItem("chinh_username");

  if (savedUsername) {
    checkTrialStatusDirect(savedUsername);
  } else {
    const authScreen = document.getElementById('authScreen');
    if (authScreen) authScreen.style.display = 'flex';
  }
});

// 1. Tạo tài khoản mới (ID không trùng + Tự cấp mã VN-xxxxxx)
function handleSignup() {
  const username = document.getElementById('regUsername').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const msgElement = document.getElementById('regMessage');

  if (!username || !password) {
    if (msgElement) {
      msgElement.style.color = "#d92d3a";
      msgElement.innerText = "Vui lòng nhập đầy đủ Tên tài khoản và Mật khẩu!";
    }
    return;
  }

  const userRef = db.collection("app_users").doc(username);

  userRef.get().then((doc) => {
    if (doc.exists) {
      if (msgElement) {
        msgElement.style.color = "#d92d3a";
        msgElement.innerText = "Tên tài khoản này đã tồn tại! Vui lòng chọn tên khác.";
      }
    } else {
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      const uniqueId = 'VN-' + randomCode;
      const currentTime = new Date().getTime();

      userRef.set({
        username: username,
        password: password,
        uniqueId: uniqueId,
        createdAt: currentTime,
        status: "trial"
      }).then(() => {
        localStorage.setItem("chinh_username", username);
        alert("Tạo tài khoản thành công! Mã định danh của bạn: " + uniqueId);
        checkTrialStatusDirect(username);
      }).catch((error) => {
        if (msgElement) {
          msgElement.style.color = "#d92d3a";
          msgElement.innerText = "Lỗi khi tạo tài khoản: " + error.message;
        }
      });
    }
  });
}

// 2. Đăng nhập tài khoản
function handleLogin() {
  const username = document.getElementById('authUsername').value.trim().toLowerCase();
  const password = document.getElementById('authPassword').value;
  const msgElement = document.getElementById('authMessage');

  if (!username || !password) {
    if (msgElement) msgElement.innerText = "Vui lòng nhập Tên tài khoản và Mật khẩu!";
    return;
  }

  db.collection("app_users").doc(username).get().then((doc) => {
    if (doc.exists) {
      const userData = doc.data();
      if (userData.password === password) {
        localStorage.setItem("chinh_username", username);
        checkTrialStatusDirect(username);
      } else {
        if (msgElement) {
          msgElement.style.color = "#d92d3a";
          msgElement.innerText = "Sai mật khẩu!";
        }
      }
    } else {
      if (msgElement) {
        msgElement.style.color = "#d92d3a";
        msgElement.innerText = "Tên tài khoản không tồn tại!";
      }
    }
  }).catch((error) => {
    if (msgElement) msgElement.innerText = "Lỗi kết nối: " + error.message;
  });
}

// 3. Quên mật khẩu
function handleForgotPassword() {
  const username = document.getElementById('authUsername').value.trim();
  if (!username) {
    alert("Vui lòng nhập Tên tài khoản vào ô bên trên trước!");
    return;
  }
  alert("Vui lòng liên hệ Admin qua TikTok: @tyty_99_4 và đọc Tên tài khoản (" + username + ") để được hỗ trợ cấp lại mật khẩu!");
}

// 4. Con mắt ẩn/hiện mật khẩu
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

// Chuyển đổi giao diện Đăng nhập / Đăng ký
function showAuthSection(sectionId) {
  const loginSection = document.getElementById('authScreen');
  const registerSection = document.getElementById('registerSection');
  
  if (sectionId === 'register') {
    if (loginSection) loginSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'flex';
  } else {
    if (loginSection) loginSection.style.display = 'flex';
    if (registerSection) registerSection.style.display = 'none';
  }
}

// Đăng xuất
function handleLogout() {
  localStorage.removeItem("chinh_username");
  location.reload();
}

// 5. Kiểm tra dùng thử 14 ngày & Cập nhật Mã định danh
function checkTrialStatusDirect(username) {
  db.collection("app_users").doc(username).get().then((doc) => {
    const authScreen = document.getElementById('authScreen');
    const registerSection = document.getElementById('registerSection');
    const lockScreen = document.getElementById('lockScreen');
    const mainAppContent = document.getElementById('mainAppContent');
    const userIdDisplay = document.getElementById('userIdDisplay');
    
    const settingUsername = document.getElementById('settingUsername');
    const settingUniqueId = document.getElementById('settingUniqueId');

    if (authScreen) authScreen.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';

    if (doc.exists) {
      const data = doc.data();
      const uniqueId = data.uniqueId || "VN-151120";
      const createdAt = data.createdAt;
      const accountStatus = data.status;

      if (userIdDisplay) userIdDisplay.innerText = uniqueId;
      if (settingUsername) settingUsername.innerText = username;
      if (settingUniqueId) settingUniqueId.innerText = uniqueId;

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
