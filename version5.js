/* JESUS EMBASSY — FOR ALL NATIONS | Version 5 additions
   This file adds new sections without replacing existing site scripts. */
(function () {
  'use strict';

  const WHATSAPP_NUMBER = '265885914196';
  const BIBLE_GATEWAY_SCRIPT = 'https://classic.biblegateway.com/public/link-to-us/tooltips/bglinks.js';

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function sectionShell(id, eyebrow, title, intro, alternate) {
    const section = el('section', 'je5-section' + (alternate ? ' je5-alt' : ''));
    section.id = id;
    const container = el('div', 'je5-container');
    container.append(el('p', 'je5-eyebrow', eyebrow), el('h2', 'je5-title', title));
    if (intro) container.append(el('p', 'je5-intro', intro));
    section.append(container);
    return { section, container };
  }

  function addNavLinks() {
    const nav = document.querySelector('.nav-links');
    if (!nav) return;
    const cta = nav.querySelector('.nav-cta');
    const links = [
      ['#testimonies', 'Testimonies'],
      ['#giving', 'Giving'],
      ['#v5-social', 'Follow us']
    ];
    links.forEach(([href, label]) => {
      if (nav.querySelector('a[href="' + href + '"]')) return;
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      if (cta) nav.insertBefore(link, cta); else nav.append(link);
    });
  }

  function addTestimonies() {
    if (document.getElementById('testimonies')) return;
    const prayer = document.getElementById('prayer');
    const cms = document.getElementById('cms-content-area');
    const footer = document.querySelector('.site-footer');
    const { section, container } = sectionShell(
      'testimonies', 'YOUR STORY CAN ENCOURAGE SOMEONE', 'Share a testimony',
      'Tell us what God has done in your life. Your testimony will be sent privately to our ministry team for review. It will not be published automatically.', true
    );

    const form = el('form', 'je5-form');
    const nameWrap = el('div');
    const nameLabel = el('label', '', 'Your name (optional)');
    nameLabel.htmlFor = 'je5-testimony-name';
    const name = el('input');
    name.id = 'je5-testimony-name'; name.name = 'name'; name.autocomplete = 'name'; name.maxLength = 100;
    name.placeholder = 'Your name';
    nameWrap.append(nameLabel, name);

    const storyWrap = el('div');
    const storyLabel = el('label', '', 'Your testimony');
    storyLabel.htmlFor = 'je5-testimony-story';
    const story = el('textarea');
    story.id = 'je5-testimony-story'; story.name = 'testimony'; story.rows = 6;
    story.required = true; story.maxLength = 5000;
    story.placeholder = 'Share your testimony here...';
    storyWrap.append(storyLabel, story);

    const consentLabel = el('label', 'je5-consent');
    const consent = el('input'); consent.type = 'checkbox'; consent.required = true;
    const consentText = el('span', '', 'I understand this will be sent to WhatsApp for ministry review only. It will not be published unless the ministry approves it and obtains any required permission from me.');
    consentLabel.append(consent, consentText);

    const submit = el('button', 'je5-button', 'Send testimony for review ↗');
    submit.type = 'submit';
    const note = el('p', 'je5-note', 'WhatsApp will open with your message prepared. Please review it and press Send in WhatsApp. Do not include private information you do not wish to share.');
    form.append(nameWrap, storyWrap, consentLabel, submit, note);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const testimony = story.value.trim();
      if (!testimony) { story.focus(); return; }
      const body = 'Hello JESUS EMBASSY — FOR ALL NATIONS, I would like to submit a testimony for review.\n\nName: ' + (name.value.trim() || 'Not provided') + '\n\nTestimony:\n' + testimony + '\n\nI understand this is for private review and is not automatically published.';
      const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(body);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
    container.append(form);
    const insertBefore = cms || footer;
    if (prayer && prayer.parentNode) prayer.parentNode.insertBefore(section, prayer.nextSibling);
    else if (insertBefore && insertBefore.parentNode) insertBefore.parentNode.insertBefore(section, insertBefore);
    else document.body.append(section);
  }

  function addSocialLinks() {
    if (document.getElementById('v5-social')) return;
    const footer = document.querySelector('.site-footer');
    const { section, container } = sectionShell(
      'v5-social', 'STAY CONNECTED', 'Follow the ministry',
      'Our official social media links will be added here once they are ready. Please use only links published on this official website.', false
    );
    const grid = el('div', 'je5-grid');
    [
      ['YouTube', 'Sermons, teachings and ministry broadcasts.'],
      ['Facebook', 'Ministry updates, events and community news.'],
      ['Instagram', 'Ministry highlights and announcements.'],
      ['TikTok', 'Short teachings and ministry clips.'],
      ['WhatsApp Channel', 'Announcements and ministry updates.']
    ].forEach(([name, description]) => {
      const card = el('article', 'je5-card');
      card.append(el('h3', '', name), el('p', '', description), el('span', 'je5-placeholder', 'Link coming soon'));
      grid.append(card);
    });
    container.append(grid);
    if (footer && footer.parentNode) footer.parentNode.insertBefore(section, footer);
    else document.body.append(section);
  }

  function addGivingPlaceholders() {
    const giving = document.querySelector('.giving-section');
    if (!giving) return;
    if (!giving.id) giving.id = 'giving';
    else if (giving.id !== 'giving' && !document.getElementById('giving')) giving.id = 'giving';
    if (giving.querySelector('.je5-giving-details')) return;
    const details = el('div', 'je5-grid je5-giving-details');
    details.style.marginTop = '24px';
    [
      ['Bank transfer', 'Verified bank and account details will be published here.', 'Details coming soon'],
      ['Airtel Money', 'Verified Airtel Money payment instructions will be published here.', 'Details coming soon'],
      ['TNM Mpamba', 'Verified TNM Mpamba payment instructions will be published here.', 'Details coming soon']
    ].forEach(([title, description, status]) => {
      const card = el('article', 'je5-card');
      card.append(el('h3', '', title), el('p', '', description), el('span', 'je5-placeholder', status));
      details.append(card);
    });
    const container = giving.querySelector('.container') || giving;
    container.append(details);
    const note = el('p', 'je5-note', 'Please do not send money to any number or account claiming to represent this ministry unless the payment details have been verified and published here.');
    container.append(note);
  }

  function loadBibleGateway() {
    let script = document.querySelector('script[data-je5-bible-gateway="true"]');
    if (!script) {
      script = document.createElement('script');
      script.src = BIBLE_GATEWAY_SCRIPT;
      script.type = 'text/javascript';
      script.async = true;
      script.dataset.je5BibleGateway = 'true';
    }

    let linkAttempted = false;
    function linkBibleReferences() {
      if (!window.BGLinks || typeof window.BGLinks.linkVerses !== 'function') return false;
      try {
        window.BGLinks.version = 'NIV';
        window.BGLinks.linkVerses();
        linkAttempted = true;
        return true;
      } catch (error) {
        console.warn('Bible reference linking could not be completed:', error);
        return false;
      }
    }

    if (script.dataset.loaded === 'true') linkBibleReferences();
    else {
      script.addEventListener('load', function () {
        script.dataset.loaded = 'true';
        linkBibleReferences();
      }, { once: true });
      script.addEventListener('error', function () {
        console.warn('Bible Gateway reference tool did not load. Check the internet connection or the external service.');
      }, { once: true });
      if (!script.isConnected) document.head.append(script);
    }

    const cmsArea = document.getElementById('cms-content-area');
    if (cmsArea && 'MutationObserver' in window) {
      let debounce = null;
      const observer = new MutationObserver(function (records) {
        const hasCard = records.some(record => Array.from(record.addedNodes).some(node =>
          node.nodeType === 1 && (node.matches?.('.cms-content-card') || node.querySelector?.('.cms-content-card'))
        ));
        if (!hasCard) return;
        window.clearTimeout(debounce);
        debounce = window.setTimeout(function () {
          observer.disconnect();
          if (!linkBibleReferences() && !linkAttempted) {
            // If the external script is still loading, it will link the page on its load event.
          }
        }, 650);
      });
      observer.observe(cmsArea, { childList: true, subtree: true });
    }
  }

  function init() {
    addNavLinks();
    addTestimonies();
    addGivingPlaceholders();
    addSocialLinks();
    loadBibleGateway();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
