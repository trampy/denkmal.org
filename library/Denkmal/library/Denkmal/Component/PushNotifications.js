/**
 * @class Denkmal_Component_PushNotifications
 * @extends Denkmal_Component_Abstract
 */
var Denkmal_Component_PushNotifications = Denkmal_Component_Abstract.extend({

  /** @type String */
  _class: 'Denkmal_Component_PushNotifications',

  /** @type {Boolean} */
  autoSubscribe: null,

  events: {
    'change .toggleNotifications': function(event) {
      var state = event.currentTarget.checked;
      this.togglePush(state);
    }
  },

  ready: function() {
    if (this._checkSupport()) {
      this.$el.addClass('state-enabled');
      this._updateInputUI();

      var checkSubscription =
        ('granted' === Notification.permission) ||
        ('denied' !== Notification.permission && this.autoSubscribe);

      if (checkSubscription) {
        var self = this;
        this._getPushSubscription().then(function(subscription) {
          cm.debug.log('Push subscription is:', subscription ? 'enabled' : 'disabled');
          self._updateInputUI(!!subscription);
          if (subscription) {
            return self._storePushSubscription(subscription, true);
          } else if (self.autoSubscribe) {
            return self._subscribePush();
          }
        }).catch(function(error) {
          cm.debug.log('Updating push subscription failed:', error);
        });
      }
    }
  },

  /**
   * @param {Boolean} state
   * @returns {Promise}
   */
  togglePush: function(state) {
    this._updateInputUI(state);
    if (state) {
      return this._subscribePush();
    } else {
      return this._unsubscribePush();
    }
  },

  /**
   * @param {Boolean} [hasSubscription]
   */
  _updateInputUI: function(hasSubscription) {
    this.$('.toggleNotifications')
      .prop('disabled', ('denied' === Notification.permission))
      .prop('checked', hasSubscription);
  },

  /**
   * @return {Boolean}
   */
  _checkSupport: function() {
    if (!('serviceWorker' in navigator)) {
      cm.debug.log('ServiceWorker not supported.');
      return false;
    }
    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
      cm.debug.log('Notifications not supported.');
      return false;
    }
    if (!('PushManager' in window)) {
      cm.debug.log('Push messaging not supported.');
      return false;
    }
    return true;
  },

  /**
   * @returns {Promise}
   */
  _subscribePush: function() {
    var self = this;
    return navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
      return serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true}).then(function(subscription) {
        cm.debug.log('Push subscribed:', subscription);
        self._storePushSubscription(subscription, true);
      });
    });
  },

  /**
   * @returns {Promise}
   */
  _unsubscribePush: function() {
    var self = this;
    return this._getPushSubscription().then(function(subscription) {
      if (!subscription) {
        return;
      }

      return subscription.unsubscribe().then(function() {
        cm.debug.log('Push unsubscribed:', subscription);
        self._storePushSubscription(subscription, false);
      });
    });
  },

  /**
   * @returns {Promise}
   */
  _getPushSubscription: function() {
    var self = this;
    return navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
      return serviceWorkerRegistration.pushManager.getSubscription();
    });
  },

  /**
   * @param {PushSubscription} pushSubscription
   * @param {Boolean} state
   * @returns {Promise}
   */
  _storePushSubscription: function(pushSubscription, state) {
    var self = this;
    return this.ajax('storePushSubscription', {
      state: state,
      endpoint: pushSubscription.endpoint,
      user: cm.viewer
    }).then(function() {
      self._updateInputUI(state);
    });
  }
});
