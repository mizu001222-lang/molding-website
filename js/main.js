// 몰딩 시공 전문 업체 - 메인 스크립트

// TODO: 구글 시트에 연결한 Apps Script 웹앱 URL로 교체하세요.
// (배포 방법은 Desktop/몰딩/GOOGLE_SHEETS_SETUP.md 참고)
const QUOTE_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzKg_3kklAkIFzpErYlgPXZl60JeKJZSdWM2TzJizjppvEi9uLTpiHG2GCvoRK_pnqy7g/exec';

document.addEventListener('DOMContentLoaded', () => {
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  const counterEls = document.querySelectorAll('.counter');
  if (counterEls.length) {
    const animateCounter = (el) => {
      const target = Number(el.dataset.target) || 0;
      const duration = 1200;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = String(Math.round(target * progress));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counterEls.forEach((el) => counterObserver.observe(el));
  }

  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('hidden') === false;
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const sitePhotoInput = document.getElementById('site-photo');
  const sitePhotoFilenames = document.getElementById('site-photo-filenames');

  if (sitePhotoInput && sitePhotoFilenames) {
    sitePhotoInput.addEventListener('change', () => {
      const names = Array.from(sitePhotoInput.files).map((file) => file.name);
      sitePhotoFilenames.textContent = names.length ? `첨부된 파일: ${names.join(', ')}` : '';
    });
  }

  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(quoteForm);
      const payload = {
        name: formData.get('name') || '',
        phone: formData.get('phone') || '',
        area: formData.get('area') || '',
        serviceType: formData.getAll('serviceType').join(', '),
        message: formData.get('message') || '',
        // 실제 사진 파일은 전송하지 않고 파일명만 기록합니다.
        photoNames: sitePhotoInput ? Array.from(sitePhotoInput.files).map((f) => f.name).join(', ') : '',
        submittedAt: new Date().toISOString(),
      };

      const submitBtn = quoteForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        // Apps Script 웹앱은 CORS 응답을 주지 않으므로 no-cors로 전송합니다.
        // (요청 성공 여부는 응답으로 확인할 수 없어, 네트워크 에러만 걸러냅니다.)
        await fetch(QUOTE_FORM_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        alert('견적 신청이 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.');
        quoteForm.reset();
        if (sitePhotoFilenames) sitePhotoFilenames.textContent = '';
      } catch (error) {
        alert('전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
});
