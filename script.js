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
  const daysElement = document.getElementById("days");
  const hoursElement = document.getElementById("hours");
  const minutesElement = document.getElementById("mins");
  const secondsElement = document.getElementById("secs");

  function updateCountdown() {
    if (!daysElement || !hoursElement || !minutesElement || !secondsElement) {
      return;
    }

    const difference = weddingDate - Date.now();

    if (difference <= 0) {
      daysElement.textContent = "000";
      hoursElement.textContent = "00";
      minutesElement.textContent = "00";
      secondsElement.textContent = "00";
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    daysElement.textContent = days.toString().padStart(3, "0");
    hoursElement.textContent = hours.toString().padStart(2, "0");
    minutesElement.textContent = minutes.toString().padStart(2, "0");
    secondsElement.textContent = seconds.toString().padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

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

  /* RSVP FORM */
  const rsvpForm = document.getElementById("rsvpForm");

  if (rsvpForm) {
    rsvpForm.addEventListener("submit", function (event) {
      event.preventDefault();
      alert("Thank you! Your RSVP response has been received.");
      rsvpForm.reset();
    });
  }
});
