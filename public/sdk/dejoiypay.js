/**
 * DejoiY Pay Drop-In Web Checkout SDK v1.0.0
 * Embeddable on any website or e-commerce store
 */
(function (window) {
  'use strict';

  var DejoiYPay = {
    open: function (options) {
      if (!options || !options.amount) {
        console.error('DejoiY Pay: options.amount is required.');
        return;
      }

      var host = options.host || window.location.origin;
      var checkoutUrl = host + '/checkout/' + (options.orderId || 'demo');

      // Create modal overlay
      var overlay = document.createElement('div');
      overlay.id = 'dejoiypay-modal-overlay';
      overlay.style.cssText =
        'position: fixed; inset: 0; z-index: 999999; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;';

      var container = document.createElement('div');
      container.style.cssText =
        'width: 100%; max-width: 440px; height: 90vh; max-height: 700px; background: #ffffff; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; position: relative; display: flex; flex-direction: column;';

      var closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.style.cssText =
        'position: absolute; top: 12px; right: 14px; z-index: 10; border: none; background: rgba(0,0,0,0.5); color: #fff; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 20px; line-height: 26px; text-align: center;';
      closeBtn.onclick = function () {
        document.body.removeChild(overlay);
        if (options.onClose) options.onClose();
      };

      var iframe = document.createElement('iframe');
      iframe.src = checkoutUrl;
      iframe.style.cssText = 'width: 100%; height: 100%; border: none;';

      container.appendChild(closeBtn);
      container.appendChild(iframe);
      overlay.appendChild(container);
      document.body.appendChild(overlay);

      // Listen for message from checkout
      window.addEventListener('message', function (e) {
        if (e.data && e.data.type === 'DEJOIY_PAY_SUCCESS') {
          if (options.onSuccess) options.onSuccess(e.data);
          setTimeout(function () {
            if (document.getElementById('dejoiypay-modal-overlay')) {
              document.body.removeChild(overlay);
            }
          }, 1500);
        }
      });
    },
  };

  window.DejoiYPay = DejoiYPay;
})(window);
