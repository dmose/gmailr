/**
    This is the example app using the Gmailr API.
    
    In this file, you have access to the Gmailr object.
 */

"strict";

Gmailr.debug = true; // Turn verbose debugging messages on 

Gmailr.init(function(G) {

    function PageMessages() {
      var self = this;
      var mainTbody = G.mainListingEl().find('tbody');
      
      self.getVisible = function getVisible() {
        return mainTbody.children(':visible');
      }
      
      self.getHidden = function getHidden() {
        return mainTbody.children(':hidden');
      }

      self.ensureMaxVisible = function ensureMaxVisible(max) {
        var visibleMessages = self.getVisible();

        while (visibleMessages.length > max) {
          visibleMessages.last().hide();
          visibleMessages = self.getVisible(); 
        }
      }
      
      self.showAll = function showAll() {
        var hiddenMessages = self.getHidden().show();
      }
      
      return self;
    }
    var pageMessages = new PageMessages();
    
    function MsgCounts() {
      var self = this;
    
 
      return self;
    }
    var msgCounts = new MsgCounts();
    
    function hideCounts() {

      function hideTitleCount() {
        document.title = document.title.replace(/ \(\d+\)/, "");
      }
      
      function hideRange() {
        // spans contain navigation widgets liket "< newer" and "> older",
        // so we keep them, while discarding everything else.       
        $(this).contents().filter(function noticeNonSpans() {
          return this.localName != "span";
        }).remove();
      }

      hideTitleCount();
            
      // hide the "1 - 25 of 500" counter on the right side 
      G.$(".Dj").each(hideRange);
      G.$(".h0").each(hideRange);

      G.$(".J-Ke.n0").each(function logEach(index) {
        // for any folder name that ends with " (43)", remove that
        $(this).text($(this).text().replace(/ \(\d+\)/, ""));
      });
    }

    function onMessagesTriaged() {
      pageMessages.ensureMaxVisible(3);
      hideCounts();
      
      var visibleMessages = pageMessages.getVisible();
      
      if (visibleMessages.length == 0) {
        
        var statusMsg;
        var hiddenMessages = pageMessages.getHidden();
        if (hiddenMessages.length > 0) {
          statusMsg = "You've triaged some messages; nice job! " +
                      " <span style='text-align: right;'>Ready for a few more?</span>";
          // XXX include a button here
        } else {
          statusMsg = "You've triaged all your messages; <b>WAY TO GO!</b>";
        }

        status(statusMsg);
      }
    }
 
    var status = function(msg) {
      G.$('#gmailr #status').html(msg);
    }
    
    function disable() {
      pageMessages.showAll();

      status("&nbsp;");
      
      // XXX need to unhide all the stuff      
      // XXX need to get rid of all the observers      
    }
    
    function startup() {
      G.insertCss(getData('css_path'));
      G.insertTop($("<div id='gmailr'><span id='status'></span>" +
                    "<span id='toggle' style='float:right'>" +
                    "<input id='tzEnabled' type='checkbox' checked/>" +
                    "&nbsp;triage mode enabled</span></div>"));
                    
      G.$("#tzEnabled").bind('click', function (aEvent) {
        if (aEvent.target.checked) {
          enable();
        } else {
          disable();
        }
      });
      
      enable();
    }
    
    function enable() {
  
      pageMessages.ensureMaxVisible(3);

      status("welcome to tZero. Things should feel a bit more managable now.");      

      setupObservers();

      setTimeout(hideCounts, 500);
    }

    function setupObservers() {
      G.observe('viewChanged', function onViewChanged() {
        console.log("viewChanged observer called\n");
        if (G.currentView() == "thread") {
          G.$("#gmailr").show();
        } else {
          G.$("#gmailr").hide();
        }

        // sometimes viewChanged gets called too early for hideCounts to work
        // so give it time to settle
        setTimeout(hideCounts, 500);
        
        // XXX check for zero, reward, offer more
      });
        
      G.observe('archive', function(num) {
        onMessagesTriaged(num);
      });
      G.observe('delete', function(c) {
        onMessagesTriaged(c);
      });
      G.observe('spam', function(c) {
        onMessagesTriaged(c);
      });
      G.observe('compose', function() {
        //status('You composed an email.');
      });
      G.observe('reply', function(c) {
        // status('You replied to an email.');
      });
    }
    
    startup();
});
