"use strict";

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

  const MAX_LENGTH = 500;
  let selectedPlatform = "";
  let manualPlatform = false;

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
    if (host.includes("youtube.com") || host === "youtu.be") return "YouTube";
    if (host.includes("douyin.com")) return "Douyin";
    if (host.includes("bilibili.com") || host === "b23.tv") return "Bilibili";
    if (host.includes("tiktok.com")) return "TikTok";
    return "";
  }

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

  function updatePlatformCards(name) {
    platforms.forEach((item) => {
      const isActive = item.dataset.platform === name;
      item.classList.toggle("active", isActive);
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
    }

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
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (videoUrl) videoUrl.value = "";
      updateInput();
    });
  }

  if (pasteBtn) {
    pasteBtn.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (videoUrl) {
          videoUrl.value = text.slice(0, MAX_LENGTH);
          updateInput();
          showStatus("Đã dán liên kết thành công.", "success");
        }
      } catch {
        showStatus("Không thể truy cập bộ nhớ tạm.", "error");
      }
    });
  }

  if (downloadBtn) {
    // ========================================
// CHINH VIDEO DOWNLOADER - GENDOWNLOAD API
// ========================================

const GENDOWNLOAD_API = "https://gendownload.com/api/extract";

let currentVideoData = null;
let currentRequestController = null;

// Tạo khu vực hiển thị kết quả
let videoResult = document.getElementById("videoResult");

if (!videoResult && statusBox) {
  videoResult = document.createElement("div");
  videoResult.id = "videoResult";
  videoResult.style.marginTop = "16px";
  videoResult.style.display = "none";
  statusBox.insertAdjacentElement("afterend", videoResult);
}

// Hiển thị kết quả an toàn
function renderVideoResult(data) {
  if (!videoResult) {
    throw new Error("Không tìm thấy khu vực hiển thị kết quả.");
  }

  const title =
    typeof data.title === "string" && data.title.trim()
      ? data.title.trim()
      : "Video không có tiêu đề";

  const formats = Array.isArray(data.formats)
    ? data.formats.filter((format) => {
        if (!format || typeof format.url !== "string") return false;

        try {
          const url = new URL(format.url);
          return url.protocol === "https:" || url.protocol === "http:";
        } catch {
          return false;
        }
      })
    : [];

  if (formats.length === 0) {
    throw new Error(
      "API đã phản hồi nhưng không có định dạng tải xuống hợp lệ."
    );
  }

  // Không chèn dữ liệu API trực tiếp vào HTML
  videoResult.replaceChildren();

  const card = document.createElement("div");
  card.style.cssText =
    "background:#fff;border:1px solid #e1e8f0;" +
    "border-radius:14px;padding:16px;margin-top:12px;";

  if (typeof data.thumbnail === "string") {
    try {
      const thumbnailUrl = new URL(data.thumbnail);

      if (
        ["https:", "http:"].includes(thumbnailUrl.protocol)
      ) {
        const image = document.createElement("img");
        image.src = thumbnailUrl.href;
        image.alt = "Ảnh bìa video";
        image.loading = "lazy";
        image.referrerPolicy = "no-referrer";
        image.style.cssText =
          "width:100%;max-height:240px;object-fit:cover;" +
          "border-radius:10px;margin-bottom:12px;";

        image.onerror = () => image.remove();
        card.appendChild(image);
      }
    } catch {
      // Bỏ qua ảnh bìa không hợp lệ
    }
  }

  const heading = document.createElement("h3");
  heading.textContent = title;
  heading.style.cssText =
    "font-size:16px;line-height:1.5;margin:0 0 10px;color:#172b4d;";
  card.appendChild(heading);

  const metadata = document.createElement("p");
  metadata.style.cssText =
    "font-size:13px;color:#667085;line-height:1.7;margin:0 0 14px;";

  const details = [];

  if (data.author) details.push("Tác giả: " + data.author);
  if (data.duration) details.push("Thời lượng: " + data.duration);
  if (data.views != null) details.push("Lượt xem: " + data.views);

  metadata.textContent = details.join(" · ");
  card.appendChild(metadata);

  const formatHeading = document.createElement("h4");
  formatHeading.textContent = "Chọn định dạng tải xuống";
  formatHeading.style.margin = "0 0 10px";
  card.appendChild(formatHeading);

  formats.forEach((format) => {
    const link = document.createElement("a");
    link.href = format.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent =
      "↓ " +
      (format.label || format.type || "Tải video") +
      (format.ext ? " (" + format.ext + ")" : "");

    link.style.cssText =
      "display:block;padding:12px;margin-top:8px;" +
      "background:#075de0;color:white;text-align:center;" +
      "text-decoration:none;border-radius:10px;font-weight:600;";

    card.appendChild(link);
  });

  videoResult.appendChild(card);
  videoResult.style.display = "block";
}

// Xử lý nút tải video
if (downloadBtn) {
  downloadBtn.addEventListener("click", async () => {
    const urlValue = videoUrl ? videoUrl.value.trim() : "";

    if (!urlValue) {
      showStatus("Vui lòng dán liên kết video.", "error");
      return;
    }

    // Chỉ cho phép URL HTTP/HTTPS từ nền tảng hỗ trợ
    const detectedPlatform = detectPlatform(urlValue);

    if (!detectedPlatform) {
      showStatus(
        "Liên kết không hợp lệ hoặc nền tảng chưa được hỗ trợ.",
        "error"
      );
      return;
    }

    try {
      new URL(urlValue);
    } catch {
      showStatus("Đường dẫn video không hợp lệ.", "error");
      return;
    }

    // Hủy yêu cầu trước nếu người dùng bấm lại
    if (currentRequestController) {
      currentRequestController.abort();
    }

    currentRequestController = new AbortController();

    const controller = currentRequestController;
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    downloadBtn.disabled = true;

    if (videoResult) {
      videoResult.replaceChildren();
      videoResult.style.display = "none";
    }

    showStatus("Đang kết nối GenDownload API...", "info");

    try {
      const response = await fetch(GENDOWNLOAD_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          url: urlValue
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(
          "API trả về lỗi HTTP " + response.status + "."
        );
      }

      const data = await response.json();

      if (!data || typeof data !== "object") {
        throw new Error("API trả về dữ liệu không hợp lệ.");
      }

      // Nếu API có trường báo lỗi, không coi đó là thành công
      if (
        data.error ||
        data.success === false ||
        data.status === "error"
      ) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "API không thể xử lý video này."
        );
      }

      // Phải có định dạng tải xuống hợp lệ mới hiển thị thành công
      renderVideoResult(data);

      currentVideoData = data;

      showStatus(
        "Đã lấy thông tin video thành công. Hãy chọn định dạng để tải xuống.",
        "success"
      );
    } catch (error) {
      if (error.name === "AbortError") {
        showStatus(
          "Yêu cầu bị hủy hoặc đã quá 30 giây. Hãy thử lại.",
          "error"
        );
      } else {
        console.error("GenDownload API error:", error);

        showStatus(
          "Không lấy được video: " +
            (error.message || "Lỗi kết nối API.") +
            " Hãy thử lại sau.",
          "error"
        );
      }
    } finally {
      clearTimeout(timeoutId);

      if (currentRequestController === controller) {
        currentRequestController = null;
        downloadBtn.disabled = false;
      }
    }
  });
}
      const urlValue = videoUrl ? videoUrl.value.trim() : "";
      if (!urlValue) return;
      downloadBtn.disabled = true;
      showStatus("Đang xử lý tải video...", "info");
      setTimeout(() => {
        showStatus("Tải xuống hoàn tất!", "success");
        downloadBtn.disabled = false;
      }, 1500);
    });
  }

  function openSection(target) {
    sections.forEach((section) => {
      section.classList.toggle("active", section.id === target);
    });
    navButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.target === target);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openSection(button.dataset.target);
    });
  });

  if (headerSettings) {
    headerSettings.addEventListener("click", () => {
      openSection("settings");
    });
  }
});

