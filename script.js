document.addEventListener("DOMContentLoaded", function () {
  /* BACKGROUND MUSIC */
  const music = document.getElementById("music");
  const musicButton = document.getElementById("musicButton");
  let musicPlaying = false;

  function updateMusicButton() {
    if (!musicButton) return;
    musicButton.textContent = musicPlaying ? "❚❚ Pause Music" : "♪ Play Music";
    musicButton.setAttribute(
      "aria-label",
      musicPlaying ? "Pause background music" : "Play background music"
    );
  }

  async function startMusic() {
    if (!music) return false;

    try {
      await music.play();
      musicPlaying = true;
      updateMusicButton();
      return true;
    } catch (error) {
      musicPlaying = false;
      updateMusicButton();
      return false;
    }
  }

  if (music) {
    music.volume = 0.7;

    /* Best-effort autoplay. Browsers may block sound until the first interaction. */
    startMusic();

    const startOnFirstInteraction = async function () {
      if (!musicPlaying) {
        await startMusic();
      }

      document.removeEventListener("pointerdown", startOnFirstInteraction);
      document.removeEventListener("keydown", startOnFirstInteraction);
      document.removeEventListener("touchstart", startOnFirstInteraction);
    };

    document.addEventListener("pointerdown", startOnFirstInteraction, { once: true });
    document.addEventListener("keydown", startOnFirstInteraction, { once: true });
    document.addEventListener("touchstart", startOnFirstInteraction, { once: true, passive: true });
  }

  if (music && musicButton) {
    musicButton.addEventListener("click", async function () {
      if (musicPlaying) {
        music.pause();
        musicPlaying = false;
        updateMusicButton();
      } else {
        await startMusic();
      }
    });
  }


  /* WEDDING COUNTDOWN */
  const weddingDate = new Date("2026-12-08T16:00:00+08:00").getTime();
  const countdownDays = document.getElementById("countdownDays");
  const countdownHours = document.getElementById("countdownHours");
  const countdownMinutes = document.getElementById("countdownMinutes");
  const countdownSeconds = document.getElementById("countdownSeconds");
  const countdownComplete = document.getElementById("countdownComplete");
  let countdownTimer = null;

  function updateWeddingCountdown() {
    if (!countdownDays || !countdownHours || !countdownMinutes || !countdownSeconds) {
      return;
    }

    const remainingTime = weddingDate - Date.now();

    if (remainingTime <= 0) {
      countdownDays.textContent = "000";
      countdownHours.textContent = "00";
      countdownMinutes.textContent = "00";
      countdownSeconds.textContent = "00";

      if (countdownComplete) {
        countdownComplete.hidden = false;
      }

      if (countdownTimer !== null) {
        clearInterval(countdownTimer);
      }
      return;
    }

    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
    const seconds = Math.floor((remainingTime / 1000) % 60);

    countdownDays.textContent = String(days).padStart(3, "0");
    countdownHours.textContent = String(hours).padStart(2, "0");
    countdownMinutes.textContent = String(minutes).padStart(2, "0");
    countdownSeconds.textContent = String(seconds).padStart(2, "0");
  }

  updateWeddingCountdown();
  countdownTimer = window.setInterval(updateWeddingCountdown, 1000);

  /* PRENUP ALBUM CAROUSEL */
  const albumTrack = document.getElementById("albumTrack");
  const albumCards = Array.from(document.querySelectorAll(".album-card"));
  const albumCounter = document.getElementById("albumCounter");
  const previousAlbumButton = document.querySelector(".album-prev");
  const nextAlbumButton = document.querySelector(".album-next");

  if (albumTrack && albumCards.length && albumCounter && previousAlbumButton && nextAlbumButton) {
    let currentAlbumIndex = 0;
    let albumScrollTimer;
    let isDragging = false;
    let dragStartX = 0;
    let startingScrollLeft = 0;
    let activePointerId = null;

    function updateAlbumDisplay() {
      albumCards.forEach(function (card, index) {
        card.classList.toggle("active", index === currentAlbumIndex);
      });

      albumCounter.textContent = `${currentAlbumIndex + 1} / ${albumCards.length}`;
      previousAlbumButton.disabled = currentAlbumIndex === 0;
      nextAlbumButton.disabled = currentAlbumIndex === albumCards.length - 1;
    }

    function moveToAlbumPhoto(index, smooth = true) {
      currentAlbumIndex = Math.max(0, Math.min(index, albumCards.length - 1));
      const selectedCard = albumCards[currentAlbumIndex];
      const leftPosition = selectedCard.offsetLeft - (albumTrack.clientWidth - selectedCard.offsetWidth) / 2;

      albumTrack.scrollTo({
        left: leftPosition,
        behavior: smooth ? "smooth" : "auto"
      });

      updateAlbumDisplay();
    }

    function findNearestAlbumPhoto() {
      const trackCenter = albumTrack.scrollLeft + albumTrack.clientWidth / 2;
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      albumCards.forEach(function (card, index) {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(trackCenter - cardCenter);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      return nearestIndex;
    }

    previousAlbumButton.addEventListener("click", function () {
      moveToAlbumPhoto(currentAlbumIndex - 1);
    });

    nextAlbumButton.addEventListener("click", function () {
      moveToAlbumPhoto(currentAlbumIndex + 1);
    });

    albumTrack.addEventListener("scroll", function () {
      clearTimeout(albumScrollTimer);
      albumScrollTimer = setTimeout(function () {
        currentAlbumIndex = findNearestAlbumPhoto();
        updateAlbumDisplay();
      }, 100);
    });

    albumTrack.addEventListener("pointerdown", function (event) {
      if (event.pointerType !== "mouse") return;

      isDragging = true;
      activePointerId = event.pointerId;
      dragStartX = event.clientX;
      startingScrollLeft = albumTrack.scrollLeft;
      albumTrack.classList.add("dragging");
      albumTrack.setPointerCapture(event.pointerId);
    });

    albumTrack.addEventListener("pointermove", function (event) {
      if (!isDragging || event.pointerId !== activePointerId) return;

      event.preventDefault();
      albumTrack.scrollLeft = startingScrollLeft - (event.clientX - dragStartX);
    });

    function stopAlbumDragging() {
      if (!isDragging) return;

      isDragging = false;
      albumTrack.classList.remove("dragging");

      if (activePointerId !== null && albumTrack.hasPointerCapture(activePointerId)) {
        albumTrack.releasePointerCapture(activePointerId);
      }

      activePointerId = null;
      moveToAlbumPhoto(findNearestAlbumPhoto(), true);
    }

    albumTrack.addEventListener("pointerup", stopAlbumDragging);
    albumTrack.addEventListener("pointercancel", stopAlbumDragging);
    albumTrack.addEventListener("dragstart", function (event) {
      event.preventDefault();
    });

    albumTrack.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveToAlbumPhoto(currentAlbumIndex - 1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveToAlbumPhoto(currentAlbumIndex + 1);
      }
    });

    window.addEventListener("resize", function () {
      moveToAlbumPhoto(currentAlbumIndex, false);
    });

    window.addEventListener("load", function () {
      moveToAlbumPhoto(0, false);
    });

    updateAlbumDisplay();
  }


  /* FALLING FLOWER PETALS */
  const petalContainer = document.getElementById("petalContainer");

  if (
    petalContainer &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    const petalColors = [
      "rgba(243,228,184,.72)",
      "rgba(239,176,156,.70)",
      "rgba(239,161,111,.64)",
      "rgba(255,239,219,.78)",
      "rgba(228,160,142,.66)"
    ];
    const petalCount = 24;

    for (let index = 0; index < petalCount; index += 1) {
      const petal = document.createElement("span");
      const size = Math.random() * 9 + 8;
      const fallDuration = Math.random() * 9 + 11;
      const fallDelay = Math.random() * -20;
      const swayAmount = Math.random() * 45 + 20;
      const direction = Math.random() > 0.5 ? 1 : -1;

      petal.className = "falling-petal";
      petal.style.setProperty("--petal-left", `${Math.random() * 100}%`);
      petal.style.setProperty("--petal-width", `${size}px`);
      petal.style.setProperty("--petal-height", `${size * 1.45}px`);
      petal.style.setProperty(
        "--petal-color",
        petalColors[index % petalColors.length]
      );
      petal.style.setProperty(
        "--petal-opacity",
        (Math.random() * 0.28 + 0.42).toFixed(2)
      );
      petal.style.setProperty("--fall-duration", `${fallDuration}s`);
      petal.style.setProperty("--fall-delay", `${fallDelay}s`);
      petal.style.setProperty("--sway-one", `${direction * swayAmount}px`);
      petal.style.setProperty("--sway-two", `${direction * swayAmount * -0.55}px`);
      petal.style.setProperty("--sway-three", `${direction * swayAmount * 0.7}px`);
      petal.style.setProperty("--sway-four", `${direction * swayAmount * -0.25}px`);

      petalContainer.appendChild(petal);
    }
  }

  /* RSVP FORM
     ---------------------------------------------------------
     IMPORTANT: Replace the placeholder below with the /exec URL
     from your deployed Google Apps Script Web App.
     --------------------------------------------------------- */
  const RSVP_WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbxRIk0DrJFq5qsiW6W1FZ3l5twA-yBlFEcEwRqySse4JlSCvqFLo7fXmMBmpQ2k9Jr-7g/exec";

  const rsvpForm = document.getElementById("rsvpForm");
  const rsvpStatus = document.getElementById("rsvpStatus");
  const rsvpSubmissionFrame = document.getElementById("rsvpSubmissionFrame");

  let rsvpWaitingForResponse = false;
  let rsvpSubmitTimeout = null;
  let submittedRsvpData = null;

  function showRsvpStatus(type, message) {
    if (!rsvpStatus) return;

    rsvpStatus.hidden = false;
    rsvpStatus.className = `rsvp-status ${type}`;
    rsvpStatus.textContent = message;
  }

  function resetRsvpSubmitButton() {
    if (!rsvpForm) return;

    const submitButton = rsvpForm.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit RSVP";
    }
  }

  function finishRsvpRequest() {
    rsvpWaitingForResponse = false;

    if (rsvpSubmitTimeout !== null) {
      window.clearTimeout(rsvpSubmitTimeout);
      rsvpSubmitTimeout = null;
    }

    resetRsvpSubmitButton();
  }

  if (rsvpForm && rsvpSubmissionFrame) {
    rsvpForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (rsvpWaitingForResponse) return;

      if (!rsvpForm.checkValidity()) {
        rsvpForm.reportValidity();
        return;
      }

      if (
        !RSVP_WEB_APP_URL ||
        RSVP_WEB_APP_URL.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT")
      ) {
        showRsvpStatus(
          "error",
          "RSVP is not connected yet. Please add the Google Apps Script Web App URL in script.js."
        );
        return;
      }

      const fullNameInput = document.getElementById("fullName");
      const emailInput = document.getElementById("email");
      const attendanceInput = document.getElementById("attendance");
      const messageInput = document.getElementById("message");

      submittedRsvpData = {
        fullName: fullNameInput ? fullNameInput.value.trim() : "",
        email: emailInput ? emailInput.value.trim() : "",
        attendance: attendanceInput ? attendanceInput.value : "",
        message: messageInput ? messageInput.value.trim() : ""
      };

      if (fullNameInput) fullNameInput.value = submittedRsvpData.fullName;
      if (emailInput) emailInput.value = submittedRsvpData.email;
      if (messageInput) messageInput.value = submittedRsvpData.message;

      const submitButton = rsvpForm.querySelector('button[type="submit"]');

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }

      showRsvpStatus("loading", "Submitting your RSVP...");
      rsvpWaitingForResponse = true;

      /* Native form POST to a hidden iframe avoids cross-origin fetch
         problems on GitHub Pages while still allowing Apps Script to
         return a success/duplicate/error result through postMessage. */
      rsvpForm.action = RSVP_WEB_APP_URL;
      rsvpForm.method = "POST";
      rsvpForm.target = rsvpSubmissionFrame.name;
      rsvpForm.acceptCharset = "UTF-8";

      HTMLFormElement.prototype.submit.call(rsvpForm);

      rsvpSubmitTimeout = window.setTimeout(function () {
        if (!rsvpWaitingForResponse) return;

        finishRsvpRequest();
        showRsvpStatus(
          "error",
          "The RSVP request took too long. Please check your internet connection and try again."
        );
      }, 20000);
    });

    window.addEventListener("message", function (event) {
      if (!rsvpWaitingForResponse) return;
      if (event.source !== rsvpSubmissionFrame.contentWindow) return;

      const data = event.data;

      if (!data || data.type !== "wedding-rsvp-response") return;

      finishRsvpRequest();

      if (data.status === "success") {
        const guestName = submittedRsvpData?.fullName || "Guest";
        const attendance = submittedRsvpData?.attendance;

        if (attendance === "yes") {
          showRsvpStatus(
            "success",
            `Thank you, ${guestName}! Your RSVP has been received. We are excited to celebrate with you.`
          );
        } else {
          showRsvpStatus(
            "success",
            `Thank you, ${guestName}. Your RSVP has been received.`
          );
        }

        rsvpForm.reset();
        submittedRsvpData = null;
        return;
      }

      if (data.status === "duplicate") {
        showRsvpStatus(
          "duplicate",
          "An RSVP using this email address has already been submitted. No duplicate entry was added."
        );
        return;
      }

      showRsvpStatus(
        "error",
        data.message || "Your RSVP could not be submitted. Please try again."
      );
    });
  }
});
