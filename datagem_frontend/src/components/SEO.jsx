import React, { useEffect } from 'react';

export default function SEO({ title, description, path, schema }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    const setMeta = (name, content, isProperty = false) => {
      if (!content) return;
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, true);
      setMeta('twitter:description', description);
    }

    if (title) {
      setMeta('og:title', title, true);
      setMeta('twitter:title', title);
    }

    if (path) {
      const url = `https://www.datagem.app${path}`;
      setMeta('og:url', url, true);
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
    }

    // Structured JSON-LD Data
    if (schema) {
      let script = document.querySelector('script[data-schema="datagem-seo"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-schema', 'datagem-seo');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }
  }, [title, description, path, schema]);

  return null;
}