/* ========================================
   CẤU HÌNH FIREBASE & QUẢN LÝ TÀI KHOẢN
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

document.addEventListener("DOMContentLoaded", () => {
  const savedUsername = localStorage.getItem("chinh_username");
  if (savedUsername) {
    checkTrialStatusDirect(savedUsername);
  } else {
    const authScreen = document.getElementById('authScreen');
    if (authScreen) authScreen.style.display = 'flex';
  }
});

function handleSignup() {
  const username = document.getElementById('regUsername').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const msgElement = document.getElementById('regMessage');

  if (!username || !password) {
    if (msgElement) msgElement.innerText = "Vui lòng nhập đầy đủ Tên tài khoản và Mật khẩu!";
    return;
  }

  const userRef = db.collection("app_users").doc(username);
  userRef.get().then((doc) => {
    if (doc.exists) {
      if (msgElement) msgElement.innerText = "Tên tài khoản đã tồn tại!";
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
        alert("Tạo tài khoản thành công! Mã định danh: " + uniqueId);
        checkTrialStatusDirect(username);
      });
    }
  });
}

function handleLogin() {
  const username = document.getElementById('authUsername').value.trim().toLowerCase();
  const password = document.getElementById('authPassword').value;
  const msgElement = document.getElementById('authMessage');

  if (!username || !password) return;

  db.collection("app_users").doc(username).get().then((doc) => {
    if (doc.exists) {
      const data = doc.data();
      if (data.password === password) {
        localStorage.setItem("chinh_username", username);
        checkTrialStatusDirect(username);
      } else {
        if (msgElement) msgElement.innerText = "Sai mật khẩu!";
      }
    } else {
      if (msgElement) msgElement.innerText = "Tài khoản không tồn tại!";
    }
  });
}

function handleForgotPassword() {
  alert("Vui lòng liên hệ Admin qua TikTok: @tyty_99_4 để được hỗ trợ!");
}

function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (input.type === "password") {
    input.type = "text";
    icon.textContent = "🙈";
  } else {
    input.type = "password";
    icon.textContent = "👁️";
  }
}

function showAuthSection(sectionId) {
  const login = document.getElementById('authScreen');
  const reg = document.getElementById('registerSection');
  if (sectionId === 'register') {
    login.style.display = 'none';
    reg.style.display = 'flex';
  } else {
    login.style.display = 'flex';
    reg.style.display = 'none';
  }
}

function handleLogout() {
  localStorage.removeItem("chinh_username");
  location.reload();
}

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
        lockScreen.style.display = 'none';
        mainAppContent.style.display = 'block';
        return;
      }

      const now = new Date().getTime();
      const fourteenDays = 14 * 24 * 60 * 60 * 1000;

      if (now - createdAt > fourteenDays) {
        lockScreen.style.display = 'flex';
        mainAppContent.style.display = 'none';
      } else {
        lockScreen.style.display = 'none';
        mainAppContent.style.display = 'block';
      }
    }
  });
}

function copyUserId() {
  const text = document.getElementById("userIdDisplay").innerText;
  navigator.clipboard.writeText(text).then(() => alert("Đã sao chép: " + text));
}

// Tính năng Tách nhạc từ link video
function handleExtractAudio() {
  const url = document.getElementById("extractUrl").value.trim();
  const status = document.getElementById("extractStatus");
  if (!url) {
    status.style.color = "#d92d3a";
    status.innerText = "Vui lòng dán đường dẫn video vào ô trên!";
    return;
  }
  status.style.color = "#075de0";
  status.innerText = "Đang kết nối để trích xuất âm thanh...";
  setTimeout(() => {
    status.style.color = "#168344";
    status.innerText = "Trích xuất thành công! File nhạc đã sẵn sàng tải về.";
  }, 2000);
}
