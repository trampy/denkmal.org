/**
 * @class Denkmal_Layout_Default
 * @extends CM_Layout_Abstract
 */
var Denkmal_Layout_Default = CM_Layout_Abstract.extend({

  /** @type String */
  _class: 'Denkmal_Layout_Default',

  /** @type Number */
  chatActivityStamp: null,

  appEvents: {
    'navigate': function() {
      this._setNavigationIndicationVisible(false);
    }
  },

  childrenEvents: {
    'Denkmal_Page_Events ready': function(view) {
      this._bindContentScroll(view, view.$('.scrollable'));
      this._onContentScroll(view.$('.active .scrollable'));
      this._setWeekMenuVisible(true);
    },

    'Denkmal_Page_Events swipe': function(view) {
      this._onContentScroll(view.$('.active .scrollable'));
    },

    'Denkmal_Page_Events destruct': function(view) {
      this.findChild('Denkmal_Component_HeaderBar').setWeekdayMenuVisible(false);
      this._setWeekMenuVisible(false);
    },

    'Denkmal_Page_Now ready': function(view) {
      this._bindContentScroll(view, $(document));
      this._onContentScroll($(document));
      this._setChatIndication(false);
      this._updateChatRead();
    },

    'Denkmal_Page_Add ready': function(view) {
      this._bindContentScroll(view, $(document));
      this._onContentScroll($(document));
    }
  },

  ready: function() {
    this.bindStream('global-internal', cm.model.types.CM_Model_StreamChannel_Message, 'message-create', function(message) {
      var page = this.findPage();
      var isChat = page && page.hasClass('Denkmal_Page_Now');
      if (isChat) {
        this._updateChatRead();
      } else {
        this._setChatIndication(true);
      }
    });

    this._setChatIndicationFromLastActivity(this.chatActivityStamp);
  },

  /**
   * @param {Boolean} state
   */
  _setWeekMenuVisible: function(state) {
    this.findChild('Denkmal_Component_HeaderBar').setWeekdayVisible(state);
  },

  /**
   * @param {CM_View_Abstract} view
   * @param {jQuery} $scrollable
   */
  _bindContentScroll: function(view, $scrollable) {
    var self = this;
    view.bindJquery($scrollable, 'scroll', function(event) {
      self._onContentScroll($(event.currentTarget));
    });
  },

  /**
   * @param {jQuery} $scrollable
   */
  _onContentScroll: function($scrollable) {
    this._setNavigationIndicationVisible($scrollable.scrollTop() <= 20);
  },

  /**
   * @param {Boolean} state
   */
  _setNavigationIndicationVisible: function(state) {
    this.findChild('Denkmal_Component_HeaderBar').setNavigationIndicationVisible(state);
  },

  /**
   * @param {Boolean} state
   */
  _setChatIndication: function(state) {
    this.findChild('Denkmal_Component_HeaderBar').setChatIndication(state);
  },

  /**
   * @param {Number} lastActivityStamp
   */
  _setChatIndicationFromLastActivity: function(lastActivityStamp) {
    var readStamp = cm.storage.get('chatReadStamp');
    if (null == readStamp) {
      readStamp = 0;
    }
    var activityAge = (Math.floor(Date.now() / 1000) - lastActivityStamp);
    this._setChatIndication(lastActivityStamp > readStamp && activityAge < (3600 * 12));
  },

  _updateChatRead: function() {
    var readStamp = Math.floor(Date.now() / 1000);
    cm.storage.set('chatReadStamp', readStamp);
  }
});
